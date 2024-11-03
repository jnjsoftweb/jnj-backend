import PocketBase from 'pocketbase';
import { loadJson } from 'jnj-lib-base';
import {
  APP_ROOT,
  APP_URL_ROOT,
  POCKETBASE_PORT,
  POCKETBASE_ADMIN_EMAIL,
  POCKETBASE_ADMIN_PASSWORD,
  JSON_DB_DIR,
} from '../utils/settings.js';

class PocketBaseDB {
  static instance = null;

  constructor() {
    if (PocketBaseDB.instance) {
      return PocketBaseDB.instance;
    }

    this.url = `${APP_URL_ROOT}:${POCKETBASE_PORT}`;
    this.pb = new PocketBase(this.url);
    // this.jsonPath = (fileName) => `${JSON_DB_DIR}/youtube/${fileName}.json`;
    // this.schemaPbPath = (fileName) => `${APP_ROOT}/db/pocketbase/schema/${fileName}.json`;
    
    PocketBaseDB.instance = this;
  }

  static async getInstance() {
    if (!PocketBaseDB.instance) {
      const instance = new PocketBaseDB();
      await instance.initialize();
      PocketBaseDB.instance = instance;
    }
    return PocketBaseDB.instance;
  }

  async initialize() {
    try {
      await this.pb.admins.authWithPassword(
        POCKETBASE_ADMIN_EMAIL,
        POCKETBASE_ADMIN_PASSWORD
      );
      console.log('Authentication successful');
      return this;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  async createCollection(schema) {
    try {
      console.log('Creating collection with schema:', JSON.stringify(schema, null, 2));
      const collection = await this.pb.collections.create(schema);
      console.log(`컬렉션 ${collection.name} 생성 완료`);
      return collection;
    } catch (error) {
      console.error('컬렉션 생성 실패:', {
        status: error.status,
        message: error.message,
        response: error.response,
        data: error.response?.data,
      });
      throw error;
    }
  }

  async createCollectionAll(schemas) {
    if (!Array.isArray(schemas)) {
      throw new Error('Schemas must be an array');
    }

    console.log(`Creating ${schemas.length} collections...`);
    const results = [];
    for (const schema of schemas) {
      const result = await this.createCollection(schema);
      results.push(result);
    }
    return results;
  }

  async findOne(collectionName, filter) {
    try {
      return await this.pb.collection(collectionName).getFirstListItem(filter);
    } catch (error) {
      console.error('조회 실패:', error);
      return null;
    }
  }

  async find(collectionName, options = {}) {
    const { filter, sort, expand, fields, skipTotal, page, perPage } = options;
    const queryOptions = {
      ...(filter && { filter }),
      ...(sort && { sort }),
      ...(expand && { expand }),
      ...(fields && { fields }),
      ...(skipTotal && { skipTotal }),
      ...(page && { page }),
      ...(perPage && { perPage }),
    };
    return await this.pb.collection(collectionName).getFullList(queryOptions);
  }

  async insertOne(collectionName, data) {
    return await this.pb.collection(collectionName).create(data);
  }

  async insert(collectionName, datas) {
    const results = [];
    for (const data of datas) {
      const result = await this.insertOne(collectionName, data);
      results.push(result);
    }
    return results;
  }

  async update(collectionName, id, data) {
    return await this.pb.collection(collectionName).update(id, data);
  }

  async upsertOne(collectionName, data, uniqueFields) {
    try {
      const fields = uniqueFields.split(',').map(field => field.trim());
      const filterConditions = fields.map(field => `${field}="${data[field]}"`);
      const filter = filterConditions.join(' && ');

      let existingRecord = await this.findOne(collectionName, filter);

      if (existingRecord) {
        console.log(`Updating record in ${collectionName} with conditions: ${filter}`);
        return await this.update(collectionName, existingRecord.id, data);
      } else {
        console.log(`Creating new record in ${collectionName} with conditions: ${filter}`);
        return await this.insertOne(collectionName, data);
      }
    } catch (error) {
      console.error('Upsert failed:', error);
      throw error;
    }
  }

  async upsert(collectionName, dataArray, uniqueFields) {
    const results = [];
    for (const data of dataArray) {
      try {
        const result = await this.upsertOne(collectionName, data, uniqueFields);
        results.push(result);
      } catch (error) {
        console.error(`Failed to upsert record with ${uniqueFields}: ${data[uniqueFields]}`, error);
        results.push(null);
      }
    }
    return results;
  }

  async delete(collectionName, filter) {
    try {
      const records = await this.find(collectionName, { filter });
      
      if (!records || records.length === 0) {
        console.log(`No records found in ${collectionName} with filter: ${filter}`);
        return [];
      }

      const results = await Promise.all(
        records.map(async (record) => {
          try {
            await this.pb.collection(collectionName).delete(record.id);
            return { id: record.id, success: true };
          } catch (error) {
            console.error(`Failed to delete record ${record.id}:`, error);
            return { id: record.id, success: false, error };
          }
        })
      );

      console.log(`Deleted ${results.filter(r => r.success).length} records from ${collectionName}`);
      return results;
    } catch (error) {
      console.error('Delete operation failed:', error);
      throw error;
    }
  }

  async populate(collectionName, data, uniqueFields) {
    return await this.upsert(collectionName, data, uniqueFields);
  }

//   async populateYoutubeChannel(jsonFileName = 'channelsInSubscriptions', userId = 'mooninlearn', collectionName = 'youtubeChannel') {
//     const data = loadJson(this.jsonPath(jsonFileName))[userId];
//     const results = [];
    
//     for (let item of data) {
//       const { id, ...rest } = item;
//       const newItem = {
//         channelId: id,
//         ...rest,
//       };
//       const result = await this.insertOne(collectionName, newItem);
//       results.push(result);
//     }
    
//     return results;
//   }

  convertSchema(schema) {
    if (!Array.isArray(schema)) {
      throw new Error('Schema must be an array');
    }

    return schema.map(table => {
      const fields = Object.entries(table.properties)
        .filter(([key]) => key !== 'id') // id 필드 제외
        .map(([name, prop]) => {
          const field = {
            name,
            type: this._convertType(prop.type, prop.format),
            required: table.required?.includes(name) || false
          };

          // 추가 옵션 설정
          if (prop.default !== undefined) {
            field.options = { ...field.options, default: prop.default };
          }

          if (prop.unique) {
            field.options = { ...field.options, unique: true };
          }

          if (prop.items && prop.type === 'array') {
            field.options = { 
              ...field.options, 
              maxSize: 2000 // JSON 필드의 기본 최대 크기
            };
          }

          return field;
        });

      return {
        name: table.title,
        type: 'base',
        description: table.description || `${table.title} Information`,
        schema: fields
      };
    });
  }

  _convertType(type, format) {
    switch (type) {
      case 'string':
        if (format === 'date-time') return 'date';
        if (format === 'email') return 'email';
        return 'text';
      case 'integer':
      case 'number':
        return 'number';
      case 'boolean':
        return 'bool';
      case 'array':
        return 'json';
      default:
        return 'text';
    }
  }

  async createCollectionsFromSchema(schemaPath) {
    try {
      const schema = loadJson(schemaPath);
      const pbSchema = this.convertSchema(schema);
      return await this.createCollectionAll(pbSchema);
    } catch (error) {
      console.error('Failed to create collections from schema:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export default await PocketBaseDB.getInstance();
