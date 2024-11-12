import { loadJson, saveJson } from 'jnj-lib-base';
import { SQLITE_DB_DIR, JSON_DB_DIR } from '../../env.js';
import {
  _allUsersSqlite,
  _userOneByIdSqlite,
  _subscriptionsByUserIdSqlite,
  _videoOneByIdSqlite,
  _playlistOneByIdSqlite,
  _channelOneByIdSqlite,
  _videosByPlaylistIdSqlite,
  _videoIdsByPlaylistIdSqlite,
  _videosSqlite,
  _subscriptionsSqlite,
  _subscriptionOneByIdSqlite,
  _channelsSqlite,
  _channelsByUserIdSqlite,
  _playlistsSqlite,
  _videosByChannelIdSqlite,
  _specialVideoIdsSqlite,
  _upsertUsersSqlite,
  _upsertSubscriptionsSqlite,
  _upsertChannelsSqlite,
  _upsertPlaylistsSqlite,
  _upsertVideosSqlite,
  _videoIdsInPlaylistSqlite,
  _notMatchPlaylistItemsInPlaylistSqlite,
  _upsertNotMatchPlaylistItemsSqlite,
} from './resolversSqlite.js';

import {
  _subscriptionsApi,
  _channelByIdApi,
  _playlistsByChannelIdApi,
  _videosByChannelIdApi,
  _videoByIdApi,
  _videoIdsByPlaylistIdApi,
  _videoIdsByChannelIdApi,
  _mostPopularVideosApi,
  _watchLaterVideosApi,
  _historyVideosApi,
  _shortsVideosByChannelIdApi,
} from './resolversApi.js';

import {
  downloadYoutubeAll,
  downloadPlaylist,
  BASE_DOWN_DIR,
  listIdsInDir,
} from '../../utils/youtube/down.js';

// const JSON_ROOT = `${SQLITE_DB_DIR}/youtube`;
const JSON_ROOT = `${JSON_DB_DIR}/youtube`;

const _videoById = async (videoId) => {
  let video = await _videoOneByIdSqlite(videoId);
  if (!video) {
    const _video = await _videoByIdApi(videoId);
    // console.log(`video: ${JSON.stringify(video)}`);
    video = _video.video;
    video.channelId = _video.channel.channelId;
    await _upsertVideosSqlite([video]);
  }
  
  const channel = await _channelOneByIdSqlite(video.channelId);
  
  // delete video.channelTitle; // channelTitle(mostPopularVideos에서만 사용) 제거
  // delete video.channelThumbnail; // channelThumbnail(mostPopularVideos에서만 사용) 제거

  return { video, channel };
};

// update videos set channelId = "UCeN2YeJcBCRJoXgzF_OU3qw" where videoId = "ygQsR_hNicc"
// update videos set channelId = "UC9PB9nKYqKEx_N3KM-JVTpg" where videoId = "tFVk-o2JA3o"

