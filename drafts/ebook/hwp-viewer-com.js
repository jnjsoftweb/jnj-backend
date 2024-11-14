import { exec } from 'child_process';
import win32com from 'win32com'; // node-win32com 패키지 필요

class HwpViewer {
    constructor() {
        // COM 객체 생성
        this.hwp = new win32com.Object('HWPFrame.HwpObject.1');
    }

    async openDocument(filePath) {
        try {
            // 한/글 문서 열기
            this.hwp.Open(filePath);
            
            // 문서 정보 가져오기
            const pageCount = this.hwp.PageCount;
            const title = this.hwp.GetFieldText('Title');
            
            return { pageCount, title };
        } catch (error) {
            console.error('문서 열기 실패:', error);
            throw error;
        }
    }

    async saveToPdf(outputPath) {
        try {
            // PDF로 저장
            this.hwp.SaveAs(outputPath, 'PDF');
        } catch (error) {
            console.error('PDF 변환 실패:', error);
            throw error;
        }
    }

    close() {
        // COM 객체 해제
        this.hwp.Quit();
    }
}