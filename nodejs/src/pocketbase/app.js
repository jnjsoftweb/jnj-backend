import PocketBase from 'pocketbase';
import {
  APP_ROOT,
  APP_URL_ROOT,
  POCKETBASE_PORT,
  POCKETBASE_ADMIN_EMAIL,
  POCKETBASE_ADMIN_PASSWORD,
  JSON_DB_DIR,
} from '../utils/settings.js';
// import youtubeSchema from './schema/youtube.json' assert { type: 'json' };
import { loadJson } from 'jnj-lib-base';

const jsonPath = (fileName) => `${JSON_DB_DIR}/youtube/${fileName}.json`;
const schemaPbPath = (fileName) => `${APP_ROOT}/db/pocketbase/schema/${fileName}.json`;

const youtubeSchema = loadJson(schemaPbPath('youtube'));

// console.log(schemaPbPath('youtube'));
// console.log(youtubeSchema);

const url = `${APP_URL_ROOT}:${POCKETBASE_PORT}`;
const pb = new PocketBase(url);
// 관리자 인증
const authData = await pb.admins.authWithPassword(
  POCKETBASE_ADMIN_EMAIL,
  POCKETBASE_ADMIN_PASSWORD
);

const createCollection = async (schema) => {
  try {
    console.log(
      'Creating collection with schema:',
      JSON.stringify(schema, null, 2)
    );

    console.log('Authentication successful');

    // youtubeChannel 컬렉션 생성
    const collection = await pb.collections.create(schema);
    console.log(`컬렉션 ${collection.name} 생성 완료`);
  } catch (error) {
    console.error('컬렉션 생성 실패:', {
      status: error.status,
      message: error.message,
      response: error.response,
      data: error.response?.data,
    });

    if (error.response?.data?.schema) {
      console.error('Schema validation errors:', error.response.data.schema);
    }
  }
};

const createCollectionAll = async (schemas) => {
  if (!Array.isArray(schemas)) {
    console.error('Schemas must be an array');
    return;
  }

  console.log(`Creating ${schemas.length} collections...`);

  for (const schema of schemas) {
    await createCollection(schema);
  }
};

const populateYoutubeChannel = async (
  jsonFileName = 'channelsInSubscriptions',
  userId = 'mooninlearn',
  collectionName = 'youtubeChannel'
) => {
  const data = loadJson(jsonPath(jsonFileName))[userId];
  for (let item of data) {
    const { id, ...rest } = item; // id를 분리하고 나머지 데이터 추출
    item = {
      channelId: id, // id를 channelId로 변경
      ...rest, // 나머지 데이터는 그대로 유지
    };

    await pb.collection(collectionName).create(item);
  }
};

const pbFindOne = async (collectionName, filter) => {
  try{
    const data = await pb.collection(collectionName).getFirstListItem(filter);
    return data;
  } catch (error) {
    console.error('조회 실패:', {
      status: error.status,
      message: error.message,
      response: error.response,
      data: error.response?.data,
    });
    return {};
  }
};

const pbFind = async (collectionName, options = {}) => {
  const { filter, sort, expand, fields, skipTotal, page, perPage } = options;
  
  const queryOptions = {
    ...(filter && { filter }),
    ...(sort && { sort }),
    ...(expand && { expand }),
    ...(fields && { fields }),
    ...(skipTotal && { skipTotal }),
    ...(page && { page }),
    ...(perPage && { perPage })
  };

  return await pb.collection(collectionName).getFullList(queryOptions);
};

const pbInsertOne = async (collectionName, data) => {
  await pb.collection(collectionName).create(data);
};

const pbInsert = async (collectionName, datas) => {
  for (let data of datas) {
    await pb.collection(collectionName).create(data);
  }
};

const pbUpdate = async (collectionName, id, data) => {
  await pb.collection(collectionName).update(id, data);
};

export { pb, pbFindOne, pbFind, pbInsertOne, pbInsert, pbUpdate, createCollection, createCollectionAll, populateYoutubeChannel };

// createCollectionAll(youtubeSchema);
// populateYoutubeChannel();
