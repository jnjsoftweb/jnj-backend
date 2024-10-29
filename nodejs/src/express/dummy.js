// [API Reference](https://developers.google.com/youtube/v3/docs?hl=ko)

import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { loadJson } from 'jnj-lib-base';
import { fileURLToPath } from 'url';

// .env 파일 로드
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
console.log('NEXT_PUBLIC_EXPRESS_PORT: ', process.env.NEXT_PUBLIC_EXPRESS_PORT);

// * const 설정
const PORT = process.env.NEXT_PUBLIC_EXPRESS_PORT || 3006;
const APP_ROOT = process.env.APP_ROOT;
const DB_FOLDER = process.env.DB_FOLDER;
const JSON_DB_DIR = `${APP_ROOT}/${DB_FOLDER}/json`;

// console.log('JSON_DB_DIR: ', JSON_DB_DIR);

// app 설정
const app = express();
app.use(cors());
app.use(express.json());

// * routers
app.get('/subscriptions', async (req, res) => {
  try {
    const subscriptions = loadJson(`${JSON_DB_DIR}/subscriptions.json`);
    console.log('subscriptions: ', subscriptions);
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch captions' });
  }
});

app.get('/search', async (req, res) => {
  try {
    const results = loadJson(`${JSON_DB_DIR}/searchResults.json`);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch captions' });
  }
});

// * 서버 실행
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
