import { loadJson, saveJson } from 'jnj-lib-base';

import {
  AllResponses,
  ChannelIdByCustomUrl,
  videosFromVideoIds,
  isShorts,
  mostPopularVideoIds,
} from '../../utils/youtube/rest.js';
import {
  mySubscriptions,
  myPlaylistItems,
} from '../../utils/youtube/google.js';
import {
  watchLaterVideoIds,
  historyVideoIds,
  shortsVideoIds,
} from '../../utils/youtube/chrome.js';
import {
  downloadYoutubeAll,
  downloadPlaylist,
  BASE_DOWN_DIR,
  listIdsInDir,
} from '../../utils/youtube/down.js';

import { JSON_DB_DIR } from '../../utils/settings.js';

const PLAYLISTS_IN_SUBSCRIPTIONS = 'playlistsInSubscriptions';
const CHANNELS_IN_SUBSCRIPTIONS = 'channelsInSubscriptions';
const VIDEOS_IN_PLAYLISTS = 'videosInPlaylists';
const VIDEOS_MOST_POPULAR = 'videosMostPopular';

const jsonPath = (fileName) => `${JSON_DB_DIR}/youtube/${fileName}.json`;

const saveYoutubeJson = (name, data, { key = undefined }) => {
  const jsonData = loadJson(jsonPath(name)) || {};
  if (key) {
    jsonData[key] = data;
  } else {
    jsonData = data;
  }
  saveJson(jsonPath(name), jsonData);
};

