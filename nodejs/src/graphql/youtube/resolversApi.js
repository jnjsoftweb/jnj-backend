import { loadJson, saveJson } from 'jnj-lib-base';
import { JSON_DB_DIR } from '../../utils/settings.js';

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

const _youtubeApiSubscriptions = async (userId) => {
  const subscriptions = await mySubscriptions(userId);
  return subscriptions.map((subscription) => {
    const channelId = subscription.snippet.resourceId.channelId;
    return {
      subscriptionId: `${userId}_${channelId}`,
      userId,
      channelId,
    };
  });
}

const _youtubeApiChannelById = async (channelId) => {
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

const _youtubeApiSubscriptionChannels = async (userId) => {
    const subscriptions = await mySubscriptions(userId);
    return subscriptions.map((subscription) => {
      const channelId = subscription.snippet.resourceId.channelId;
      return _youtubeApiChannelById(channelId);
    });
}

const _playlistIdsByChannelId = async (channelId) => {
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

const _playlistsByChannelId = async (channelId) => {
    const response = await getAllResponses('playlists', {
      part: 'id,snippet,contentDetails,status',
      channelId,
    });
    if (!response || response.length === 0) {
      return [];
    }

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
    }));
};

const _videoIdsByPlaylistId = async (playlistId, maxItems = MAX_VIDEO_ITEMS_IN_PLAYLIST) => {
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
      throw new Error('재생목록을 찾을 수 없거나 접근할 수 없습니다.');
    }
};

// uploadsPlaylistId
const _uploadsPlaylistIdByChannelId = async (channelId) => {
    const response = await getAllResponses('channels', {
      part: 'contentDetails',
      id: channelId,
    });
    return response[0].contentDetails.relatedPlaylists.uploads;
}

const _videoIdsInUploadsPlaylistByChannelId = async (channelId, maxItems = MAX_VIDEO_ITEMS_IN_CHANNEL) => {
    try {
      const uploadsPlaylistId = await _uploadsPlaylistIdByChannelId(channelId);
      const _videoIds = await _videoIdsByPlaylistId(uploadsPlaylistId, maxItems);
      return _videoIds.map((videoId) => ({ videoId, playlistId: uploadsPlaylistId }));
    } catch (error) {
      console.error('채널 동영상 가져오기 실패:', error);
      throw new Error('채널을 찾을 수 없거나 접근할 수 없습니다.');
    }
};

const _videoIdsInPlaylistsByChannelId = async (channelId, maxItems = MAX_VIDEO_ITEMS_IN_CHANNEL) => {
    const playlistIds = await _playlistIdsByChannelId(channelId);
    let videoIds = [];
    for (const playlistId of playlistIds) {
      const _videoIds = await _videoIdsByPlaylistId(playlistId, MAX_VIDEO_ITEMS_IN_PLAYLIST);
      _videoIds.forEach((videoId) => {
        videoIds.push({ videoId, playlistId });
      });
    }
    return videoIds;
}

const _videoIdsByChannelId = async (channelId, maxItems = MAX_VIDEO_ITEMS_IN_CHANNEL) => {
    const videoIds = await _videoIdsInPlaylistsByChannelId(channelId, maxItems);
    const uploadsVideoIds = await _videoIdsInUploadsPlaylistByChannelId(channelId, maxItems);
    
    // videoIds에 있는 videoId를 제외한 uploadsVideoIds만 필터링
    const filteredUploadsVideoIds = uploadsVideoIds.filter(
        uploadVideo => !videoIds.some(video => video.videoId === uploadVideo.videoId)
    );

    return [...videoIds, ...filteredUploadsVideoIds];
}
  
const _videoById = async (videoId, playlistId='') => {
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

const _videosByChannelId = async (channelId, maxItems = MAX_VIDEO_ITEMS_IN_CHANNEL) => {
  try {
    const videoIds = await _videoIdsByChannelId(channelId, maxItems);
    const videos = await Promise.all(
      videoIds.map(async ({ videoId, playlistId }) => {
        return await _videoById(videoId, playlistId);
      })
    );
    return videos;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

// // * API -> JSON
// // * subscriptions
// const userId = "mooninlearn";
// const subscriptions = await _youtubeApiSubscriptions(userId);
// saveJson(`${JSON_DB_DIR}/youtube/youtubeSubscriptions.json`, subscriptions);

// // * channels
// const _channels = loadJson(`${JSON_DB_DIR}/youtube/youtubeSubscriptions.json`);
// const channelIds = _channels.map((channel) => channel.channelId);
// console.log(channelIds);

// let channels = [];
// for (const channelId of channelIds) {
//   const channel = await _youtubeApiChannelById(channelId);
//   console.log(channel);
//   channels.push(channel);
// }
// saveJson(`${JSON_DB_DIR}/youtube/youtubeChannels.json`, channels);

// // * playlists
// let playlists = [];
// for (const channelId of channelIds) {
//   const _playlists = await _playlistsByChannelId(channelId);
//   playlists = [...playlists, ..._playlists];
// }
// saveJson(`${JSON_DB_DIR}/youtube/youtubePlaylists.json`, playlists);

// * videos
let videos = [];
for (const channelId of channelIds.slice(11, 15)) {
  const _videos = await _videosByChannelId(channelId);
  console.log('Channel videos:', _videos.length);  // 디버깅용
  videos = [...videos, ..._videos];
}
console.log('Total videos:', videos.length);  // 디버깅용
saveJson(`${JSON_DB_DIR}/youtube/youtubeVideos.json`, videos);

// !!! 추가 성공: 0 ~ 9 
// !!! Channel videos: 756 (channelIds[10])
// 재생목록 ID PLWKjhJtqVAbmfeXEWjfX3PmcMPVeGEc-0에 대한 동영상을 찾을 수 없습니다.




// * JSON -> DB

// * API -> DB
// * subscriptions
const upsertSubscriptionsSqlite = async (userId) => {
    const subscriptions = await _youtubeApiSubscriptions(userId);
    const _subscriptions = subscriptions
      .map(s => ({...s, subscriptionId: `${userId}_${s.channelId}`}))
      .filter(s => !sqlite.find('youtubeSubscriptions')
        .map(s => s.subscriptionId)
        .includes(s.subscriptionId)
      );
  
    sqlite.upsert('youtubeSubscriptions', _subscriptions, 'subscriptionId');
}

// * channels
const upsertChannelsSqlite = async (channels) => {
    const ids = sqlite.find('youtubeChannels').map(channel => channel.channelId)
    const _channels = channels.filter(c => !ids.includes(c.channelId))
    sqlite.upsert('youtubeChannels', _channels, 'channelId');
}

// * playlists
const upsertPlaylistsSqlite = async (channels) => {
    const ids = sqlite.find('youtubePlaylists').map(p => p.playlistId)
    const _playlists = channels.filter(p => !ids.includes(p.playlistId))
    sqlite.upsert('youtubePlaylists', _playlists, 'playlistId');
}

// * videos
const upsertVideosSqlite = async (channels) => {
    const ids = sqlite.find('youtubeVideos').map(v => v.videoId)
    const _videos = channels.filter(v => !ids.includes(v.videoId))
    sqlite.upsert('youtubeVideos', _videos, 'videoId');
}