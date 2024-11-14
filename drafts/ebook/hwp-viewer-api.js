import axios from 'axios';

class HwpWebViewer {
    constructor(apiKey, secretKey) {
        this.apiKey = apiKey;
        this.secretKey = secretKey;
        this.baseUrl = 'https://api.hancom.com/hwp/v1';
    }

    async getAccessToken() {
        try {
            const response = await axios.post(`${this.baseUrl}/token`, {
                apiKey: this.apiKey,
                secretKey: this.secretKey
            });
            return response.data.accessToken;
        } catch (error) {
            console.error('토큰 발급 실패:', error);
            throw error;
        }
    }

    async convertToPdf(hwpFilePath) {
        try {
            const token = await this.getAccessToken();
            
            // 파일 업로드
            const formData = new FormData();
            formData.append('file', fs.createReadStream(hwpFilePath));
            
            const response = await axios.post(`${this.baseUrl}/convert/pdf`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data.pdfUrl;
        } catch (error) {
            console.error('변환 실패:', error);
            throw error;
        }
    }

    async getDocumentInfo(hwpFilePath) {
        try {
            const token = await this.getAccessToken();
            
            const formData = new FormData();
            formData.append('file', fs.createReadStream(hwpFilePath));
            
            const response = await axios.post(`${this.baseUrl}/document/info`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            return response.data;
        } catch (error) {
            console.error('문서 정보 조회 실패:', error);
            throw error;
        }
    }
}