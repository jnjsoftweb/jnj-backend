// [API Reference](https://developers.google.com/youtube/v3/docs?hl=ko)

import express from 'express';
import cors from 'cors';

import { EXPRESS_PORT } from '../../env.js';
import {
  getAllResponses,
  getChannelIdByCustomUrl,
  videosFromVideoIds,
  isShorts,
  mostPopularVideoIds,
} from '../utils/youtube/rest.js';
import { mySubscriptions, myPlaylistItems } from '../utils/youtube/google.js';
import {
  watchLaterVideoIds,
  historyVideoIds,
  shortsVideoIds,
} from '../utils/youtube/chrome.js';
import {
  downloadSubtitles,
  downloadYoutube,
  downloadYoutubeAll,
  downloadPlaylist,
  BASE_DOWN_DIR,
} from '../utils/youtube/down.js';

// * const 설정
const PORT = EXPRESS_PORT;
// console.log('PORT: ', PORT);

// app 설정
const app = express();
app.use(cors());
app.use(express.json());

// * YOUTUBEAPI(REST) 사용 ./utils/youtubeREST

// Channels: list, Info
// http://localhost:3006/channels?part=snippet,statistics,contentDetails,id,localizations,status,topicDetails,brandingSettings,contentOwnerDetails&id=UCUpJs89fSBXNolQGOYKn0YQ,UC06m1684XKULVP00TwURFdg
app.get('/channels', async (req, res) => {
  res.json(await getAllResponses('channels', req.query));
});

// Playlists: list
// http://localhost:3006/playlists?part=contentDetails,id,localizations,player,snippet,status&channelId=UCJIlfUISLIj9DODAQJWGHfA
app.get('/playlists', async (req, res) => {
  res.json(await getAllResponses('playlists', req.query));
});

// PlaylistItems: list
// http://localhost:3006/playlistItems?part=id,snippet,contentDetails,status&playlistId=PLwt0kothbrpdAlGrzPwjSxbkxZXqrfL5k
app.get('/playlistItems', async (req, res) => {
  res.json(await getAllResponses('playlistItems', req.query));
});

// Playlists: list
// http://localhost:3006/search?part=snippet&type=video,channel,playlist&q=파이코인
app.get('/search', async (req, res) => {
  res.json(await getAllResponses('search', req.query));
});

// Videos: list
// https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails,id,liveStreamingDetails,localizations,player, recordingDetails,snippet,statistics,status,topicDetails&id=qQPxP9TZEO8,D4nZW4wk3gQ&key=AIzaSyBHsLKBGbPRGi11o2m7i7e_TZU3efYsWag
app.get('/videos', async (req, res) => {
  res.json(await getAllResponses('videos', req.query));
});

// Channel Info by Custom URL
// http://localhost:3006/channelByCustomUrl?customUrl=nomadcoders
app.get('/channelByCustomUrl', async (req, res) => {
  const channelId = await getChannelIdByCustomUrl(req.query.customUrl);
  res.json(
    await getAllResponses('channels', {
      part: 'snippet,statistics,contentDetails',
      id: channelId,
    })
  );
});

// Channel Info by Custom URL
// {{YOUTUBE_API_ROOT}}/videos?part=id,contentDetails&chart=mostPopular&maxResults={{MAX_RESULTS}}&key={{YOUTUBE_YOUTUBE_API_KEY}}
// http://localhost:3006/mostPopularVideos
app.get('/mostPopularVideos', async (req, res) => {
  const maxItems = req.query.maxItems ?? 50;
  const type = req.query.type ?? 'all'; // all, shorts, video
  const videoIds = await mostPopularVideoIds(maxItems);
  const filteredVideoIds = [];
  // console.log('....BEFORE filtering', videoIds, videoIds.length);
  if (type === 'shorts') {
    // console.log('....shorts 비디오 필터링 시작...');
    for (const videoId of videoIds) {
      const result = await isShorts(videoId);
      if (result) {
        filteredVideoIds.push(videoId);
        // console.log(`${videoId}: 쇼츠 비디오`);
      }
    }
    // videoIds = filteredVideoIds;
    // console.log(
    //   '....shorts 비디오 필터링 완료',
    //   filteredVideoIds,
    //   filteredVideoIds.length
    // );
  } else if (type === 'video') {
    // console.log('....일반 비디오 필터링 시작...');
    // const filteredVideoIds = [];
    for (const videoId of videoIds) {
      const result = await isShorts(videoId);
      if (!result) {
        filteredVideoIds.push(videoId);
        // console.log(`${videoId}: 일반 비디오`);
      }
    }
    // videoIds = filteredVideoIds;
    // console.log(
    //   '....일반 비디오 필터링 완료',
    //   filteredVideoIds,
    //   filteredVideoIds.length
    // );
  } else {
    filteredVideoIds = videoIds;
  }

  res.json(await videosFromVideoIds(filteredVideoIds));
});

