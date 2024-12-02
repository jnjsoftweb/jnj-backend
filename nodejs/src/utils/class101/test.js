import fs from 'fs/promises';
import * as cheerio from 'cheerio';
// import cheerio from 'cheerio';
import path from 'path';

const URL_CATEGORIES = 'https://class101.net/ko/categories';
const CLASS101_JSON_ROOT =
  'C:/JnJ-soft/Projects/internal/jnj-backend/db/json/class101';
const CLASS101_HTML_ROOT =
  'C:/JnJ-soft/Projects/internal/jnj-backend/db/html/class101';
const CATEGORIES_JSON_PATH = `${CLASS101_JSON_ROOT}/categories.json`;
const PRODUCTS_JSON_PATH = `${CLASS101_JSON_ROOT}/products.json`;

async function parseNextData(htmlPath) {
    try {
        // HTML 파일 읽기
        const html = await fs.readFile(htmlPath, 'utf-8');
        
        // cheerio로 HTML 파싱
        const $ = cheerio.load(html);
        
        // __NEXT_DATA__ 스크립트 찾기
        const nextDataScript = $('#__NEXT_DATA__');
        
        if (!nextDataScript.length) {
            throw new Error('__NEXT_DATA__ 스크립트를 찾을 수 없습니다.');
        }

        // JSON 파싱
        const jsonData = JSON.parse(nextDataScript.html());
        
        // 결과 파일 저장
        const outputPath = path.join(
            path.dirname(htmlPath),
            path.basename(htmlPath, '.html') + '_next_data.json'
        );
        
        await fs.writeFile(
            outputPath,
            JSON.stringify(jsonData, null, 2),
            'utf-8'
        );

        console.log(`JSON 파일이 저장되었습니다: ${outputPath}`);
        return jsonData;

    } catch (error) {
        console.error('에러 발생:', error);
        throw error;
    }
}

// 사용 예시
// const htmlPath = `${CLASS101_HTML_ROOT}/categories_6220895c9dede0214b0783bf.html`
// parseNextData(htmlPath);

// const htmlPath = `${CLASS101_HTML_ROOT}/products_5e4a296c9312d24ddac7158b.html`
// parseNextData(htmlPath);

const htmlPath = `${CLASS101_HTML_ROOT}/categories.html`
parseNextData(htmlPath);