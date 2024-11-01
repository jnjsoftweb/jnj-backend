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

const APP_URL_ROOT = process.env.NEXT_PUBLIC_APP_URL_ROOT;
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

// * POCKETBASE
const POCKETBASE_PORT = process.env.NEXT_PUBLIC_POCKETBASE_PORT;
const POCKETBASE_ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL;
const POCKETBASE_ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD;

// * ilmac
const ILMAC_DB = {
  host: process.env.ILMAC_DB_HOST,
  port: process.env.ILMAC_DB_PORT
    ? parseInt(process.env.ILMAC_DB_PORT, 10)
    : undefined,
  user: process.env.ILMAC_DB_USER,
  password: process.env.ILMAC_DB_PASS,
  database: process.env.ILMAC_DB_SCHEMA,
};

export {
  API_KEY,
  API_URL,
  APP_URL_ROOT,
  GRAPHQL_PORT,
  EXPRESS_PORT,
  POCKETBASE_PORT,
  POCKETBASE_ADMIN_EMAIL,
  POCKETBASE_ADMIN_PASSWORD,
  JSON_DB_DIR,
  BASE_DOWN_DIR,
  DEFAULT_EXE_PATH,
  DEFAULT_USER_DATA_DIR,
  NOTION_API_KEY,
  ILMAC_DB,
};