// video: {"video":{"videoId":"ygQsR_hNicc","playlistId":"","title":"세상이 또 한 번 바뀝니다... OpenAI 실시간 음성 모드부터 더 저렴하게 앱을 만들 수 있는 다양한 프레임워크까지!","description":"OpenAI DevDay 2024에서 개발자들이 더욱 손쉽게 LLM을 파인튜닝하고 소형화하면서도 비용을 줄일 수 있는 다양한 프레임워크와 서비스를 공개하였습니다. 웹소켓을 사용해 지연시간을 줄인 실시간 음성 API'와 외부 API와의 연동을 쉽게 해주는 'Function Calling' 기능은 주식 정보는 물론 실시간 정보를 api로 가져와서 처리할 수 있어 이를 실시간 데모로 보였는데요.  여기에 Prompt Caching 기능을 통해 비용을 50% 절감하고 응답 속도를 개선하고 모델 디스틸레이션으로 대형 AI 모델의 효율성을 높이고, 다양한 맞춤형 응답 기능을 개발할 수 있도록 OpenAI 플랫폼을 공개하였습니다. 더군다나 내가 원하는 이미지들로 학습이 가능해져, 교통 표지판 인식 및 UI 요소 탐색 등 다양한 산업군에 적용될 수 있는 비전 파인튜닝 기술까지. 이번 DevDay 주요 내용과 그 의미를 살펴보면서 새로운 앱들이 쏟아져나올 미래, 그리고 OpenAI의 AI 헤게모니에 대해 분석합니다.\n\nWritten by Error\nEdited by 이진이\n\nunrealtech2021@gmail.com","thumbnail":"https://i.ytimg.com/vi/ygQsR_hNicc/mqdefault.jpg","publishedAt":"2024-10-02T17:37:27Z","duration":"PT17M48S","caption":"false","tags":"","viewCount":"105677","likeCount":"2417","commentCount":"179"},"channel":{"channelId":"UCeN2YeJcBCRJoXgzF_OU3qw","title":"안될공학 - IT 테크 신기술","customUrl":"@unrealtech","publishedAt":"2019-04-13T17:13:02Z","description":"공학박사 '에러'가 전하는\n최신 공학/테크/IT/신기술\n\n문의 : Unrealtech2021@gmail.com","thumbnail":"https://yt3.ggpht.com/8PUa-2RnefBpUSobpDw2vTbg8hqh4CtK-CDQ20pDAXn7wjBlQNWDC-QycQRW04BMpdChInib-g=s240-c-k-c0x00ffffff-no-rj","uploadsPlaylistId":"UUeN2YeJcBCRJoXgzF_OU3qw","viewCount":"37688867","subscriberCount":"288000","videoCount":"622"}}
// video: {"video":{"videoId":"tFVk-o2JA3o","playlistId":"","title":"완전 자동 카카오톡 매크로 만들기 - 친구 삭제 프로젝트","description":"프로젝트는 재밌었지만 친구를 잃었습니다...\n\n소스코드:\nhttps://github.com/kairess/kakaotalk-bot\n\nChapters:\n00:00 데모\n00:39 Intro\n02:12 클로바 OCR\n02:42 코드 설명\n10:36 Outro\n\n사업 및 개발문의\nkairess87@gmail.com\n빵형의 개발도상국 후원\n카카오페이 : https://qr.kakaopay.com/Ej86nqvdu\n투네이션 : https://toon.at/donate/helloworld\n링크 모음 : https://lnk.bio/kairess\n\n#빵형 #카카오 #카카오톡 #chatgpt #챗gpt #ai","thumbnail":"https://i.ytimg.com/vi/tFVk-o2JA3o/mqdefault.jpg","publishedAt":"2024-10-09T13:30:28Z","duration":"PT11M10S","caption":"false","tags":"개발,인공지능,파이썬,이미지처리,python,ai,imageprocessing,deeplearning,machinlearning","viewCount":"5865","likeCount":"148","commentCount":"12"},"channel":{"channelId":"UC9PB9nKYqKEx_N3KM-JVTpg","title":"빵형의 개발도상국","customUrl":"@bbanghyong","publishedAt":"2018-10-03T02:47:58Z","description":"신기하고 재밌는 인공지능을 쉽게, 짧게, 내손으로 만들어 봅니다!\n\n사업 및 개발문의\nkairess87@gmail.com\n\n빵형의 개발도상국 후원\n카카오페이 : https://qr.kakaopay.com/Ej86nqvdu\n투네이션 : https://toon.at/donate/helloworld\n링크 모음 : https://lnk.bio/kairess\n빵형 깃헙 : https://github.com/kairess\n\n더 재밌는 영상이 여러분들의 후원을 통해 만들어지고 있어요! 정말 감사합니다!\n후원해주신 고마운 구독자분들에게는 아래와 같은 혜택이 있습니다.\n\n- 후원 목록 게재\n- 원하는 개발 주제를 요청할 기회","thumbnail":"https://yt3.ggpht.com/ytc/AIdro_nXbFN_SjZuCqP9isEDXrWRTWq9uAlmvbj5rb24sV3Wtg=s240-c-k-c0x00ffffff-no-rj","uploadsPlaylistId":"UU9PB9nKYqKEx_N3KM-JVTpg","viewCount":"4648848","subscriberCount":"55700","videoCount":"352"}}


const _videoByVideoSqlite = async (video) => {
  const channel = await _channelOneByIdSqlite(video.channelId);
  return { video, channel };
};

const _videosByPlaylistId = async (playlistId) => {
  const videoIds = await _videoIdsByPlaylistIdSqlite(playlistId);
  return Promise.all(
    videoIds.map(async (videoId) => await _videoById(videoId))
  );
};

