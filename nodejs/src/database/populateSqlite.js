import { Sqlite } from './sqlite.js';
import fs from 'fs';

const loadJson = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const _populateSpecialVideosByUserId = async (sqlite, userId) => {
  const types = ['history', 'watchLater'];
  
  try {
    for (const type of types) {
      const json = await loadJson(`/home/sam/JnJ-soft/Projects/internal/jnj-backend/db/json/youtube/${type}VideoIds.json`);

      const userVideos = json[userId] || [];
      const videoIds = userVideos.map(item => item.video.videoId).join(',');
      // await sqlite._upsertOne('specialVideos', {userId, type, videoIds});
      await sqlite._upsertOne('specialVideos', {userId, type, videoIds}, `userId,type`);
      console.log(`${userId}의 ${type} 비디오 저장 완료:`, videoIds);
    }
  } catch (error) {
    console.error(`Error processing ${userId}:`, error);
    throw error;
  }
};

const populateSpecialVideos = async () => {
  let sqlite = null;
  
  try {
    sqlite = new Sqlite('youtube');
    const userIds = ['bigwhitekmc', 'mooninlearn'];
    
    for (const userId of userIds) {
      await _populateSpecialVideosByUserId(sqlite, userId);
    }
    
    console.log('모든 데이터 저장 완료');
  } catch (error) {
    console.error('데이터 저장 중 오류 발생:', error);
    throw error;
  } finally {
    if (sqlite) {
      await sqlite.close();
    }
  }
};

// 메인 실행 함수
const main = async () => {
  try {
    await populateSpecialVideos();
  } catch (error) {
    console.error('실행 중 오류 발생:', error);
  } finally {
    // 명시적인 프로세스 종료 제거
    // process.exit()를 사용하지 않고 자연스럽게 종료되도록 함
  }
};

// 프로그램 실행
main();

// const sqlite = new Sqlite('youtube');
// await sqlite.insertOne('specialVideos', {userId: 'bigwhitekmc', type: 'history', videoIds: '123,456,789'});
// sqlite.close();