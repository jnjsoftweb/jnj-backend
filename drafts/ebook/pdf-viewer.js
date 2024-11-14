import express from 'express';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

class PdfViewer {
    constructor(pdfPath) {
        this.pdfPath = pdfPath;
        this.app = express();
        this.setupServer();
    }

    async loadPdf() {
        try {
            const pdfBuffer = await fs.readFile(this.pdfPath);
            const pdfDoc = await PDFDocument.load(pdfBuffer);
            return pdfDoc;
        } catch (error) {
            console.error('PDF 로드 중 오류:', error);
            throw error;
        }
    }

    setupServer() {
        // 정적 파일 제공
        this.app.use('/static', express.static(path.join(process.cwd(), 'public')));

        // PDF 파일 제공
        this.app.get('/pdf', async (req, res) => {
            try {
                const pdfBuffer = await fs.readFile(this.pdfPath);
                res.contentType('application/pdf');
                res.send(pdfBuffer);
            } catch (error) {
                res.status(500).send(error.message);
            }
        });

        // 메인 페이지
        this.app.get('/', async (req, res) => {
            try {
                const pdfDoc = await this.loadPdf();
                const pageCount = pdfDoc.getPageCount();

                res.send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>PDF 뷰어</title>
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
                        <style>
                            body {
                                margin: 0;
                                padding: 20px;
                                font-family: Arial, sans-serif;
                            }
                            #controls {
                                position: fixed;
                                top: 0;
                                left: 0;
                                right: 0;
                                padding: 10px;
                                background: #f0f0f0;
                                border-bottom: 1px solid #ddd;
                                display: flex;
                                gap: 10px;
                                align-items: center;
                            }
                            #viewer {
                                margin-top: 60px;
                            }
                            .page {
                                margin-bottom: 20px;
                                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                            }
                            canvas {
                                max-width: 100%;
                                height: auto;
                            }
                        </style>
                    </head>
                    <body>
                        <div id="controls">
                            <button id="prev">이전</button>
                            <span id="page-info">페이지: <span id="current">1</span> / ${pageCount}</span>
                            <button id="next">다음</button>
                            <input type="number" id="page-input" min="1" max="${pageCount}" value="1">
                            <button id="go">이동</button>
                            <select id="zoom">
                                <option value="0.5">50%</option>
                                <option value="1" selected>100%</option>
                                <option value="1.5">150%</option>
                                <option value="2">200%</option>
                            </select>
                        </div>
                        <div id="viewer"></div>

                        <script>
                            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

                            let currentPage = 1;
                            let pdfDoc = null;
                            let scale = 1;

                            // PDF 로드
                            pdfjsLib.getDocument('/pdf').promise.then(doc => {
                                pdfDoc = doc;
                                renderPage(currentPage);
                            });

                            // 페이지 렌더링
                            async function renderPage(num) {
                                const page = await pdfDoc.getPage(num);
                                const viewport = page.getViewport({ scale });
                                const canvas = document.createElement('canvas');
                                const context = canvas.getContext('2d');
                                canvas.height = viewport.height;
                                canvas.width = viewport.width;

                                const renderContext = {
                                    canvasContext: context,
                                    viewport: viewport
                                };

                                await page.render(renderContext).promise;
                                
                                const viewer = document.getElementById('viewer');
                                viewer.innerHTML = '';
                                viewer.appendChild(canvas);
                                
                                document.getElementById('current').textContent = num;
                                currentPage = num;
                            }

                            // 이벤트 리스너
                            document.getElementById('prev').addEventListener('click', () => {
                                if (currentPage > 1) {
                                    renderPage(currentPage - 1);
                                }
                            });

                            document.getElementById('next').addEventListener('click', () => {
                                if (currentPage < pdfDoc.numPages) {
                                    renderPage(currentPage + 1);
                                }
                            });

                            document.getElementById('go').addEventListener('click', () => {
                                const num = parseInt(document.getElementById('page-input').value);
                                if (num >= 1 && num <= pdfDoc.numPages) {
                                    renderPage(num);
                                }
                            });

                            document.getElementById('zoom').addEventListener('change', (e) => {
                                scale = parseFloat(e.target.value);
                                renderPage(currentPage);
                            });
                        </script>
                    </body>
                    </html>
                `);
            } catch (error) {
                res.status(500).send(error.message);
            }
        });
    }

    start(port = 3000) {
        this.app.listen(port, () => {
            console.log(`PDF 뷰어가 http://localhost:${port} 에서 실행 중입니다.`);
        });
    }
}

export { PdfViewer };