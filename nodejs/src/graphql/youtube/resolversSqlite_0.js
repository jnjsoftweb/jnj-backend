// import { loadJson } from 'jnj-lib-base';
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
      return await sqlite.findOne('youtubeUsers', `userId='${userId}'`);
    },
    youtubeSubscriptionsSqlite: async (_, args) => {
      return await sqlite.find('youtubeSubscriptions', args);
    },
    youtubeSubscriptionsByUserIdSqlite: async (_, { userId }) => {
      return await sqlite.find('youtubeSubscriptions', { userId });
    },
    youtubeSubscriptionOneByIdSqlite: async (_, { subscriptionId }) => {
      return await sqlite.findOne(
        'youtubeSubscriptions',
        `subscriptionId='${subscriptionId}'`
      );
    },
    youtubeChannelsSqlite: async (_, args) => {
      return await sqlite.find('youtubeChannels', args);
    },
    youtubeChannelOneByIdSqlite: async (_, { channelId }) => {
      return await sqlite.findOne(
        'youtubeChannels',
        `channelId='${channelId}'`
      );
    },
    youtubePlaylistsSqlite: async (_, args) => {
      return await sqlite.find('youtubePlaylists', args);
    },
    youtubePlaylistOneByIdSqlite: async (_, { playlistId }) => {
      return await sqlite.findOne(
        'youtubePlaylists',
        `playlistId='${playlistId}'`
      );
    },
    youtubeVideosSqlite: async (_, args) => {
      return await sqlite.find('youtubeVideos', args);
    },
    youtubeVideoOneByIdSqlite: async (_, { videoId }) => {
      return await sqlite.findOne('youtubeVideos', `videoId='${videoId}'`);
    },
    youtubeVideoIdsByPlaylistIdSqlite: async (_, { playlistId }) => {
      const playlist = await sqlite.findOne(
        'youtubePlaylists',
        `playlistId='${playlistId}'`
      );
      return playlist.videoIds.split(',');
    },
    youtubeVideosByPlaylistIdSqlite: async (_, { playlistId }) => {
      const playlist = await sqlite.findOne(
        'youtubePlaylists',
        `playlistId='${playlistId}'`
      );
      const videoIds = playlist.videoIds.split(',');

      // Promise.all을 사용하여 모든 비디오 조회가 완료될 때까지 대기
      const videos = await Promise.all(
        videoIds.map((videoId) =>
          sqlite.find('youtubeVideos', { filter: `videoId="${videoId}"` })
        )
      );
      return videos;
    },
    youtubeVideosByChannelIdSqlite: async (_, { channelId }) => {
      const videos = await sqlite.find('youtubeVideos', {
        filter: `channelId='${channelId}'`,
      });
    },
  },
  Mutation: {
    youtubeUpsertUsersSqlite: async (_, { users }) => {
      return await sqlite.upsert('youtubeUsers', users, 'userId');
    },
    youtubeUpsertSubscriptionsSqlite: async (_, { subscriptions }) => {
      return await sqlite.upsert(
        'youtubeSubscriptions',
        subscriptions,
        'subscriptionId'
      );
    },
    youtubeUpsertChannelsSqlite: async (_, { channels }) => {
      return await sqlite.upsert('youtubeChannels', channels, 'channelId');
    },
    youtubeUpsertPlaylistsSqlite: async (_, { playlists }) => {
      return await sqlite.upsert('youtubePlaylists', playlists, 'playlistId');
    },
    youtubeUpsertVideosSqlite: async (_, { videos }) => {
      await sqlite.upsert('youtubeVideos', videos, 'videoId');
    },
  },
};

// const users = loadJson(
//   'C:/JnJ-soft/Projects/internal/jnj-backend/db/json/youtube/youtubeUsers.json'
// );

// const result = await sqlite.upsert('youtubeUsers', users, 'userId');

// const playlists = loadJson(
//   'C:/JnJ-soft/Projects/internal/jnj-backend/db/json/youtube/youtubePlaylists.json'
// );

// await sqlite.upsert('youtubePlaylists', playlists, 'playlistId');

// const playlistId = 'PLwt0kothbrpdAlGrzPwjSxbkxZXqrfL5k';
// const playlist = await sqlite.findOne(
//   'youtubePlaylists',
//   `playlistId='${playlistId}'`
// );
// const videoIds = playlist.videoIds.split(',');

// // Promise.all을 사용하여 모든 비디오 조회가 완료될 때까지 대기
// const videos = await Promise.all(
//   videoIds.map((videoId) =>
//     sqlite.find('youtubeVideos', { filter: `videoId="${videoId}"` })
//   )
// );

// const channelId = 'UCxRnfrmJAkRLarzeBJETB5g';
// const videos = await sqlite.find('youtubeVideos', {
//   filter: `channelId='${channelId}'`,
// });

// console.log(videos);

// const userId = 'mooninlearn';
// const user = await sqlite.findOne('youtubeUsers', `userId='${userId}'`);
// console.log(user);
