import mysql from 'mysql2/promise'
import { ILMAC_DB } from '../settings.js';

const pool = mysql.createPool({...ILMAC_DB, waitForConnections: true});

async function showTableStructure() {
    const db = await pool.getConnection();
    try {
        // 테이블 구조 조회
        // const table = 'settings_list';
        // const table = 'notices';
        const table = 'settings_keyword';
        const [describeResults] = await db.execute(`DESCRIBE ${table}`);
        console.log(`\n=== ${table} 테이블 구조 ===`);
        console.table(describeResults);
        console.info(describeResults);

        // // 데이터 조회
        // const [rows] = await db.execute('SELECT * FROM settings_list');
        // console.log('\n=== settings_list 데이터 ===');
        // console.table(rows);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        db.release();
    }
}

showTableStructure();
// [
//     {
//       Field: 'nid',
//       Type: 'int',
//       Null: 'NO',
//       Key: 'PRI',
//       Default: null,
//       Extra: 'auto_increment'
//     },
//     {
//       Field: 'sn',
//       Type: 'int',
//       Null: 'NO',
//       Key: '',
//       Default: null,
//       Extra: ''
//     },
//     {
//       Field: '기관명',
//       Type: 'varchar(40)',
//       Null: 'NO',
//       Key: '',
//       Default: null,
//       Extra: ''
//     },
//     {
//       Field: '제목',
//       Type: 'varchar(100)',
//       Null: 'YES',
//       Key: '',
//       Default: null,
//       Extra: ''
//     },
//     {
//       Field: '상세페이지주소',
//       Type: 'varchar(800)',
//       Null: 'YES',
//       Key: '',
//       Default: null,
//       Extra: ''
//     },
//     {
//       Field: '작성일',
//       Type: 'date',
//       Null: 'YES',
//       Key: '',
//       Default: null,
//       Extra: ''
//     },
//     {
//       Field: '작성자',
//       Type: 'varchar(20)',
//       Null: 'YES',
//       Key: '',
//       Default: null,
//       Extra: ''
//     },
//     {
//       Field: 'scraped_at',
//       Type: 'datetime',
//       Null: 'YES',
//       Key: '',
//       Default: null,
//       Extra: ''
//     },
//     {
//       Field: 'created_at',
//       Type: 'timestamp',
//       Null: 'NO',
//       Key: '',
//       Default: 'CURRENT_TIMESTAMP',
//       Extra: 'DEFAULT_GENERATED'
//     },
//     {
//       Field: 'updated_at',
//       Type: 'datetime',
//       Null: 'NO',
//       Key: '',
//       Default: 'CURRENT_TIMESTAMP',
//       Extra: 'DEFAULT_GENERATED on update CURRENT_TIMESTAMP'
//     }
//   ]

//   - notices의 테이블 구조를 참고하여,

// @ilmac 폴더에 @typeDefs.js @resolvers.js @sample_api.gql 파일을 수정(notices 추가)해주세요


// [
//     {
//       Field: 'use',
//       Type: 'tinyint(1)',
//       Null: 'YES',
//       Key: '',
//       Default: null,
//       Extra: ''
//     },
//     {
//       Field: '검색명',
//       Type: 'varchar(100)',
//       Null: 'NO',
//       Key: 'PRI',
//       Default: null,
//       Extra: ''
//     },
//     {
//       Field: '검색어',
//       Type: 'varchar(200)',
//       Null: 'YES',
//       Key: '',
//       Default: null,
//       Extra: ''
//     },
//     {
//       Field: '배제어',
//       Type: 'varchar(200)',
//       Null: 'YES',
//       Key: '',
//       Default: null,
//       Extra: ''
//     },
//     {
//       Field: '최소점수',
//       Type: 'smallint',
//       Null: 'YES',
//       Key: '',
//       Default: null,
//       Extra: ''
//     },
//     {
//       Field: '적용분야',
//       Type: 'varchar(20)',
//       Null: 'YES',
//       Key: '',
//       Default: null,
//       Extra: ''
//     },
//     {
//       Field: '적용기관',
//       Type: 'varchar(40)',
//       Null: 'YES',
//       Key: '',
//       Default: null,
//       Extra: ''
//     },
//     {
//       Field: '적용지역',
//       Type: 'varchar(100)',
//       Null: 'YES',
//       Key: '',
//       Default: null,
//       Extra: ''
//     },
//     {
//       Field: '작성자',
//       Type: 'varchar(20)',
//       Null: 'YES',
//       Key: '',
//       Default: null,
//       Extra: ''
//     },
//     {
//       Field: '메모',
//       Type: 'varchar(400)',
//       Null: 'YES',
//       Key: '',
//       Default: null,
//       Extra: ''
//     },
//     {
//       Field: 'created_at',
//       Type: 'timestamp',
//       Null: 'NO',
//       Key: '',
//       Default: 'CURRENT_TIMESTAMP',
//       Extra: 'DEFAULT_GENERATED'
//     },
//     {
//       Field: 'updated_at',
//       Type: 'datetime',
//       Null: 'NO',
//       Key: '',
//       Default: 'CURRENT_TIMESTAMP',
//       Extra: 'DEFAULT_GENERATED on update CURRENT_TIMESTAMP'
//     }
//   ]

//   - settings_keyword의 테이블 구조를 참고하여,

// @ilmac 폴더에 @typeDefs.js @resolvers.js @sample_api.gql 파일을 수정(settings_keyword 추가)해주세요


