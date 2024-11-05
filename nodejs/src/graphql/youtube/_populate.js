import { loadJson, saveJson } from 'jnj-lib-base';
import { Sqlite } from '../../database/sqlite.js';
const JSON_ROOT = 'C:/JnJ-soft/Projects/internal/jnj-backend/db/json/youtube';

const sqlite = new Sqlite('youtube');

const allVideos = loadJson(`${JSON_ROOT}/youtubeVideos.json`);

const allPlaylists = loadJson(`${JSON_ROOT}/youtubePlaylists.json`);
const allPlaylistIds = allPlaylists.map((playlist) => playlist.playlistId);

const getVideoIdsByPlaylistId = (playlistId) => {
  return allVideos
    .filter((video) => video.playlistId === playlistId)
    .map((v) => v.videoId);
};

// * 테스트
// console.log(allVideos.length);

const playlistId = 'PLWKjhJtqVAblMiJPkJBny7WbfTYc6z27r';
const videoIds = getVideoIdsByPlaylistId(playlistId);
const newPlaylists = [];
const notMatches = [];

for (const playlistId of allPlaylistIds) {
  const newPlaylist = allPlaylists.find((p) => p.playlistId == playlistId);
  const videoIds = getVideoIdsByPlaylistId(playlistId);
  const count = allPlaylists.find((p) => p.playlistId === playlistId).itemCount;
  if (videoIds.length !== count) {
    notMatches.push({
      playlistId,
      videoIds,
      videosCount: videoIds.length,
      itemsCount: count,
    });
  }
  newPlaylist.videoIds = videoIds.join(',');
  newPlaylists.push(newPlaylist);
}

saveJson(`${JSON_ROOT}/youtubePlaylists_1.json`, newPlaylists);
saveJson(`${JSON_ROOT}/notMatchePlaylistItems.json`, notMatches);
