import mysql from 'mysql2/promise';
import { ILMAC_DB } from '../../env.js';

const pool = mysql.createPool({ ...ILMAC_DB, waitForConnections: true });

const mapDBToGraphQL = (row) => ({
  orgName: row['기관명'],
  url: row.url,
  iframe: row.iframe,
  rowXpath: row.rowXpath,
  paging: row.paging,
  startPage: row.startPage,
  endPage: row.endPage,
  login: row.login,
  title: row['제목'],
  detailUrl: row['상세페이지주소'],
  writeDate: row['작성일'],
  writer: row['작성자'],
  excludeKeywords: row['제외항목'],
  use: row.use === 1,
  region: row['지역'],
  registered: row['등록'],
});

const mapGraphQLToDB = (input) => ({
  기관명: input.orgName,
  url: input.url,
  iframe: input.iframe,
  rowXpath: input.rowXpath,
  paging: input.paging,
  startPage: input.startPage,
  endPage: input.endPage,
  login: input.login,
  제목: input.title,
  상세페이지주소: input.detailUrl,
  작성일: input.writeDate,
  작성자: input.writer,
  제외항목: input.excludeKeywords,
  use: input.use ? 1 : 0,
  지역: input.region,
  등록: input.registered,
});

const mapNoticeDBToGraphQL = (row) => ({
  nid: row.nid,
  sn: row.sn,
  orgName: row['기관명'],
  title: row['제목'],
  detailUrl: row['상세페이지주소'],
  writeDate: row['작성일']?.toISOString().split('T')[0],
  writer: row['작성자'],
  scrapedAt: row.scraped_at?.toISOString(),
  createdAt: row.created_at?.toISOString(),
  updatedAt: row.updated_at?.toISOString(),
});

const mapNoticeGraphQLToDB = (input) => ({
  sn: input.sn,
  기관명: input.orgName,
  제목: input.title,
  상세페이지주소: input.detailUrl,
  작성일: input.writeDate,
  작성자: input.writer,
  scraped_at: input.scrapedAt,
});

const mapKeywordDBToGraphQL = (row) => ({
  use: row.use === 1,
  searchName: row['검색명'],
  searchKeywords: row['검색어'],
  excludeKeywords: row['배제어'],
  minScore: row['최소점수'],
  category: row['적용분야'],
  targetOrg: row['적용기관'],
  targetRegion: row['적용지역'],
  writer: row['작성자'],
  memo: row['메모'],
  createdAt: row.created_at?.toISOString(),
  updatedAt: row.updated_at?.toISOString(),
});

const mapKeywordGraphQLToDB = (input) => ({
  use: input.use ? 1 : 0,
  검색명: input.searchName,
  검색어: input.searchKeywords,
  배제어: input.excludeKeywords,
  최소점수: input.minScore,
  적용분야: input.category,
  적용기관: input.targetOrg,
  적용지역: input.targetRegion,
  작성자: input.writer,
  메모: input.memo,
});