// * GOOGLE CLOUD(JNJ-LIB-GOOGLE) 사용 jnj-lib-google
// 구독 목록 가져오기
// http://localhost:3006/mySubscriptions?userId=mooninlearn
app.get('/mySubscriptions', async (req, res) => {
  res.json(await mySubscriptions(req.query.userId));
});

// 좋아요 표시한 동영상 목록
// http://localhost:3006/subscriptions?userId=mooninlearn
app.get('/myLikeVideos', async (req, res) => {
  res.json(await myPlaylistItems(req.query.userId, 'LL'));
});

// * CHROME 사용(playwright)
// 나중에 볼 동영상 가져오기
// http://localhost:3006/watchLaterVideos?userId=bigwhitekmc
app.get('/myWatchLaterVideos', async (req, res) => {
  const videoIds = await watchLaterVideoIds(req.query.userId);
  res.json(await videosFromVideoIds(videoIds));
});

// 시청 기록 가져오기
// http://localhost:3006/historyVideos?userId=bigwhitekmc
app.get('/myHistoryVideos', async (req, res) => {
  const videoIds = await historyVideoIds(req.query.userId);
  res.json(await videosFromVideoIds(videoIds));
});

// 쇼츠 가져오기
// http://localhost:3006/shortsVideos?userId=bigwhitekmc&channelId=UCUpJs89fSBXNolQGOYKn0YQ
app.get('/shortsVideos', async (req, res) => {
  const channelId = req.query.channelId || 'UCUpJs89fSBXNolQGOYKn0YQ';
  const videoIds = await shortsVideoIds(req.query.userId, { channelId });
  res.json(await videosFromVideoIds(videoIds));
});

// * Youtube 자막, 동영상 Download
// http://localhost:3006/downloadYoutube?videoId=RfUlsRjxMM0&resolution=720
app.get('/downloadYoutube', async (req, res) => {
  const filePaths = await downloadYoutube(req.query);
  res.json(filePaths);
});

// http://localhost:3006/downloadSubtitles?videoId=RfUlsRjxMM0&languages=en,ko
app.get('/downloadSubtitles', async (req, res) => {
  const filePaths = await downloadSubtitles(req.query);
  res.json(filePaths);
});

// http://localhost:3006/downloadSubtitles?videoId=RfUlsRjxMM0&languages=en,ko
app.get('/downloadYoutubeAll', async (req, res) => {
  const filePaths = await downloadYoutubeAll(req.query);
  res.json(filePaths);
});

// http://localhost:3006/downloadYoutubeAll?videoId=RfUlsRjxMM0&languages=en,ko
app.get('/downloadYoutubeAll', async (req, res) => {
  const filePaths = await downloadYoutubeAll(req.query);
  res.json(filePaths);
});

// http://localhost:3006/downloadPlaylist?playlistId=PL8vH7pXTpMi1byn3s2yj2vNw1gV4Qse1l&languages=en,ko
app.get('/downloadPlaylist', async (req, res) => {
  const filePaths = await downloadPlaylist(req.query);
  res.json(filePaths);
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT}에서 실행 중입니다.`);
});
