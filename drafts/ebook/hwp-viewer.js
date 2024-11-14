import express from 'express';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import { PdfViewer } from './pdf-viewer.js';  // 이전에 만든 PDF 뷰어 활용

class HwpViewer {
    constructor(hwpPath) {
        this.hwpPath = hwpPath;
        this.app = express();
        this.pdfPath = hwpPath.replace('.hwp', '.pdf');
        this.setupServer();
    }

    // HWP를 PDF로 변환 (예: hwp2pdf 또는 한글과컴퓨터 변환 도구 사용)
    async convertToPdf() {
        return new Promise((resolve, reject) => {
            // 여기서는 예시로 hwp2pdf 사용
            // 실제로는 한글과컴퓨터의 변환 도구나 다른 방법을 사용해야 합니다
            exec(`hwp2pdf ${this.hwpPath} ${this.pdfPath}`, (error) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(this.pdfPath);
            });
        });
    }

    setupServer() {
        // 정적 파일 제공
        this.app.use('/static', express.static(path.join(process.cwd(), 'public')));

        // 메인 페이지
        this.app.get('/', async (req, res) => {
            try {
                // HWP를 PDF로 변환
                await this.convertToPdf();
                
                // PDF 뷰어로 표시
                const pdfViewer = new PdfViewer(this.pdfPath);
                pdfViewer.setupServer();
                
                // PDF 뷰어 페이지로 리다이렉트
                res.redirect('/pdf-viewer');
            } catch (error) {
                res.status(500).send(`변환 오류: ${error.message}`);
            }
        });

        // 원본 HWP 파일 다운로드
        this.app.get('/download', async (req, res) => {
            try {
                const hwpBuffer = await fs.readFile(this.hwpPath);
                res.setHeader('Content-Type', 'application/x-hwp');
                res.setHeader('Content-Disposition', `attachment; filename="${path.basename(this.hwpPath)}"`);
                res.send(hwpBuffer);
            } catch (error) {
                res.status(500).send(error.message);
            }
        });
    }

    start(port = 3000) {
        this.app.listen(port, () => {
            console.log(`HWP 뷰어가 http://localhost:${port} 에서 실행 중입니다.`);
        });
    }
}

export { HwpViewer };