export const resolvers = {
  Query: {
    getAllSettings: async () => {
      const db = await pool.getConnection();
      try {
        const [rows] = await db.execute('SELECT * FROM settings_list');
        return rows.map(mapDBToGraphQL);
      } catch (error) {
        console.error('Error:', error);
        throw new Error('데이터베이스 조회 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },

    getSettingsByOrg: async (_, { orgName }) => {
      const db = await pool.getConnection();
      try {
        const [rows] = await db.execute(
          'SELECT * FROM settings_list WHERE 기관명 = ?',
          [orgName]
        );
        if (rows.length === 0) return null;
        return mapDBToGraphQL(rows[0]);
      } catch (error) {
        console.error('Error:', error);
        throw new Error('데이터베이스 조회 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },

    getSettingsByRegion: async (_, { region }) => {
      const db = await pool.getConnection();
      try {
        const [rows] = await db.execute(
          'SELECT * FROM settings_list WHERE 지역 = ?',
          [region]
        );
        return rows.map(mapDBToGraphQL);
      } catch (error) {
        console.error('Error:', error);
        throw new Error('데이터베이스 조회 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },

    getAllNotices: async () => {
      const db = await pool.getConnection();
      try {
        const [rows] = await db.execute(
          'SELECT * FROM notices ORDER BY nid DESC'
        );
        return rows.map(mapNoticeDBToGraphQL);
      } catch (error) {
        console.error('Error:', error);
        throw new Error('공지사항 조회 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },

    getNoticeById: async (_, { nid }) => {
      const db = await pool.getConnection();
      try {
        const [rows] = await db.execute('SELECT * FROM notices WHERE nid = ?', [
          nid,
        ]);
        if (rows.length === 0) return null;
        return mapNoticeDBToGraphQL(rows[0]);
      } catch (error) {
        console.error('Error:', error);
        throw new Error('공지사항 조회 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },

    getNoticesByOrg: async (_, { orgName }) => {
      const db = await pool.getConnection();
      try {
        const [rows] = await db.execute(
          'SELECT * FROM notices WHERE 기관명 = ? ORDER BY nid DESC',
          [orgName]
        );
        return rows.map(mapNoticeDBToGraphQL);
      } catch (error) {
        console.error('Error:', error);
        throw new Error('공지사항 조회 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },

    getNoticesByDateRange: async (_, { startDate, endDate }) => {
      const db = await pool.getConnection();
      try {
        const [rows] = await db.execute(
          'SELECT * FROM notices WHERE 작성일 BETWEEN ? AND ? ORDER BY 작성일 DESC',
          [startDate, endDate]
        );
        return rows.map(mapNoticeDBToGraphQL);
      } catch (error) {
        console.error('Error:', error);
        throw new Error('공지사항 조회 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },

    getAllKeywords: async () => {
      const db = await pool.getConnection();
      try {
        const [rows] = await db.execute(
          'SELECT * FROM settings_keyword ORDER BY 검색명'
        );
        return rows.map(mapKeywordDBToGraphQL);
      } catch (error) {
        console.error('Error:', error);
        throw new Error('키워드 설정 조회 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },

    getKeywordByName: async (_, { searchName }) => {
      const db = await pool.getConnection();
      try {
        const [rows] = await db.execute(
          'SELECT * FROM settings_keyword WHERE 검색명 = ?',
          [searchName]
        );
        if (rows.length === 0) return null;
        return mapKeywordDBToGraphQL(rows[0]);
      } catch (error) {
        console.error('Error:', error);
        throw new Error('키워드 설정 조회 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },

    getKeywordsByCategory: async (_, { category }) => {
      const db = await pool.getConnection();
      try {
        const [rows] = await db.execute(
          'SELECT * FROM settings_keyword WHERE 적용분야 = ?',
          [category]
        );
        return rows.map(mapKeywordDBToGraphQL);
      } catch (error) {
        console.error('Error:', error);
        throw new Error('키워드 설정 조회 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },

    getKeywordsByOrg: async (_, { targetOrg }) => {
      const db = await pool.getConnection();
      try {
        const [rows] = await db.execute(
          'SELECT * FROM settings_keyword WHERE 적용기관 = ?',
          [targetOrg]
        );
        return rows.map(mapKeywordDBToGraphQL);
      } catch (error) {
        console.error('Error:', error);
        throw new Error('키워드 설정 조회 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },

    getKeywordsByRegion: async (_, { targetRegion }) => {
      const db = await pool.getConnection();
      try {
        const [rows] = await db.execute(
          'SELECT * FROM settings_keyword WHERE 적용지역 = ?',
          [targetRegion]
        );
        return rows.map(mapKeywordDBToGraphQL);
      } catch (error) {
        console.error('Error:', error);
        throw new Error('키워드 설정 조회 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },
  },

  Mutation: {
    createSettings: async (_, { input }) => {
      const db = await pool.getConnection();
      try {
        const dbInput = mapGraphQLToDB(input);
        const columns = Object.keys(dbInput).join(', ');
        const values = Object.values(dbInput);
        const placeholders = values.map(() => '?').join(', ');

        await db.execute(
          `INSERT INTO settings_list (${columns}) VALUES (${placeholders})`,
          values
        );

        return input;
      } catch (error) {
        console.error('Error:', error);
        throw new Error('데이터 생성 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },

    updateSettings: async (_, { orgName, input }) => {
      const db = await pool.getConnection();
      try {
        const dbInput = mapGraphQLToDB(input);
        const updates = Object.entries(dbInput)
          .map(([key, _]) => `${key} = ?`)
          .join(', ');
        const values = [...Object.values(dbInput), orgName];

        await db.execute(
          `UPDATE settings_list SET ${updates} WHERE 기관명 = ?`,
          values
        );

        return input;
      } catch (error) {
        console.error('Error:', error);
        throw new Error('데이터 수정 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },

    deleteSettings: async (_, { orgName }) => {
      const db = await pool.getConnection();
      try {
        const [result] = await db.execute(
          'DELETE FROM settings_list WHERE 기관명 = ?',
          [orgName]
        );
        return result.affectedRows > 0;
      } catch (error) {
        console.error('Error:', error);
        throw new Error('데이터 삭제 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },

    toggleUseSettings: async (_, { orgName, use }) => {
      const db = await pool.getConnection();
      try {
        await db.execute(
          'UPDATE settings_list SET `use` = ? WHERE 기관명 = ?',
          [use ? 1 : 0, orgName]
        );

        const [rows] = await db.execute(
          'SELECT * FROM settings_list WHERE 기관명 = ?',
          [orgName]
        );

        return mapDBToGraphQL(rows[0]);
      } catch (error) {
        console.error('Error:', error);
        throw new Error('설정 변경 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },

    createNotice: async (_, { input }) => {
      const db = await pool.getConnection();
      try {
        const dbInput = mapNoticeGraphQLToDB(input);
        const columns = Object.keys(dbInput).join(', ');
        const values = Object.values(dbInput);
        const placeholders = values.map(() => '?').join(', ');

        const [result] = await db.execute(
          `INSERT INTO notices (${columns}) VALUES (${placeholders})`,
          values
        );

        const [newNotice] = await db.execute(
          'SELECT * FROM notices WHERE nid = ?',
          [result.insertId]
        );

        return mapNoticeDBToGraphQL(newNotice[0]);
      } catch (error) {
        console.error('Error:', error);
        throw new Error('공지사항 생성 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },

    updateNotice: async (_, { nid, input }) => {
      const db = await pool.getConnection();
      try {
        const dbInput = mapNoticeGraphQLToDB(input);
        const updates = Object.entries(dbInput)
          .map(([key, _]) => `${key} = ?`)
          .join(', ');
        const values = [...Object.values(dbInput), nid];

        await db.execute(`UPDATE notices SET ${updates} WHERE nid = ?`, values);

        const [updatedNotice] = await db.execute(
          'SELECT * FROM notices WHERE nid = ?',
          [nid]
        );

        return mapNoticeDBToGraphQL(updatedNotice[0]);
      } catch (error) {
        console.error('Error:', error);
        throw new Error('공지사항 수정 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },

    deleteNotice: async (_, { nid }) => {
      const db = await pool.getConnection();
      try {
        const [result] = await db.execute('DELETE FROM notices WHERE nid = ?', [
          nid,
        ]);
        return result.affectedRows > 0;
      } catch (error) {
        console.error('Error:', error);
        throw new Error('공지사항 삭제 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },

    deleteNoticesByOrg: async (_, { orgName }) => {
      const db = await pool.getConnection();
      try {
        const [result] = await db.execute(
          'DELETE FROM notices WHERE 기관명 = ?',
          [orgName]
        );
        return result.affectedRows;
      } catch (error) {
        console.error('Error:', error);
        throw new Error('공지사항 삭제 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },

    createKeyword: async (_, { input }) => {
      const db = await pool.getConnection();
      try {
        const dbInput = mapKeywordGraphQLToDB(input);
        const columns = Object.keys(dbInput).join(', ');
        const values = Object.values(dbInput);
        const placeholders = values.map(() => '?').join(', ');

        await db.execute(
          `INSERT INTO settings_keyword (${columns}) VALUES (${placeholders})`,
          values
        );

        const [newKeyword] = await db.execute(
          'SELECT * FROM settings_keyword WHERE 검색명 = ?',
          [input.searchName]
        );

        return mapKeywordDBToGraphQL(newKeyword[0]);
      } catch (error) {
        console.error('Error:', error);
        throw new Error('키워드 설정 생성 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },

    updateKeyword: async (_, { searchName, input }) => {
      const db = await pool.getConnection();
      try {
        const dbInput = mapKeywordGraphQLToDB(input);
        const updates = Object.entries(dbInput)
          .map(([key, _]) => `${key} = ?`)
          .join(', ');
        const values = [...Object.values(dbInput), searchName];

        await db.execute(
          `UPDATE settings_keyword SET ${updates} WHERE 검색명 = ?`,
          values
        );

        const [updatedKeyword] = await db.execute(
          'SELECT * FROM settings_keyword WHERE 검색명 = ?',
          [input.searchName]
        );

        return mapKeywordDBToGraphQL(updatedKeyword[0]);
      } catch (error) {
        console.error('Error:', error);
        throw new Error('키워드 설정 수정 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },

    deleteKeyword: async (_, { searchName }) => {
      const db = await pool.getConnection();
      try {
        const [result] = await db.execute(
          'DELETE FROM settings_keyword WHERE 검색명 = ?',
          [searchName]
        );
        return result.affectedRows > 0;
      } catch (error) {
        console.error('Error:', error);
        throw new Error('키워드 설정 삭제 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },

    toggleKeywordUse: async (_, { searchName, use }) => {
      const db = await pool.getConnection();
      try {
        await db.execute(
          'UPDATE settings_keyword SET `use` = ? WHERE 검색명 = ?',
          [use ? 1 : 0, searchName]
        );

        const [rows] = await db.execute(
          'SELECT * FROM settings_keyword WHERE 검색명 = ?',
          [searchName]
        );

        return mapKeywordDBToGraphQL(rows[0]);
      } catch (error) {
        console.error('Error:', error);
        throw new Error('키워드 설정 변경 중 오류가 발생했습니다.');
      } finally {
        db.release();
      }
    },
  },
};