export const resolvers = {
  Query: {
    youtubeAllUsers: async (_, args) => {
      return await _allUsersSqlite();
    },
    youtubeUserById: async (_, { userId }) => {
      return await _userOneByIdSqlite(userId);
    },
    youtubeAllSubscriptions: async (_, args) => {
      const subscriptions = await _subscriptionsSqlite(args);
      return Promise.all(
        subscriptions.map(async (subscription) => {
          subscription.channel = await _channelOneByIdSqlite(
            subscription.channelId
          );
          return subscription;
        })
      );
    },
    youtubeSubscriptionById: async (_, { subscriptionId }) => {
      const subscription = await _subscriptionOneByIdSqlite(subscriptionId);
      subscription.channel = await _channelOneByIdSqlite(
        subscription.channelId
      );
      return subscription;
    },
    youtubeAllChannels: async (_, args) => {
      return await _channelsSqlite(args);
    },
    youtubeChannelsByUserId: async (_, { userId }) => {
      return await _channelsByUserIdSqlite(userId);
    },
    youtubeChannelById: async (_, { channelId }) => {
      return await _channelOneByIdSqlite(channelId);
    },
    youtubeAllPlaylists: async (_, args) => {
      return await _playlistsSqlite(args);
    },
    youtubePlaylistById: async (_, { playlistId }) => {
      return await _playlistOneByIdSqlite(playlistId);
    },
    youtubePlaylistByChannelId: async (_, { channelId }) => {
      return await _playlistsSqlite({ filter: `channelId='${channelId}'` });
    },
    youtubeAllVideos: async (_, args) => {
      const videos = await _videosSqlite(args);
      return Promise.all(
        videos.map(async (video) => {
          video.playlist = await _playlistOneByIdSqlite(video.playlistId);
          return video;
        })
      );
    },
    youtubeVideoById: async (_, { videoId }) => {
      return await _videoById(videoId);
    },
    youtubeVideosByPlaylistId: async (_, { playlistId }) => {
      const videos = await _videosByPlaylistIdSqlite(playlistId);
      return Promise.all(
        videos.map(async (video) => await _videoByVideoSqlite(video))
      );
    },
    youtubeVideosByChannelId: async (_, { channelId }) => {
      const videos = await _videosByChannelIdSqlite(channelId);
      return Promise.all(
        videos.map(async (video) => await _videoByVideoSqlite(video))
      );
    },
    youtubeMostPopularVideos: async (_, args) => {
      return await _mostPopularVideosApi(args);
    },

    youtubeWatchLaterVideos: async (_, args) => {
      const videoIds = await _specialVideoIdsSqlite(args.userId, 'watchLater');
      // console.log(`youtubeWatchLaterVideoIds: ${videoIds}`);
      for (const videoId of videoIds) {
        // videoId가 db에 있는지 확인
        // 없으면 api 호출 -> db 저장
        // 있으면 db에서 가져오기
      }
      return await Promise.all(
        videoIds.split(',').map(async (videoId) => await _videoById(videoId))
      );
    },
    youtubeHistoryVideos: async (_, args) => {
      const videoIds = await _specialVideoIdsSqlite(args.userId, 'history');
      return await Promise.all(
        videoIds.split(',').map(async (videoId) => await _videoById(videoId))
      );
    },

    // * chrome
    youtubeWatchLaterVideosApi: async (_, args) => {
      return await _watchLaterVideosApi(args.userId);
    },
    youtubeHistoryVideosApi: async (_, args) => {
      return await _historyVideosApi(args.userId);
    },
    youtubeShortsVideosByChannelIdApi: async (_, args) => {
      return await _shortsVideosByChannelIdApi(args.channelId);
    },
  },

  // * * Mutations
  Mutation: {
    // * JSON -> SQLite
    youtubeUpsertUsersFromJson: async (
      _,
      { path = `${JSON_ROOT}/users.json` }
    ) => {
      const users = loadJson(path);
      await _upsertUsersSqlite(users);
      return { success: true };
    },
    youtubeUpsertSubscriptionsFromJson: async (
      _,
      { path = `${JSON_ROOT}/subscriptions.json` }
    ) => {
      const subscriptions = loadJson(path);
      await _upsertSubscriptionsSqlite(subscriptions);
      return { success: true };
    },
    youtubeUpsertChannelsFromJson: async (
      _,
      { path = `${JSON_ROOT}/channels.json` }
    ) => {
      const channels = loadJson(path);
      await _upsertChannelsSqlite(channels);
      return { success: true };
    },
    youtubeUpsertPlaylistsFromJson: async (
      _,
      { path = `${JSON_ROOT}/playlists.json` }
    ) => {
      const playlists = loadJson(path);
      await _upsertPlaylistsSqlite(playlists);
      return { success: true };
    },
    youtubeUpsertVideosFromJson: async (
      _,
      { path = `${JSON_ROOT}/videos.json` }
    ) => {
      const videos = loadJson(path);
      await _upsertVideosSqlite(videos);
      return { success: true };
    },
    // * API -> Sqlite
    youtubeUpsertSubscriptionsFromApi: async (_, args) => {
      const subscriptions = await _subscriptionsApi(args.userId);
      await _upsertSubscriptionsSqlite(subscriptions);
      return { success: true };
    },
    youtubeUpsertChannelsFromApi: async (_, args) => {
      const subscriptions = await _subscriptionsByUserIdSqlite(args.userId);
      const channelIds = subscriptions.map(
        (subscription) => subscription.channelId
      );
      const channels = await Promise.all(
        channelIds.map(async (channelId) => await _channelByIdApi(channelId))
      );
      console.log(channels);
      await _upsertChannelsSqlite(channels);
      return { success: true };
    },
    youtubeUpsertPlaylistsFromApi: async (_, args) => {
      const playlists = await _playlistsByChannelIdApi(args.channelId);
      await _upsertPlaylistsSqlite(playlists);
      return { success: true };
    },
    youtubeUpsertPlaylistsByUserIdFromApi: async (_, args) => {
      const subscriptions = await _subscriptionsByUserIdSqlite(args.userId);
      const channelIds = subscriptions.map(
        (subscription) => subscription.channelId
      );
      const playlists = [];
      for (const channelId of channelIds) {
        const _playlists = await _playlistsByChannelIdApi(channelId);
        playlists.push(..._playlists);
      }
      console.log(`playlists.length: ${playlists.length}`);
      await _upsertPlaylistsSqlite(playlists);
      return { success: true };
    },
    youtubeUpsertVideosFromApi: async (_, args) => {
      const videos = await _videosByChannelIdApi(args.channelId);
      await _upsertVideosSqlite(videos);
      return { success: true };
    },
    // * API -> JSON
    youtubeMostPopularVideosToJson: async (_, args) => {
      const videos = await _mostPopularVideosApi();
      saveJson(`${JSON_ROOT}/mostPopularVideos.json`, videos);
      return { success: true };
    },

    youtubeDownloadVideos: async (_, args) => {
      const { videoIds, resolution = '720', bitrate = '128', languages = 'en,ko', formatType = 'srt', outputDir = BASE_DOWN_DIR } =
        args;
      await downloadYoutubeAll({ videoIds, resolution, bitrate, languages, formatType, outputDir });
      return { success: true };
    },

    youtubeDownloadPlaylist: async (_, args) => {
      const { playlistId, resolution = '720', bitrate = '128', languages = 'en,ko', formatType = 'srt', outputDir = BASE_DOWN_DIR } =
        args;
      await downloadPlaylist({ playlistId, resolution, bitrate, languages, formatType, outputDir });
      return { success: true };
    },
  },
};

