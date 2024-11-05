import { loadJson, saveJson } from 'jnj-lib-base';
import { Sqlite } from '../../database/sqlite.js';
import { JSON_DB_DIR } from '../../env.js';
import { getAllSchemas, getSchema } from '../../database/common.js';

const DB_NAME = "youtube"
const JSON_ROOT = `${JSON_DB_DIR}/${DB_NAME}`;


const sqlite = new Sqlite(DB_NAME);

const schemas = getAllSchemas(DB_NAME);

const getAllTableNames = () => {
  return schemas.map(schema => schema.title)
}

// console.log(getAllTableNames());

// * 테이블 생성
const createAllTables = () => {
  for (const schema of schemas) {
    console.log(`${schema.title} 테이블 생성`);
    // console.log(schema);
    sqlite.createTableFromSchema(schema);
  }
};

// * JSON -> Sqlite
const populateJsonToSqlite = async (tableName) => {
  const data = loadJson(`${JSON_ROOT}/${tableName}.json`);
  await sqlite.upsert(tableName, data);
}

const populateAllJsonToSqlite = async () => {
  const tableNames = getAllTableNames();
  for (const tableName of tableNames) {
    await populateJsonToSqlite(tableName);
  }
  // await Promise.all(
  //   tableNames.map(async (tableName) => {
  //     await populateJsonToSqlite(tableName);
  //   })
  // );
}



// const allPlaylists = loadJson(`${JSON_ROOT}/playlists.json`);
// const allPlaylistIds = allPlaylists.map((playlist) => playlist.playlistId);

// const getVideoIdsByPlaylistId = (playlistId) => {
//   return allVideos
//     .filter((video) => video.playlistId === playlistId)
//     .map((v) => v.videoId);
// };

// // * 테스트
// // console.log(allVideos.length);

// !! notMatchPlaylistItems(playlist와 video 갯수가 다를 경우)
const getNotMatchPlaylistItems = () => {
  const newPlaylists = [];
  const notMatches = [];

  for (const playlistId of allPlaylistIds) {
    const newPlaylist = allPlaylists.find((p) => p.playlistId == playlistId);
    const videoIds = getVideoIdsByPlaylistId(playlistId);
    const count = allPlaylists.find((p) => p.playlistId === playlistId).itemCount;
    const videoIdsStr = videoIds.join(',');
    if (videoIds.length !== count) {
      notMatches.push({
        playlistId,
        videoIds: videoIdsStr,
        videosCount: videoIds.length,
        itemsCount: count,
      });
    }
    newPlaylist.videoIds = videoIdsStr;
    newPlaylists.push(newPlaylist);
  }

  // saveJson(`${JSON_ROOT}/youtubePlaylists_1.json`, newPlaylists);
  saveJson(`${JSON_ROOT}/notMatchPlaylistItems.json`, notMatches);
}

// mostPopularVideos
// const mostPopularVideos = loadJson(`${JSON_ROOT}/mostPopularVideos.json`);
// mostPopularVideos.forEach(video => {
//   video.tags = video.tags.join(',');
// });

// saveJson(`${JSON_ROOT}/mostPopularVideos.json`, mostPopularVideos);

// // * 테이블 생성
// createAllTables();


// // * JSON -> Sqlite
// // await populateAllJsonToSqlite();
// await populateJsonToSqlite("mostPopularVideos");
// await populateJsonToSqlite("notMatchPlaylistItems");


