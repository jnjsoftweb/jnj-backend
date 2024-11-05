import { loadJson, saveJson } from 'jnj-lib-base';
import { JSON_DB_DIR } from '../../env.js';

import {
  getAllResponses,
  getChannelIdByCustomUrl,
  videosFromVideoIds,
  isShorts,
  mostPopularVideoIds,
} from '../../utils/youtube/rest.js';
import {
  mySubscriptions,
  myPlaylistItems,
} from '../../utils/youtube/google.js';
// import {
//   watchLaterVideoIds,
//   historyVideoIds,
//   shortsVideoIds,
// } from '../../utils/youtube/chrome.js';
// import {
//   downloadYoutubeAll,
//   downloadPlaylist,
//   BASE_DOWN_DIR,
//   listIdsInDir,
// } from '../../utils/youtube/down.js';

const MAX_VIDEO_ITEMS_IN_PLAYLIST = 1000;
const MAX_VIDEO_ITEMS_IN_CHANNEL = 10000;

const _subscriptionsApi = async (userId) => {
  const subscriptions = await mySubscriptions(userId);
  return subscriptions.map((subscription) => {
    const channelId = subscription.snippet.resourceId.channelId;
    return {
      subscriptionId: `${userId}_${channelId}`,
      userId,
      channelId,
    };
  });
};

const _channelByIdApi = async (channelId) => {
  const response = await getAllResponses('channels', {
    part: 'snippet,statistics,contentDetails',
    id: channelId,
  });
  if (!response || response.length === 0) {
    return {};
  }
  const detail = response[0];

  return {
    channelId,
    title: detail.snippet.title,
    customUrl: detail.snippet.customUrl,
    uploadsPlaylistId: detail.contentDetails.relatedPlaylists.uploads,
    publishedAt: detail.snippet.publishedAt,
    description: detail.snippet.description,
    thumbnail:
      detail.snippet.thumbnails.medium?.url ||
      detail.snippet.thumbnails.default?.url,
    viewCount: detail.statistics.viewCount,
    subscriberCount: detail.statistics.subscriberCount,
    videoCount: detail.statistics.videoCount,
  };
};

const _scubscriptionChannelsApi = async (userId) => {
  const subscriptions = await mySubscriptions(userId);
  return subscriptions.map((subscription) => {
    const channelId = subscription.snippet.resourceId.channelId;
    return _channelByIdApi(channelId);
  });
};

const _playlistIdsByChannelIdApi = async (channelId) => {
  const response = await getAllResponses('playlists', {
    part: 'id',
    channelId,
  });
  if (!response || response.length === 0) {
    return [];
  }

  const playlists = response.map((playlist) => playlist.id);
  return playlists;
};

const _playlistsByChannelIdApi = async (channelId) => {
  const response = await getAllResponses('playlists', {
    part: 'id,snippet,contentDetails,status',
    channelId,
  });
  if (!response || response.length === 0) {
    return [];
  }

  const videoIds = await _videoIdsByPlaylistIdStr(playlist.id);

  return response.map((playlist) => ({
    playlistId: playlist.id,
    channelId,
    title: playlist.snippet.title,
    description: playlist.snippet.description,
    thumbnail:
      playlist.snippet.thumbnails.medium?.url ||
      playlist.snippet.thumbnails.default?.url,
    publishedAt: playlist.snippet.publishedAt,
    itemCount: playlist.contentDetails.itemCount,
    privacyStatus: playlist.status.privacyStatus,
    videoIds,
  }));
};

const _videoIdsByPlaylistIdApi = async (
  playlistId,
  maxItems = MAX_VIDEO_ITEMS_IN_PLAYLIST
) => {
  try {
    const response = await getAllResponses('playlistItems', {
      part: 'contentDetails',
      playlistId,
    });

    if (!response || response.length === 0) {
      console.log(
        `재생목록 ID ${playlistId}에 대한 동영상을 찾을 수 없습니다.`
      );
      return [];
    }

    return response
      .slice(0, maxItems)
      .map((item) => item.contentDetails.videoId);
  } catch (error) {
    console.error('재생목록 동영상 가져오기 실패:', error);
    return [];
    // throw new Error('재생목록을 찾을 수 없거나 접근할 수 없습니다.');
  }
};

const _videoIdsByPlaylistIdStr = async (playlistId) => {
  const videoIds = await _videoIdsByPlaylistIdApi(playlistId);
  return videoIds.join(',');
};

// uploadsPlaylistId
const _uploadsPlaylistIdByChannelIdApi = async (channelId) => {
  const response = await getAllResponses('channels', {
    part: 'contentDetails',
    id: channelId,
  });
  return response[0].contentDetails.relatedPlaylists.uploads;
};

const _videoIdsInUploadsPlaylistByChannelIdApi = async (
  channelId,
  maxItems = MAX_VIDEO_ITEMS_IN_CHANNEL
) => {
  try {
    const uploadsPlaylistId = await _uploadsPlaylistIdByChannelIdApi(channelId);
    const videoIds_ = await _videoIdsByPlaylistIdApi(
      uploadsPlaylistId,
      maxItems
    );
    return videoIds_.map((videoId) => ({
      videoId,
      playlistId: uploadsPlaylistId,
    }));
  } catch (error) {
    console.error('채널 동영상 가져오기 실패:', error);
    throw new Error('채널을 찾을 수 없거나 접근할 수 없습니다.');
  }
};

