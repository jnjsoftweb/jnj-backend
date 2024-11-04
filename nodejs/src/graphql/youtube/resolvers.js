import { Sqlite } from '../../database/sqlite.js';
import { resolvers as sqliteResolvers } from './resolversSqlite.js'; // resolversSqlite에서 리졸버 임포트

const sqlite = new Sqlite('youtube');

export const resolvers = {
  Query: {
    youtubeAllSubscriptions: async (_, args) => {
      const subscriptions = await sqlite.find('youtubeSubscriptions');
      return Promise.all(subscriptions.map(async (subscription) => {
        subscription.channel = await sqliteResolvers.Query.youtubeChannelOneByIdSqlite(_, { channelId: subscription.channelId });
        return subscription;
      }));
    },
    youtubeSubscriptionById: async (_, { subscriptionId }) => {
      const subscription = await sqliteResolvers.Query.youtubeSubscriptionOneByIdSqlite(_, { subscriptionId });
      subscription.channel = await sqliteResolvers.Query.youtubeChannelOneByIdSqlite(_, { channelId: subscription.channelId });
      return subscription;
    },
    youtubeAllVideos: async (_, args) => {
      const videos = await sqliteResolvers.Query.youtubeVideosAllSqlite(_, args);
      return Promise.all(videos.map(async (video) => {
        video.playlist = await sqliteResolvers.Query.youtubePlaylistOneByIdSqlite(_, { playlistId: video.playlistId });
        return video;
      }));
    },
    youtubeVideoById: async (_, { videoId }) => {
      const video = await sqliteResolvers.Query.youtubeVideoOneByIdSqlite(_, { videoId });
      video.playlist = await sqliteResolvers.Query.youtubePlaylistOneByIdSqlite(_, { playlistId: video.playlistId });
      return video;
    },
  },
};
