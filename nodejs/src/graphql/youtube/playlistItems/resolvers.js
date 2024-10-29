import axios from 'axios';
import { API_KEY, API_URL } from '../../../utils/settings.js';

export const resolvers = {
  Query: {
    youtubeGetPlaylistItems: async (_, args) => {
      try {
        const response = await axios.get(`${API_URL}/playlistItems`, {
          params: {
            key: API_KEY,
            ...args,
          },
        });
        return response.data;
      } catch (error) {
        console.error(
          'YouTube API 오류:',
          error.response?.data || error.message
        );
        throw new Error('YouTube API 요청 중 오류가 발생했습니다.');
      }
    },
    youtubeGetSimplePlaylistItems: async (
      _,
      { playlistId, maxResults = 50 }
    ) => {
      try {
        const response = await axios.get(`${API_URL}/playlistItems`, {
          params: {
            part: 'snippet,contentDetails',
            playlistId: playlistId,
            maxResults: maxResults,
            key: API_KEY,
          },
        });

        const items = response.data.items.map((item) => ({
          title: item.snippet.title,
          videoId: item.contentDetails.videoId,
          description: item.snippet.description,
          thumbnail:
            item.snippet.thumbnails.medium?.url ||
            item.snippet.thumbnails.default?.url,
        }));

        return { items };
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
