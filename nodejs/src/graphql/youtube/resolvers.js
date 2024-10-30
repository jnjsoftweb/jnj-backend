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
    youtubeGetChannelIdByCustomUrl: async (_, { customUrl }) => {
      return await getChannelIdByCustomUrl(customUrl);
    },
    youtubeGetChannelByCustomUrl: async (_, { customUrl }) => {
      const channelId = await getChannelIdByCustomUrl(customUrl);
      const response = await getAllResponses('channels', {
        part: 'snippet,statistics,contentDetails',
        id: channelId,
      });
      return response;
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
    youtubeGetPlaylistsByCustomUrl: async (_, { customUrl }) => {
      const channelId = await getChannelIdByCustomUrl(customUrl);
      console.log(`youtubeGetPlaylistsByCustomUrl:${channelId}`);
      // return {};
      const response = await getAllResponses('playlists', {
        part: 'snippet,contentDetails',
        channelId,
      });
      return response;
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