const _channelDetail = async (channelId) => {
  const response = await AllResponses('channels', {
    part: 'snippet,statistics,contentDetails',
    id: channelId,
  });
  if (!response || response.length === 0) {
    return {};
  }
  const detail = response[0];
  return {
    id: channelId,
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

const _PlaylistsByChannelId = async (channelId) => {
  const response = await AllResponses('playlists', {
    part: 'id,snippet,contentDetails,status',
    channelId,
  });
  if (!response || response.length === 0) {
    return [];
  }

  const playlists = response.map((playlist) => ({
    id: playlist.id,
    title: playlist.snippet.title,
    description: playlist.snippet.description,
    thumbnail:
      playlist.snippet.thumbnails.medium?.url ||
      playlist.snippet.thumbnails.default?.url,
    channelTitle: playlist.snippet.channelTitle,
    publishedAt: playlist.snippet.publishedAt,
    itemCount: playlist.contentDetails.itemCount,
    privacyStatus: playlist.status.privacyStatus,
  }));
  return playlists;
};

const _VideoIdsByPlaylistId = async (playlistId, maxItems = 50) => {
  try {
    const response = await AllResponses('playlistItems', {
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
const _VideoIdsByChannelId = async (channelId, maxItems = 50) => {
  try {
    const response = await AllResponses('channels', {
      part: 'contentDetails',
      id: channelId,
    });
    const uploadsPlaylistId =
      response[0].contentDetails.relatedPlaylists.uploads;
    return await _VideoIdsByPlaylistId(uploadsPlaylistId, maxItems);
  } catch (error) {
    console.error('채널 동영상 가져오기 실패:', error);
    throw new Error('채널을 찾을 수 없거나 접근할 수 없습니다.');
  }
};

const _VideoDetailByVideoId = async (videoId) => {
  const response = await AllResponses('videos', {
    part: 'snippet,contentDetails,statistics,player',
    id: videoId,
  });
  if (!response || response.length === 0) {
    return {};
  }
  const detail = response[0];
  const channelDetail = await _channelDetail(detail.snippet.channelId);
  return {
    id: detail.id,
    title: detail.snippet.title,
    description: detail.snippet.description,
    thumbnail:
      detail.snippet.thumbnails.medium?.url ||
      detail.snippet.thumbnails.default?.url,
    channelId: detail.snippet.channelId,
    channelTitle: detail.snippet.channelTitle,
    channelThumbnail: channelDetail.thumbnail,
    publishedAt: detail.snippet.publishedAt,
    duration: detail.contentDetails.duration,
    caption: detail.contentDetails.caption,
    tags: detail.snippet.tags || [],
    viewCount: detail.statistics.viewCount,
    likeCount: detail.statistics.likeCount,
    dislikeCount: detail.statistics.dislikeCount,
    favoriteCount: detail.statistics.favoriteCount,
    commentCount: detail.statistics.commentCount,
    embedHtml: detail.player?.embedHtml,
    embedHeight: detail.player?.embedHeight,
    embedWidth: detail.player?.embedWidth,
  };
};

export const resolvers = {
  Query: {
    youtubeChannels: async (_, args) => {
      try {
        const { part = 'snippet,statistics', ...otherArgs } = args;
        const response = await AllResponses('channels', {
          part,
          ...otherArgs,
        });
        console.log('youtubeChannels: ', response);
        return response;
      } catch (error) {
        console.error(
          'YouTube API 오류:',
          error.response?.data || error.message
        );
        throw new Error('YouTube API 요청 중 오류가 발생했습니다.');
      }
    },
    youtubeChannelDetail: async (_, { id }) => {
      return await _channelDetail(id);
    },
    youtubeChannelIdByCustomUrl: async (_, { customUrl }) => {
      return await ChannelIdByCustomUrl(customUrl);
    },
    youtubeChannelDetailByCustomUrl: async (_, { customUrl }) => {
      const channelId = await ChannelIdByCustomUrl(customUrl);
      return await _channelDetail(channelId);
    },
    youtubePlaylists: async (_, args) => {
      try {
        const {
          part = 'contentDetails,id,localizations,player,snippet,status',
          ...otherArgs
        } = args;
        const response = await AllResponses('playlists', {
          part,
          ...otherArgs,
        });
        console.log('youtubePlaylists: ', response);
        return response;
      } catch (error) {
        console.error(
          'YouTube API 오류:',
          error.response?.data || error.message
        );
        throw new Error('YouTube API 요청 중 오류가 발생했습니다.');
      }
    },
    youtubePlaylistsByChannelId: async (_, { channelId }) => {
      return await _PlaylistsByChannelId(channelId);
    },
    youtubePlaylistsByCustomUrl: async (_, { customUrl }) => {
      const channelId = await ChannelIdByCustomUrl(customUrl);
      return await _PlaylistsByChannelId(channelId);
    },
    youtubePlaylistItems: async (_, args) => {
      try {
        const { part = 'contentDetails,id,snippet,status', ...otherArgs } =
          args;
        const response = await AllResponses('playlistItems', {
          part,
          ...otherArgs,
        });

        return response;
      } catch (error) {
        console.error(
          'YouTube API 오류:',
          error.response?.data || error.message
        );
        throw new Error('YouTube API 요청 중 오류가 발생했습니다.');
      }
    },
    youtubeSimplePlaylistItems: async (_, args) => {
      try {
        const response = await AllResponses('playlistItems', {
          part: 'contentDetails,id,snippet,status',
          playlistId: args.playlistId,
        });
        console.log('youtubePlaylistItems: ', response);
        const items = response.map((item) => ({
          title: item.snippet.title,
          videoId: item.contentDetails.videoId,
          description: item.snippet.description,
          thumbnail:
            item.snippet.thumbnails.medium?.url ||
            item.snippet.thumbnails.default?.url,
        }));

        return items;
      } catch (error) {
        console.error(
          'YouTube API 오류:',
          error.response?.data || error.message
        );
        throw new Error('YouTube API 요청 중 오류가 발생했습니다.');
      }
    },
    youtubeVideoDetailsByPlaylistId: async (
      _,
      { playlistId, maxItems = 50 }
    ) => {
      try {
        const videoIds = await _VideoIdsByPlaylistId(playlistId, maxItems);

        if (videoIds.length === 0) {
          return [];
        }

        const videoDetails = await Promise.all(
          videoIds.map((videoId) => _VideoDetailByVideoId(videoId))
        );
        return videoDetails;
      } catch (error) {
        console.error('재생목록 동영상 상세정보 가져오기 실패:', error);
        throw error;
      }
    },
    youtubeVideoIdsByChannelId: async (_, { channelId, maxItems = 50 }) => {
      return await _VideoIdsByChannelId(channelId, { maxItems });
    },
    youtubeVideoDetailsByChannelId: async (
      _,
      { channelId, maxItems = 50 }
    ) => {
      try {
        const videoIds = await _VideoIdsByChannelId(channelId, maxItems);

        if (videoIds.length === 0) {
          return [];
        }

        const videoDetails = await Promise.all(
          videoIds.map((videoId) => _VideoDetailByVideoId(videoId))
        );
        return videoDetails;
      } catch (error) {
        console.error('채널 동영상 상세정보 가져오기 실패:', error);
        throw error;
      }
    },
    youtubeSearch: async (_, args) => {
      try {
        const { part = 'snippet', ...otherArgs } = args;
        const response = await AllResponses('search', {
          part,
          ...otherArgs,
        });
        console.log('youtubeSearch: ', response);
        return response;
      } catch (error) {
        console.error(
          'YouTube API 오류:',
          error.response?.data || error.message
        );
        throw new Error('YouTube API 요청 중 오류가 발생했습니다.');
      }
    },
    youtubeMostPopularVideos: async (_, { maxItems = 50 }) => {
      const videoIds = await mostPopularVideoIds(maxItems);
      const videoDetails = await Promise.all(
        videoIds.map((videoId) => _VideoDetailByVideoId(videoId))
      );
      return videoDetails;
    },
    youtubeSubscriptions: async (_, args) => {
      try {
        const response = await AllResponses('subscriptions', args);
        console.log('youtubeSubscriptions: ', response);
        return response;
      } catch (error) {
        console.error(
          'YouTube API 오류:',
          error.response?.data || error.message
        );
        throw new Error('YouTube API 요청 중 오류가 발생했습니다.');
      }
    },
    youtubeVideos: async (_, args) => {
      try {
        const { part = 'snippet,contentDetails,statistics', ...otherArgs } =
          args;
        const response = await AllResponses('videos', {
          part,
          ...otherArgs,
        });
        console.log('youtubeVideos: ', response);
        return response;
      } catch (error) {
        console.error(
          'YouTube API 오류:',
          error.response?.data || error.message
        );
        throw new Error('YouTube API 요청 중 오류가 발생했습니다.');
      }
    },
    // * GOOGLE CLOUD(JNJ-LIB-GOOGLE) 사용 jnj-lib-google
    youtubeMySubscriptions: async (_, { userId }) => {
      try {
        if (!userId) {
          throw new Error('userId가 필요합니다.');
        }

        const subscriptions = await mySubscriptions(userId);

        if (!subscriptions || !Array.isArray(subscriptions)) {
          console.error('구독 정보를 가져오는데 실패했습니다.');
          return [];
        }

        const channelDetails = await Promise.all(
          subscriptions.map(async (subscription) => {
            try {
              if (!subscription?.snippet?.resourceId?.channelId) {
                console.warn(
                  '채널 ID가 없는 구독 항목이 있습니다:',
                  subscription
                );
                return null;
              }
              return await _channelDetail(
                subscription.snippet.resourceId.channelId
              );
            } catch (error) {
              console.error('채널 상세 정보 가져오기 실패:', error);
              return null;
            }
          })
        );

        // null 값 제거
        const filteredChannelDetails = channelDetails.filter(Boolean);

        // JSON 저장 시도
        try {
          const save = true;
          if (save) {
            const mySubs = loadJson(jsonPath(PLAYLISTS_IN_SUBSCRIPTIONS)) || {};
            mySubs[userId] = filteredChannelDetails;
            saveJson(jsonPath(PLAYLISTS_IN_SUBSCRIPTIONS), mySubs);
          }
        } catch (saveError) {
          console.error('JSON 저장 중 오류 발생:', saveError);
          // JSON 저장 실패는 전체 작업을 실패시키지 않음
        }

        return filteredChannelDetails;
      } catch (error) {
        console.error('구독 정보 가져오기 실패:', error);
        throw new Error(
          error.message || '구독 정보를 가져오는데 실패했습니다.'
        );
      }
    },
    youtubeSimpleMySubscriptions: async (_, args) => {
      const subscriptions = await mySubscriptions(args.userId);
      return subscriptions.map((subscription) => ({
        title: subscription.snippet.title,
        channelId: subscription.snippet.resourceId.channelId,
        thumbnail: subscription.snippet.thumbnails.default?.url,
        description: subscription.snippet.description,
      }));
    },
    youtubeMyLikeVideos: async (_, args) => {
      return await myPlaylistItems(args.userId, 'LL');
    },
    // * CHROME 사용(playwright)
    youtubeMyWatchLaterVideos: async (_, args) => {
      const videoIds = await watchLaterVideoIds(args.userId);
      return await videosFromVideoIds(videoIds);
    },
    youtubeMyHistoryVideos: async (_, args) => {
      const videoIds = await historyVideoIds(args.userId);
      return await videosFromVideoIds(videoIds);
    },
    youtubeShortsVideos: async (_, args) => {
      const videoIds = await shortsVideoIds(args.userId);
      return await videosFromVideoIds(videoIds);
    },

    // * DOWNLOAD
    youtubeDownloadYoutube: async (_, args) => {
      // console.log('youtubeDownloadYoutube: ', args);
      const response = await downloadYoutubeAll(args);
      console.log(response);
      return response;
    },
    youtubeDownloadPlaylist: async (_, args) => {
      return await downloadPlaylist(args);
    },
    youtubeIdsInDir: (_, args) => {
      const dir = args.dir.length > 2 ? args.dir : BASE_DOWN_DIR;
      return listIdsInDir(dir);
    },
    // // * save json
    // youtubeSavePlaylistsInChannel: async (_, args) => {
    //   const channelIds = loadJson(jsonPath(CHANNELS_IN_SUBSCRIPTIONS))
    //     [args.userId].map((subscription) => subscription.id)
    //     .slice(0, 1);
    //   const playlists = await Promise.all(
    //     channelIds.map((id) => _PlaylistsByChannelId(id))
    //   );
    //   // try {
    //   //   saveYoutubeJson(PLAYLISTS_IN_SUBSCRIPTIONS, playlists, {
    //   //     key: args.userId,
    //   //   });
    //   // } catch (error) {
    //   //   console.error('플레이리스트 저장 중 오류 발생:', error);
    //   //   throw error;
    //   // }
    //   return playlists;
    // },
  },
};

// const args = { userId: 'mooninlearn' };
// const userId = args.userId;
// const channelIds = loadJson(jsonPath(CHANNELS_IN_SUBSCRIPTIONS))
//   [userId].map((subscription) => subscription.id)
//   .slice(0, 1);
// console.log(channelIds);
// const playlists = await Promise.all(
//   channelIds.map((id) => {
//     const _playlists = _PlaylistsByChannelId(id);
//     return { [id]: _playlists };
//   })
// );

// console.log(playlists);
// try {
//   saveYoutubeJson(PLAYLISTS_IN_SUBSCRIPTIONS, playlists, {
//     key: userId,
//   });
// } catch (error) {
//   console.error('플레이리스트 저장 중 오류 발생:', error);
//   throw error;
// }
