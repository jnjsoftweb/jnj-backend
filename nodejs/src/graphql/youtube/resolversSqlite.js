import { Sqlite } from '../../database/sqlite.js';

const sqlite = new Sqlite('youtube');

// Users
const _allUsersSqlite = async (args) => {
  return await sqlite.find('users', args);
};

const _usersSqlite = async (args) => {
  return await sqlite.find('users', args);
};

const _userOneByIdSqlite = async (userId) => {
  return await sqlite.findOne('users', `userId='${userId}'`);
};

// Subscriptions
const _subscriptionsSqlite = async (args) => {
  return await sqlite.find('subscriptions', args);
};

const _subscriptionsByUserIdSqlite = async (userId) => {
  return await sqlite.find('subscriptions', { userId });
};

const _subscriptionOneByIdSqlite = async (subscriptionId) => {
  return await sqlite.findOne(
    'subscriptions',
    `subscriptionId='${subscriptionId}'`
  );
};

// Channels
const _channelsSqlite = async (args) => {
  return await sqlite.find('channels', args);
};

const _channelOneByIdSqlite = async (channelId) => {
  return await sqlite.findOne('channels', `channelId='${channelId}'`);
};

// Playlists
const _playlistsSqlite = async (args) => {
  return await sqlite.find('playlists', args);
};

const _playlistOneByIdSqlite = async (playlistId) => {
  return await sqlite.findOne('playlists', `playlistId='${playlistId}'`);
};

// Videos
const _videosSqlite = async (args) => {
  return await sqlite.find('videos', args);
};

const _videoOneByIdSqlite = async (videoId) => {
  return await sqlite.findOne('videos', `videoId='${videoId}'`);
};

const _videoIdsByPlaylistIdSqlite = async (playlistId) => {
  const playlist = await _playlistOneByIdSqlite(playlistId);
  return playlist.videoIds.split(',');
};

const _videosByPlaylistIdSqlite = async (playlistId) => {
  const playlist = await _playlistOneByIdSqlite(playlistId);
  const videoIds = playlist.videoIds.split(',');
  return await Promise.all(
    videoIds.map((videoId) =>
      sqlite.find('videos', { filter: `videoId="${videoId}"` })
    )
  );
};

const _videosByChannelIdSqlite = async (channelId) => {
  return await sqlite.find('videos', {
    filter: `channelId='${channelId}'`,
  });
};

// Mutations
const _upsertUsersSqlite = async (users) => {
  return await sqlite.upsert('users', users, 'userId');
};

const _upsertSubscriptionsSqlite = async (subscriptions) => {
  return await sqlite.upsert(
    'subscriptions',
    subscriptions,
    'subscriptionId'
  );
};

const _upsertChannelsSqlite = async (channels) => {
  return await sqlite.upsert('channels', channels, 'channelId');
};

const _upsertPlaylistsSqlite = async (playlists) => {
  return await sqlite.upsert('playlists', playlists, 'playlistId');
};

const _upsertVideosSqlite = async (videos) => {
  return await sqlite.upsert('videos', videos, 'videoId');
};

const resolvers = {
  Query: {
    youtubeAllUsersSqlite: async (_, args) => await _allUsersSqlite(args),
    youtubeUsersSqlite: async (_, args) => await _usersSqlite(args),
    youtubeUserOneByIdSqlite: async (_, { userId }) =>
      await _userOneByIdSqlite(userId),
    youtubeSubscriptionsSqlite: async (_, args) =>
      await _subscriptionsSqlite(args),
    youtubeSubscriptionsByUserIdSqlite: async (_, { userId }) =>
      await _subscriptionsByUserIdSqlite(userId),
    youtubeSubscriptionOneByIdSqlite: async (_, { subscriptionId }) =>
      await _subscriptionOneByIdSqlite(subscriptionId),
    youtubeChannelsSqlite: async (_, args) => await _channelsSqlite(args),
    youtubeChannelOneByIdSqlite: async (_, { channelId }) =>
      await _channelOneByIdSqlite(channelId),
    youtubePlaylistsSqlite: async (_, args) => await _playlistsSqlite(args),
    youtubePlaylistOneByIdSqlite: async (_, { playlistId }) =>
      await _playlistOneByIdSqlite(playlistId),
    youtubeVideosSqlite: async (_, args) => await _videosSqlite(args),
    youtubeVideoOneByIdSqlite: async (_, { videoId }) =>
      await _videoOneByIdSqlite(videoId),
    youtubeVideoIdsByPlaylistIdSqlite: async (_, { playlistId }) =>
      await _videoIdsByPlaylistIdSqlite(playlistId),
    youtubeVideosByPlaylistIdSqlite: async (_, { playlistId }) =>
      await _videosByPlaylistIdSqlite(playlistId),
    youtubeVideosByChannelIdSqlite: async (_, { channelId }) =>
      await _videosByChannelIdSqlite(channelId),
  },

  Mutation: {
    youtubeUpsertUsersSqlite: async (_, { users }) =>
      await _upsertUsersSqlite(users),
    youtubeUpsertSubscriptionsSqlite: async (_, { subscriptions }) =>
      await _upsertSubscriptionsSqlite(subscriptions),
    youtubeUpsertChannelsSqlite: async (_, { channels }) =>
      await _upsertChannelsSqlite(channels),
    youtubeUpsertPlaylistsSqlite: async (_, { playlists }) =>
      await _upsertPlaylistsSqlite(playlists),
    youtubeUpsertVideosSqlite: async (_, { videos }) =>
      await _upsertVideosSqlite(videos),
  },
};

export {
  _allUsersSqlite,
  _usersSqlite,
  _userOneByIdSqlite,
  _subscriptionsSqlite,
  _subscriptionsByUserIdSqlite,
  _subscriptionOneByIdSqlite,
  _channelsSqlite,
  _channelOneByIdSqlite,
  _playlistsSqlite,
  _playlistOneByIdSqlite,
  _videosSqlite,
  _videoOneByIdSqlite,
  _videoIdsByPlaylistIdSqlite,
  _videosByPlaylistIdSqlite,
  _videosByChannelIdSqlite,
  _upsertUsersSqlite,
  _upsertSubscriptionsSqlite,
  _upsertChannelsSqlite,
  _upsertPlaylistsSqlite,
  _upsertVideosSqlite,
  resolvers,
};
