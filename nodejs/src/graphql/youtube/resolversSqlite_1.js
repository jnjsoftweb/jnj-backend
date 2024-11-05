import { Sqlite } from '../../database/sqlite.js';

const sqlite = new Sqlite('youtube');

// Users
const _allUsersSqlite = async (args) => {
  return await sqlite.find('youtubeUsers', args);
};

const _usersSqlite = async (args) => {
  return await sqlite.find('youtubeUsers', args);
};

const _userOneByIdSqlite = async (userId) => {
  return await sqlite.findOne('youtubeUsers', `userId='${userId}'`);
};

// Subscriptions
const _subscriptionsSqlite = async (args) => {
  return await sqlite.find('youtubeSubscriptions', args);
};

const _subscriptionsByUserIdSqlite = async (userId) => {
  return await sqlite.find('youtubeSubscriptions', { userId });
};

const _subscriptionOneByIdSqlite = async (subscriptionId) => {
  return await sqlite.findOne(
    'youtubeSubscriptions',
    `subscriptionId='${subscriptionId}'`
  );
};

// Channels
const _channelsSqlite = async (args) => {
  return await sqlite.find('youtubeChannels', args);
};

const _channelOneByIdSqlite = async (channelId) => {
  return await sqlite.findOne('youtubeChannels', `channelId='${channelId}'`);
};

// Playlists
const _playlistsSqlite = async (args) => {
  return await sqlite.find('youtubePlaylists', args);
};

const _playlistOneByIdSqlite = async (playlistId) => {
  return await sqlite.findOne('youtubePlaylists', `playlistId='${playlistId}'`);
};

// Videos
const _videosSqlite = async (args) => {
  return await sqlite.find('youtubeVideos', args);
};

const _videoOneByIdSqlite = async (videoId) => {
  return await sqlite.findOne('youtubeVideos', `videoId='${videoId}'`);
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
      sqlite.find('youtubeVideos', { filter: `videoId="${videoId}"` })
    )
  );
};

const _videosByChannelIdSqlite = async (channelId) => {
  return await sqlite.find('youtubeVideos', {
    filter: `channelId='${channelId}'`,
  });
};

// Mutations
const _upsertUsersSqlite = async (users) => {
  return await sqlite.upsert('youtubeUsers', users, 'userId');
};

const _upsertSubscriptionsSqlite = async (subscriptions) => {
  return await sqlite.upsert(
    'youtubeSubscriptions',
    subscriptions,
    'subscriptionId'
  );
};

const _upsertChannelsSqlite = async (channels) => {
  return await sqlite.upsert('youtubeChannels', channels, 'channelId');
};

const _upsertPlaylistsSqlite = async (playlists) => {
  return await sqlite.upsert('youtubePlaylists', playlists, 'playlistId');
};

const _upsertVideosSqlite = async (videos) => {
  return await sqlite.upsert('youtubeVideos', videos, 'videoId');
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
