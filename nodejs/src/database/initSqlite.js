import { Sqlite, createDatabase } from './sqlite.js';
import { loadJson, saveJson } from 'jnj-lib-base';
import { getAllSchemas } from './common.js';
import { JSON_DB_DIR } from '../env.js';
import { mapYoutubePbCollection } from '../graphql/youtube/mapsTypeDb.js';

const idFromType = (typeName) => {
  return mapYoutubePbCollection[typeName].id;
};

const collectionFromType = (typeName) => {
  return mapYoutubePbCollection[typeName].collection;
};

const dataFromDb = (typeName, data) => {
  return {
    ...data,
    id: data[idFromType(typeName)],
  };
};

const dataFromType = (type, data) => {
  const { [idFromType(type)]: id, ...rest } = data;
  return { [idFromType(type)]: id, ...rest };
};

const createDatabaseSqlite = async (dbs = ['youtube']) => {
  for (const db of dbs) {
    await createDatabase(db);
  }
};

const createTables = async (dbName = 'youtube') => {
  const schemas = getAllSchemas(dbName);
  console.log(schemas);
  for (const schema of schemas) {
    sqlite.createTableFromSchema(schema);
  }
};

const populateDatabase = async (dbName = 'youtube') => {
  sqlite.upsert(tableName, data, uniqueFields);
  console.log(schemas);
};

// const schemas = getSchema('youtube', 'youtube');
// sqlite.createTableFromSchema(schema);

export { createDatabaseSqlite };

// * sqlite 인스턴스 생성
const dbName = 'youtube';
const sqlite = new Sqlite(dbName);

// // * 테이블 생성
// await createTables('youtube')

// // * populate database
// const tableName = 'users';
// const uniqueFields = 'userId';
// const data = loadJson(`${JSON_DB_DIR}/youtube/users.json`);
// const data2 = data.map(item => {
//     const { id, ...rest } = item;
//     return { userId: id, ...rest }
// });
// console.log(data2);
// sqlite.upsert(tableName, data2, uniqueFields);

// * populate youtubeSubscriptions
// const tableName = 'subscriptions';
// // const uniqueFields = ['userId', 'channelId'];
// const userId = 'mooninlearn';
// const data = loadJson(`${JSON_DB_DIR}/youtube/channels.json`)[userId];
// console.log(data);
// const data2 = data.map(item => {
//     const { id } = item;
//     return { subscriptionId: `${userId}_${id}`, userId, channelId: id }
// });
// // console.log(data2);
// saveJson(`${JSON_DB_DIR}/youtube/subscriptions.json`, data2);
// sqlite.upsert(tableName, data2, 'subscriptionId');

// // * populate youtubeChannels
// const tableName = 'channels';
// const uniqueFields = 'channelId';
// const data = loadJson(`${JSON_DB_DIR}/youtube/channels.json`);
// console.log(data);
// const data2 = data.map(item => {
//     const { id, ...rest } = item;
//     return { channelId: id, ...rest }
// });
// sqlite.upsert(tableName, data2, uniqueFields);
