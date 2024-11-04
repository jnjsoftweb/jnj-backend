import { Sqlite } from '../../database/sqlite.js';

const sqlite = new Sqlite('youtube');

export const resolvers = {
  Query: {
    youtubeAllUsersSqlite: async (_, args) => {
      return await sqlite.find('youtubeUsers');
    },
    youtubeUsersSqlite: async (_, args) => {
      return await sqlite.find('youtubeUsers', args);
    },
    youtubeUserOneByIdSqlite: async (_, { userId }) => {
      return await sqlite.findOne('youtubeUsers', { userId });
    },
    youtubeSubscriptionsSqlite: async (_, args) => {
      return await sqlite.find('youtubeSubscriptions', args);
    },
    youtubeSubscriptionsByUserIdSqlite: async (_, { userId }) => {
      return await sqlite.find('youtubeSubscriptions', { userId });
    },
    youtubeChannelsSqlite: async (_, args) => {
      return await sqlite.find('youtubeChannels', args);
    },
    youtubeChannelOneByIdSqlite: async (_, { channelId }) => {
      return await sqlite.findOne('youtubeChannels', { channelId });
    },
    youtubePlaylistsSqlite: async (_, args) => {
      return await sqlite.find('youtubePlaylists', args);
    },
    youtubePlaylistOneByIdSqlite: async (_, { playlistId }) => {
      return await sqlite.findOne('youtubePlaylists', { playlistId });
    },
    youtubeVideosSqlite: async (_, args) => {
      return await sqlite.find('youtubeVideos', args);
    },
  },
  Mutation: {
    youtubeUpsertUsersSqlite: async (_, { users }) => {
      return await sqlite.upsert('youtubeUsers', users);
    },
    youtubeUpsertSubscriptionsSqlite: async (_, { subscriptions }) => {
      return await sqlite.upsert('youtubeSubscriptions', subscriptions);
    },
    youtubeUpsertChannelsSqlite: async (_, { channels }) => {
      return await sqlite.upsert('youtubeChannels', channels);
    },
    youtubeUpsertPlaylistsSqlite: async (_, { playlists }) => {
      return await sqlite.upsert('youtubePlaylists', playlists);
    },
    youtubeUpsertVideosSqlite: async (_, { videos }) => {
      return await sqlite.upsert('youtubeVideos', videos);
    },
  },
};
