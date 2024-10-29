import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// .env 파일 로드
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// const 설정
const API_KEY = process.env.GOOGLE_API_KEY;
const API_URL = process.env.GOOGLE_API_URL;
const EXPRESS_PORT = process.env.NEXT_PUBLIC_EXPRESS_PORT || 3006;
const GRAPHQL_PORT = process.env.NEXT_PUBLIC_GRAPHQL_PORT || 3007;
const APP_ROOT = process.env.APP_ROOT;
const DB_FOLDER = process.env.DB_FOLDER;
const JSON_DB_DIR = `${APP_ROOT}/${DB_FOLDER}/json`;

// console.log(JSON_DB_DIR);

const BASE_DOWN_DIR = process.env.BASE_DOWN_DIR;
const DEFAULT_EXE_PATH = process.env.DEFAULT_EXE_PATH;
const DEFAULT_USER_DATA_DIR = process.env.DEFAULT_USER_DATA_DIR;

const NOTION_API_KEY = process.env.NOTION_API_KEY;

export {
  API_KEY,
  API_URL,
  GRAPHQL_PORT,
  EXPRESS_PORT,
  JSON_DB_DIR,
  BASE_DOWN_DIR,
  DEFAULT_EXE_PATH,
  DEFAULT_USER_DATA_DIR,
  NOTION_API_KEY,
};