const _videoIdsInPlaylistsByChannelIdApi = async (
  channelId,
  maxItems = MAX_VIDEO_ITEMS_IN_CHANNEL
) => {
  const playlistIds = await _playlistIdsByChannelIdApi(channelId);
  let videoIds = [];
  for (const playlistId of playlistIds) {
    const videoIds_ = await _videoIdsByPlaylistIdApi(
      playlistId,
      MAX_VIDEO_ITEMS_IN_PLAYLIST
    );
    videoIds_.forEach((videoId) => {
      videoIds.push({ videoId, playlistId });
    });
  }
  return videoIds;
};

const _videoIdsByChannelIdApi = async (
  channelId,
  maxItems = MAX_VIDEO_ITEMS_IN_CHANNEL
) => {
  const videoIds = await _videoIdsInPlaylistsByChannelIdApi(
    channelId,
    maxItems
  );
  const uploadsVideoIds = await _videoIdsInUploadsPlaylistByChannelIdApi(
    channelId,
    maxItems
  );

  // videoIds에 있는 videoId를 제외한 uploadsVideoIds만 필터링
  const filteredUploadsVideoIds = uploadsVideoIds.filter(
    (uploadVideo) =>
      !videoIds.some((video) => video.videoId === uploadVideo.videoId)
  );

  return [...videoIds, ...filteredUploadsVideoIds];
};

const _videoByIdApi = async (videoId, playlistId = '') => {
  const response = await getAllResponses('videos', {
    part: 'snippet,contentDetails,statistics,player',
    id: videoId,
  });
  if (!response || response.length === 0) {
    return {};
  }
  const detail = response[0];
  return {
    videoId: detail.id,
    playlistId,
    title: detail.snippet.title,
    description: detail.snippet.description,
    thumbnail:
      detail.snippet.thumbnails.medium?.url ||
      detail.snippet.thumbnails.default?.url,
    channelId: detail.snippet.channelId,
    publishedAt: detail.snippet.publishedAt,
    duration: detail.contentDetails.duration,
    caption: detail.contentDetails.caption,
    tags: detail.snippet.tags ? detail.snippet.tags.join(',') : '',
    viewCount: detail.statistics.viewCount,
    likeCount: detail.statistics.likeCount,
    commentCount: detail.statistics.commentCount,
  };
};

const _videosByChannelIdApi = async (
  channelId,
  maxItems = MAX_VIDEO_ITEMS_IN_CHANNEL
) => {
  try {
    const videoIds = await _videoIdsByChannelIdApi(channelId, maxItems);
    const videos = await Promise.all(
      videoIds.map(async ({ videoId, playlistId }) => {
        return await _videoByIdApi(videoId, playlistId);
      })
    );
    return videos;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

const resolvers = {
  Query: {
    youtubeSubscriptionsApi: async (_, args) => {
      return await _subscriptionsApi(args.userId);
    },
    youtubeChannelByIdApi: async (_, args) => {
      return await _channelByIdApi(args.channelId);
    },
    youtubePlaylistsByChannelIdApi: async (_, args) => {
      return await _playlistsByChannelIdApi(args.channelId);
    },
    youtubeAllVideosApi: async (_, args) => {
      return await _videosByChannelIdApi(args.channelId);
    },
    youtubeVideoByIdApi: async (_, args) => {
      return await _videoByIdApi(args.videoId);
    },
    youtubeVideoIdsByPlaylistIdApi: async (_, args) => {
      return await _videoIdsByPlaylistIdApi(args.playlistId);
    },
    youtubeVideoIdsByChannelIdApi: async (_, args) => {
      return await _videoIdsByChannelIdApi(args.channelId);
    },
  },

  Mutation: {},
};

export {
  _subscriptionsApi,
  _channelByIdApi,
  _playlistsByChannelIdApi,
  _videosByChannelIdApi,
  _videoByIdApi,
  _videoIdsByPlaylistIdApi,
  _videoIdsByChannelIdApi,
  resolvers,
};

// // // * API -> JSON
// // // * subscriptions
// // const userId = "mooninlearn";
// // const subscriptions = await _youtubeApiSubscriptionsApi(userId);
// // saveJson(`${JSON_DB_DIR}/youtube/youtubeSubscriptions.json`, subscriptions);

// // * channels
// const channels_ = loadJson(`${JSON_DB_DIR}/youtube/youtubeSubscriptions.json`);
// const channelIds = channels_.map((channel) => channel.channelId);
// console.log(channelIds);

// // let channels = [];
// // for (const channelId of channelIds) {
// //   const channel = await _youtubeApiChannelByIdApi(channelId);
// //   console.log(channel);
// //   channels.push(channel);
// // }
// // saveJson(`${JSON_DB_DIR}/youtube/youtubeChannels.json`, channels);

// // // * playlists
// // let playlists = [];
// // for (const channelId of channelIds) {
// //   const _playlistsApi = await _playlistsByChannelIdApi(channelId);
// //   playlists = [...playlists, ..._playlists];
// // }
// // saveJson(`${JSON_DB_DIR}/youtube/youtubePlaylists.json`, playlists);

// // * videos
// let videos = [];
// for (const channelId of channelIds.slice(20, 25)) {
//   const videos_ = await _videosByChannelIdApi(channelId);
//   console.log('Channel videos:', videos_.length); // 디버깅용
//   videos = [...videos, ..._videos];
// }
// console.log('Total videos:', videos.length); // 디버깅용
// saveJson(`${JSON_DB_DIR}/youtube/youtubeVideos.json`, videos);

// // 재생목록 ID PLWKjhJtqVAbmfeXEWjfX3PmcMPVeGEc-0에 대한 동영상을 찾을 수 없습니다.

// // !!! 추가 성공: 0 ~ 9
// // !!! Channel videos: 756 (channelIds[10])
// // 재생목록 ID PLWKjhJtqVAbmfeXEWjfX3PmcMPVeGEc-0에 대한 동영상을 찾을 수 없습니다.