// * * TEST
// console.log(JSON_ROOT);

// * 쿼리 함수 테스트
// const videoId = 'w8QxTAmZEdo';
// const video = await _videoById(videoId);
// console.log(video);

// const videoId = 'w8QxTAmZEdo';
// const video = await _videoOneByIdSqlite(videoId);
// console.log(video);
// const _video = await _videoByVideoSqlite(video);
// console.log(_video);

// const playlistId = 'PLs8gZ5b9piXU5Ymi6SjQWulZCkDDFuQfe';
// const videos = await _videosByPlaylistId(playlistId);
// console.log(videos);

// const args = { userId: 'bigwhitekmc' };
// const subscriptions = await _subscriptionsByUserIdSqlite(args.userId);
// const channelIds = subscriptions.map((subscription) => subscription.channelId);
// const channels = await Promise.all(
//   channelIds.map(async (channelId) => await _channelByIdApi(channelId))
// );
// console.log(channels);

// const subscriptions = await _subscriptionsByUserIdSqlite(args.userId);
// const channelIds = subscriptions.map((subscription) => subscription.channelId);

// const playlists = [];
// for (const channelId of channelIds.slice(1, 3)) {
//   const _playlists = await _playlistsByChannelIdApi(channelId);
//   playlists.push(..._playlists);
// }
// console.log(playlists);
// console.log(channelIds.length);
// console.log(playlists.length);
// await _upsertPlaylistsSqlite(playlists);
