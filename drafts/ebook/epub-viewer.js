import EPub from 'epub';
import fs from 'fs';
import path from 'path';
import cheerio from 'cheerio';
import express from 'express';

class EpubViewer {
    constructor(epubPath) {
        this.epub = new EPub(epubPath);
        this.app = express();
        this.setupServer();
    }

    // EPUB 파일 로드
    async load() {
        return new Promise((resolve, reject) => {
            this.epub.parse();
            this.epub.on('end', () => {
                console.log('EPUB 로드 완료:', this.epub.metadata);
                resolve();
            });
            this.epub.on('error', reject);
        });
    }

    // 목차 가져오기
    getToc() {
        return this.epub.toc;
    }

    // 특정 챕터 내용 가져오기
    async getChapter(chapterId) {
        return new Promise((resolve, reject) => {
            this.epub.getChapter(chapterId, (error, text) => {
                if (error) {
                    reject(error);
                } else {
                    // HTML 콘텐츠 정리
                    const $ = cheerio.load(text);
                    // 이미지 경로 수정
                    $('img').each((i, elem) => {
                        const src = $(elem).attr('src');
                        if (src) {
                            $(elem).attr('src', `/images/${path.basename(src)}`);
                        }
                    });
                    resolve($.html());
                }
            });
        });
    }

    // 웹 서버 설정
    setupServer() {
        // 정적 파일 제공
        this.app.use('/images', express.static(path.join(process.cwd(), 'extracted_images')));

        // 메인 페이지
        this.app.get('/', async (req, res) => {
            try {
                await this.load();
                const toc = this.getToc();
                res.send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>${this.epub.metadata.title}</title>
                        <style>
                            body { 
                                font-family: Arial, sans-serif;
                                max-width: 800px;
                                margin: 0 auto;
                                padding: 20px;
                            }
                            .toc { margin-bottom: 20px; }
                            .content { 
                                border: 1px solid #ddd;
                                padding: 20px;
                            }
                        </style>
                    </head>
                    <body>
                        <h1>${this.epub.metadata.title}</h1>
                        <div class="toc">
                            ${toc.map(item => `
                                <div>
                                    <a href="/chapter/${item.id}">${item.title}</a>
                                </div>
                            `).join('')}
                        </div>
                    </body>
                    </html>
                `);
            } catch (error) {
                res.status(500).send(error.message);
            }
        });

        // 챕터 페이지
        this.app.get('/chapter/:id', async (req, res) => {
            try {
                const content = await this.getChapter(req.params.id);
                res.send(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>${this.epub.metadata.title}</title>
                        <style>
                            body { 
                                font-family: Arial, sans-serif;
                                max-width: 800px;
                                margin: 0 auto;
                                padding: 20px;
                            }
                            .nav { margin-bottom: 20px; }
                            .content { 
                                border: 1px solid #ddd;
                                padding: 20px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="nav">
                            <a href="/">목차로 돌아가기</a>
                        </div>
                        <div class="content">
                            ${content}
                        </div>
                    </body>
                    </html>
                `);
            } catch (error) {
                res.status(500).send(error.message);
            }
        });
    }

    // 서버 시작
    start(port = 3000) {
        this.app.listen(port, () => {
            console.log(`EPUB 뷰어가 http://localhost:${port} 에서 실행 중입니다.`);
        });
    }
}

// 사용 예시
const viewer = new EpubViewer('./path/to/your/book.epub');
viewer.start();