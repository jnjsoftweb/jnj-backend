import {
  getAllResponses,
  getChannelIdByCustomUrl,
} from '../../utils/youtube/rest.js';

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
        // console.log('youtubeGetPlaylistItems: ', response);
        return response;
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
  },
};
