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


const _channelDetail = async (channelId) => {
  const response = await getAllResponses('channels', {
    part: 'snippet,statistics', id: channelId
  });
  if (!response || response.length === 0) {
    return {};
  }
  const detail = response[0];
  return {
    title: detail.snippet.title,
    description: detail.snippet.description,
    thumbnail:
      detail.snippet.thumbnails.medium?.url ||
      detail.snippet.thumbnails.default?.url,
    viewCount: detail.statistics.viewCount,
    subscriberCount: detail.statistics.subscriberCount,
    videoCount: detail.statistics.videoCount,
  };
};

const _getPlaylistsByChannelId = async (channelId) => {
  const response = await getAllResponses('playlists', {
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
    thumbnail: playlist.snippet.thumbnails.medium?.url || playlist.snippet.thumbnails.default?.url,
    channelTitle: playlist.snippet.channelTitle,
    publishedAt: playlist.snippet.publishedAt,
    itemCount: playlist.contentDetails.itemCount,
    privacyStatus: playlist.status.privacyStatus,
  }));
  return playlists;
};

const _getVideoIdsByPlaylistId = async (playlistId) => {
  const response = await getAllResponses('playlistItems', {
    part: 'contentDetails',
    playlistId,
  });
  return response.map((item) => item.contentDetails.videoId);
};

const _getVideoDetailByVideoId = async (videoId) => {
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
    channelId: detail.snippet.channelId,
    title: detail.snippet.title,
    description: detail.snippet.description,
    thumbnail: detail.snippet.thumbnails.medium?.url || detail.snippet.thumbnails.default?.url,
    channelTitle: detail.snippet.channelTitle,
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
    youtubeGetChannels: async (_, args) => {
      try {
        const { part = 'snippet,statistics', ...otherArgs } = args;
        const response = await getAllResponses('channels', {
          part,
          ...otherArgs,
        });
        console.log('youtubeGetChannels: ', response);
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
    youtubeGetChannelIdByCustomUrl: async (_, { customUrl }) => {
      return await getChannelIdByCustomUrl(customUrl);
    },
    youtubeChannelDetailByCustomUrl: async (_, { customUrl }) => {
      const channelId = await getChannelIdByCustomUrl(customUrl);
      return await _channelDetail(channelId);
    },
    youtubeGetPlaylists: async (_, args) => {
      try {
        const {
          part = 'contentDetails,id,localizations,player,snippet,status',
          ...otherArgs
        } = args;
        const response = await getAllResponses('playlists', {
          part,
          ...otherArgs,
        });
        console.log('youtubeGetPlaylists: ', response);
        return response;
      } catch (error) {
        console.error(
          'YouTube API 오류:',
          error.response?.data || error.message
        );
        throw new Error('YouTube API 요청 중 오류가 발생했습니다.');
      }
    },
    youtubeGetPlaylistsByChannelId: async (_, { channelId }) => {
      return await _getPlaylistsByChannelId(channelId);
    },
    youtubeGetPlaylistsByCustomUrl: async (_, { customUrl }) => {
      const channelId = await getChannelIdByCustomUrl(customUrl);
      return await _getPlaylistsByChannelId(channelId);
    },
    youtubeGetPlaylistItems: async (_, args) => {
      try {
        const { part = 'contentDetails,id,snippet,status', ...otherArgs } =
          args;
        const response = await getAllResponses('playlistItems', {
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
    youtubeGetSimplePlaylistItems: async (_, args) => {
      try {
        const response = await getAllResponses('playlistItems', {
          part: 'contentDetails,id,snippet,status',
          playlistId: args.playlistId,
        });
        console.log('youtubeGetPlaylistItems: ', response);
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
    youtubeGetVideoDetailsByPlaylistId: async (_, { playlistId }) => {
      const videoIds = await _getVideoIdsByPlaylistId(playlistId);
      const videoDetails = await Promise.all(videoIds.map((videoId) => _getVideoDetailByVideoId(videoId)));
      return videoDetails;
    },
    youtubeSearch: async (_, args) => {
      try {
        const { part = 'snippet', ...otherArgs } = args;
        const response = await getAllResponses('search', {
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
      const videoDetails = await Promise.all(videoIds.map((videoId) => _getVideoDetailByVideoId(videoId)));
      return videoDetails;
    },
    youtubeGetSubscriptions: async (_, args) => {
      try {
        const response = await getAllResponses('subscriptions', args);
        console.log('youtubeGetSubscriptions: ', response);
        return response;
      } catch (error) {
        console.error(
          'YouTube API 오류:',
          error.response?.data || error.message
        );
        throw new Error('YouTube API 요청 중 오류가 발생했습니다.');
      }
    },
    youtubeGetVideos: async (_, args) => {
      try {
        const { part = 'snippet,contentDetails,statistics', ...otherArgs } =
          args;
        const response = await getAllResponses('videos', {
          part,
          ...otherArgs,
        });
        console.log('youtubeGetVideos: ', response);
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
    youtubeMySubscriptions: async (_, args) => {
      return await mySubscriptions(args.userId);
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
  },
};
