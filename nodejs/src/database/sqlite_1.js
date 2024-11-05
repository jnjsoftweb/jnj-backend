import sqlite3 from 'sqlite3';
import fs from 'fs';
import { DB_SCHEMA_DIR, SQLITE_DB_DIR } from '../utils/settings.js';
import { getAllSchemas, getSchema } from './common.js';

const createDatabase = (dbName, dbDir = SQLITE_DB_DIR) => {
  const dbPath = `${dbDir}/${dbName}.db`;
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '', (err) => {
      if (err) {
        console.error('Error creating database file: ', err);
      } else {
        console.log('Database file created successfully.');
      }
    });
  }
};

class Sqlite {
  constructor(dbName = 'finance') {
    this.dbName = dbName;
    this.dbPath = `${SQLITE_DB_DIR}/${dbName}.db`;
    this._createDatabase(); // 데이터베이스 생성 함수 호출
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Database opening error: ', err);
      }
    });
  }

  // 데이터베이스 파일이 존재하지 않으면 생성
  _createDatabase() {
    createDatabase(this.dbName, SQLITE_DB_DIR);
  }

  _runQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(query, params, function (err) {
          if (err) {
            console.error(
              `=======Error running query: ${query} >> ${err.message}`
            );
            reject(err);
          } else {
            resolve(this);
          }
        });
      });
    });
  }

  runQuery(query, params = []) {
    return this._runQuery(query, params).finally(() => {
      this.db.close();
    });
  }

  _queryCreateTableFromSchema(schema) {
    return `CREATE TABLE IF NOT EXISTS ${schema.title} (
      ${Object.entries(schema.properties)
        .map(([key, prop]) => {
          let field = `${key} `;

          // 데이터 타입 매핑
          if (prop.type === 'integer') {
            field +=
              key === 'id' ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INTEGER';
          } else if (prop.type === 'string') {
            if (prop.format === 'date-time') {
              field += 'DATETIME';
              if (prop.default === 'CURRENT_TIMESTAMP') {
                field += ' DEFAULT CURRENT_TIMESTAMP';
              }
            } else {
              field += 'TEXT';
            }
          } else if (prop.type === 'boolean') {
            field += 'BOOLEAN';
            if (prop.default !== undefined) {
              field += ` DEFAULT ${prop.default ? 1 : 0}`;
            }
          }

          // NOT NULL 제약조건 추가
          if (schema.required.includes(key)) {
            field += ' NOT NULL';
          }

          return field;
        })
        .join(',\n  ')}
    );`;
  }

  createTableFromSchema(schema) {
    const query = this._queryCreateTableFromSchema(schema);
    return this.runQuery(query);
  }

  delete(tableName) {
    return this.runQuery(`DROP TABLE IF EXISTS ${tableName}`);
  }

  _parseFilter(filter) {
    if (!filter) return { where: '', params: [] };

    if (typeof filter === 'string') {
      // PocketBase 스타일의 필터 문자열 파싱
      const conditions = filter
        .split('&&')
        .map((condition) => condition.trim());
      const parsedConditions = conditions.map((condition) => {
        // 연산자 매핑
        const operators = {
          '=': '=',
          '!=': '!=',
          '>': '>',
          '>=': '>=',
          '<': '<',
          '<=': '<=',
          '~': 'LIKE', // 부분 일치
          '!~': 'NOT LIKE', // 부분 불일치
        };

        let [field, op, value] = condition.split(/\s*(=|!=|>=|<=|>|<|~|!~)\s*/);

        // 따옴표 제거
        value = value.replace(/^["']|["']$/g, '');

        // LIKE 연산자인 경우 와일드카드 추가
        if (op === '~' || op === '!~') {
          value = `%${value}%`;
        }

        return {
          field,
          operator: operators[op] || '=',
          value,
        };
      });

      const where = parsedConditions
        .map(({ field, operator }) => `${field} ${operator} ?`)
        .join(' AND ');
      const params = parsedConditions.map(({ value }) => value);

      return { where, params };
    } else if (typeof filter === 'object') {
      // 객체 형태의 필터
      const entries = Object.entries(filter);
      const where = entries.map(([key]) => `${key} = ?`).join(' AND ');
      const params = entries.map(([_, value]) => value);
      return { where, params };
    }

    return { where: '', params: [] };
  }

  async findOne(tableName, filter) {
    try {
      const { where, params } = this._parseFilter(filter);
      const query = `SELECT * FROM ${tableName}${
        where ? ` WHERE ${where}` : ''
      } LIMIT 1`;

      return new Promise((resolve, reject) => {
        this.db.get(query, params, (err, row) => {
          if (err) {
            console.error('Error finding record:', err);
            reject(err);
          } else {
            resolve(row);
          }
        });
      });
    } catch (error) {
      console.error('Find operation failed:', error);
      throw error;
    }
  }

  async find(tableName, options = {}) {
    try {
      const { filter, sort, limit } = options;
      const { where, params } = this._parseFilter(filter);

      let query = `SELECT * FROM ${tableName}`;
      if (where) query += ` WHERE ${where}`;
      if (sort) query += ` ORDER BY ${sort}`;
      if (limit) query += ` LIMIT ${limit}`;

      return new Promise((resolve, reject) => {
        this.db.all(query, params, (err, rows) => {
          if (err) {
            console.error('Error finding records:', err);
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });
    } catch (error) {
      console.error('Find operation failed:', error);
      throw error;
    }
  }

  async insertOne(tableName, data) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data)
      .map(() => '?')
      .join(', ');
    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    return this.runQuery(query, Object.values(data));
  }

  async insert(tableName, dataArray) {
    const columns = Object.keys(dataArray[0]).join(', ');
    const placeholders = Object.keys(dataArray[0])
      .map(() => '?')
      .join(', ');
    const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
    return Promise.all(
      dataArray.map((data) => this.runQuery(query, Object.values(data)))
    );
  }

  async upsertOne(tableName, data, uniqueFields) {
    try {
      // 데이터 유효성 검사
      if (!data || Object.keys(data).length === 0) {
        throw new Error('Data is empty');
      }

      // uniqueFields가 비어있으면 insert 수행
      if (!uniqueFields) {
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data)
          .map(() => '?')
          .join(', ');
        const values = Object.values(data);

        const query = `
          INSERT INTO ${tableName} (${columns})
          VALUES (${placeholders})
        `;

        return await this.runQuery(query, values);
      }

      // uniqueFields를 배열로 변환
      const uniqueFieldsArray = uniqueFields
        .split(',')
        .map((field) => field.trim());

      // uniqueFields의 모든 key가 data에 있는지 확인
      const missingFields = uniqueFieldsArray.filter(
        (field) => !(field in data)
      );
      if (missingFields.length > 0) {
        throw new Error(
          `Missing required unique fields: ${missingFields.join(', ')}`
        );
      }

      // INSERT할 컬럼과 값 준비
      const columns = Object.keys(data).join(', ');
      const placeholders = Object.keys(data)
        .map(() => '?')
        .join(', ');
      const values = Object.values(data);

      // UPDATE할 필드 준비 (uniqueFields 제외)
      const updateFields = Object.keys(data)
        .filter((key) => !uniqueFieldsArray.includes(key))
        .map((key) => `${key} = excluded.${key}`)
        .join(', ');

      const query = `
        INSERT INTO ${tableName} (${columns})
        VALUES (${placeholders})
        ON CONFLICT(${uniqueFields}) DO UPDATE SET
        ${updateFields}
      `;

      return await this.runQuery(query, values);
    } catch (error) {
      console.error('Upsert operation failed:', error);
      throw error;
    }
  }

  async upsert(tableName, dataArray, uniqueFields) {
    return Promise.all(
      dataArray.map((data) => this.upsertOne(tableName, data, uniqueFields))
    );
  }
}

export { Sqlite, createDatabase };

// // 사용 예시
// const dbName = 'youtube';
// const sqlite = new Sqlite(dbName);
// sqlite.createTableFromSchema(getSchema('youtubeSubscriptions','youtube'));

// const schemas = getAllSchemas(dbName);
// // console.log(schemas);
// for (const schema of schemas) {
//   sqlite.createTableFromSchema(schema);
// }

// sqlite.createTableFromSchema(yourSchema); // 테이블 생성
// sqlite.findOne('BankAccounts', 1).then(console.log); // 특정 레코드 찾기
// sqlite.find('BankAccounts').then(console.log); // 모든 레코드 찾기
// sqlite.insertOne('BankAccounts', { accNum: '123456', userName: 'John Doe', ... }); // 단일 레코드 삽입
// sqlite.insert('BankAccounts', [{ accNum: '123456', userName: 'John Doe', ... }, { accNum: '654321', userName: 'Jane Doe', ... }]); // 다중 레코드 삽입
// sqlite.upsertOne('BankAccounts', { id: 1, accNum: '123456', userName: 'John Doe', ... }); // 단일 레코드 upsert
// sqlite.upsert('BankAccounts', [{ id: 1, accNum: '123456', userName: 'John Doe', ... }, { id: 2, accNum: '654321', userName: 'Jane Doe', ... }]); // 다중 레코드 upsert
