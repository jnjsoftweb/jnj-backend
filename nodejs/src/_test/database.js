import { loadJson } from 'jnj-lib-base';
import { DB_SCHEMA_DIR, JSON_DB_DIR } from '../../env.js';
import pocketbaseDB from '../database/pocketbase.js';

// 또는 특정 URL 사용
// import { createPocketBaseDB } from './pocketbase.js';

// 특정 URL로 새 인스턴스 생성
// const customPB = await createPocketBaseDB('http://custom-url:8090');
// const pb = await createPocketBaseDB();
// console.log(await pocketbaseDB.findOne('youtubeChannel', { filter: 'channelId="UC-9-kyTW8ZkZNDHQJ6FgpwQ__"' }));

// console.log(await pocketbaseDB.find('youtubeChannel', {
//     filter: 'channelId = "UC-9-kyTW8ZkZNDHQJ6FgpwQ__"'
// }));

// // * generate collections from schema
// const schemaPath = `${DB_SCHEMA_DIR}/youtube.json`;
// await pocketbaseDB.createCollectionsFromSchema(schemaPath);

// * insert data to collections
const getJsonData = (colName, dbName = 'youtube') => {
  const dataPath = `${JSON_DB_DIR}/${dbName}/${colName}.json`;
  return loadJson(dataPath);
};

const populateData = async (colName, dbName = 'youtube') => {
  await pocketbaseDB.insert(colName, getJsonData(colName, dbName));
};

const colName = 'youtubeUsers';
populateData(colName);

// await pocketbaseDB.insert(colName, getJsonData(colName));
