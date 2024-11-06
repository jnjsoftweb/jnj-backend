import { loadJson, saveJson } from 'jnj-lib-base';
import { SQLITE_DB_DIR, JSON_DB_DIR } from '../../env.js';
import {
  _videoOneByIdSqlite,
  _playlistOneByIdSqlite,
  _channelOneByIdSqlite,
  _videosByPlaylistIdSqlite,
  _videoIdsByPlaylistIdSqlite,
  _videosSqlite,
  _subscriptionsSqlite,
  _subscriptionOneByIdSqlite,
  _channelsSqlite,
  _channelsByUserIdSqlite,
  _playlistsSqlite,
  _videosByChannelIdSqlite,
  _upsertUsersSqlite,
  _upsertSubscriptionsSqlite,
  _upsertChannelsSqlite,
  _upsertPlaylistsSqlite,
  _upsertVideosSqlite,
  _videoIdsInPlaylistSqlite,
  _notMatchPlaylistItemsInPlaylistSqlite,
  _upsertNotMatchPlaylistItemsSqlite,
} from './resolversSqlite.js';

import {
  _subscriptionsApi,
  _channelByIdApi,
  _playlistsByChannelIdApi,
  _videosByChannelIdApi,
  _videoByIdApi,
  _videoIdsByPlaylistIdApi,
  _videoIdsByChannelIdApi,
  _mostPopularVideosApi,
} from './resolversApi.js';

// const JSON_ROOT = `${SQLITE_DB_DIR}/youtube`;
const JSON_ROOT = `${JSON_DB_DIR}/youtube`;

const _videoById = async (videoId) => {
  const video = await _videoOneByIdSqlite(videoId);
  delete video.channelTitle; // channelTitle(mostPopularVideos에서만 사용) 제거
  delete video.channelThumbnail; // channelThumbnail(mostPopularVideos에서만 사용) 제거
  const channel = await _channelOneByIdSqlite(video.channelId);
  return { video, channel };
};

const _videoByVideoSqlite = async (video) => {
  const channel = await _channelOneByIdSqlite(video.channelId);
  return { video, channel };
};

const _videosByPlaylistId = async (playlistId) => {
  const videoIds = await _videoIdsByPlaylistIdSqlite(playlistId);
  return Promise.all(
    videoIds.map(async (videoId) => await _videoById(videoId))
  );
};

export const resolvers = {
  Query: {
    youtubeAllSubscriptions: async (_, args) => {
      const subscriptions = await _subscriptionsSqlite(args);
      return Promise.all(
        subscriptions.map(async (subscription) => {
          subscription.channel = await _channelOneByIdSqlite(
            subscription.channelId
          );
          return subscription;
        })
      );
    },
    youtubeSubscriptionById: async (_, { subscriptionId }) => {
      const subscription = await _subscriptionOneByIdSqlite(subscriptionId);
      subscription.channel = await _channelOneByIdSqlite(
        subscription.channelId
      );
      return subscription;
    },
    youtubeAllChannels: async (_, args) => {
      return await _channelsSqlite(args);
    },
    youtubeChannelsByUserId: async (_, { userId }) => {
      return await _channelsByUserIdSqlite(userId);
    },
    youtubeChannelById: async (_, { channelId }) => {
      return await _channelOneByIdSqlite(channelId);
    },
    youtubeAllPlaylists: async (_, args) => {
      return await _playlistsSqlite(args);
    },
    youtubePlaylistById: async (_, { playlistId }) => {
      return await _playlistOneByIdSqlite(playlistId);
    },
    youtubePlaylistByChannelId: async (_, { channelId }) => {
      return await _playlistsSqlite({ filter: `channelId='${channelId}'` });
    },
    youtubeAllVideos: async (_, args) => {
      const videos = await _videosSqlite(args);
      return Promise.all(
        videos.map(async (video) => {
          video.playlist = await _playlistOneByIdSqlite(video.playlistId);
          return video;
        })
      );
    },
    youtubeVideoById: async (_, { videoId }) => {
      return await _videoById(videoId);
    },
    youtubeVideosByPlaylistId: async (_, { playlistId }) => {
      const videos = await _videosByPlaylistIdSqlite(playlistId);
      return Promise.all(
        videos.map(async (video) => await _videoByVideoSqlite(video))
      );
    },
    youtubeVideosByChannelId: async (_, { channelId }) => {
      const videos = await _videosByChannelIdSqlite(channelId);
      return Promise.all(
        videos.map(async (video) => await _videoByVideoSqlite(video))
      );
    },
    youtubeMostPopularVideos: async (_, args) => {
      return await _mostPopularVideosApi(args);
    },
  },

  // * * Mutations
  Mutation: {
    // * JSON -> SQLite
    youtubeUpsertUsersFromJson: async (
      _,
      { path = `${JSON_ROOT}/users.json` }
    ) => {
      const users = loadJson(path);
      await _upsertUsersSqlite(users);
      return { success: true };
    },
    youtubeUpsertSubscriptionsFromJson: async (
      _,
      { path = `${JSON_ROOT}/subscriptions.json` }
    ) => {
      const subscriptions = loadJson(path);
      await _upsertSubscriptionsSqlite(subscriptions);
      return { success: true };
    },
    youtubeUpsertChannelsFromJson: async (
      _,
      { path = `${JSON_ROOT}/channels.json` }
    ) => {
      const channels = loadJson(path);
      await _upsertChannelsSqlite(channels);
      return { success: true };
    },
    youtubeUpsertPlaylistsFromJson: async (
      _,
      { path = `${JSON_ROOT}/playlists.json` }
    ) => {
      const playlists = loadJson(path);
      await _upsertPlaylistsSqlite(playlists);
      return { success: true };
    },
    youtubeUpsertVideosFromJson: async (
      _,
      { path = `${JSON_ROOT}/videos.json` }
    ) => {
      const videos = loadJson(path);
      await _upsertVideosSqlite(videos);
      return { success: true };
    },
    // * API -> Sqlite
    youtubeUpsertSubscriptionsFromApi: async (_, args) => {
      const subscriptions = await _subscriptionsApi(args.userId);
      await _upsertSubscriptionsSqlite(subscriptions);
      return { success: true };
    },
    youtubeUpsertChannelsFromApi: async (_, args) => {
      const channels = await _channelsApi(args.userId);
      await _upsertChannelsSqlite(channels);
      return { success: true };
    },
    youtubeUpsertPlaylistsFromApi: async (_, args) => {
      const playlists = await _playlistsByChannelIdApi(args.channelId);
      await _upsertPlaylistsSqlite(playlists);
      return { success: true };
    },
    youtubeUpsertVideosFromApi: async (_, args) => {
      const videos = await _videosByChannelIdApi(args.channelId);
      await _upsertVideosSqlite(videos);
      return { success: true };
    },
    // * API -> JSON
    youtubeMostPopularVideosToJson: async (_, args) => {
      const videos = await _mostPopularVideosApi();
      saveJson(`${JSON_ROOT}/mostPopularVideos.json`, videos);
      return { success: true };
    },
  },
};

// * * TEST
// console.log(JSON_ROOT);

// * 쿼리 함수 테스트
// const videoId = 'w8QxTAmZEdo';
// const video = await _videoById(videoId);
// console.log(video);

// const videoId = 'w8QxTAmZEdo';
// const video = await _videoOneByIdSqlite(videoId);
// console.log(video);
// const _video = await _videoByVideoSqlite(video);
// console.log(_video);

// const playlistId = 'PLs8gZ5b9piXU5Ymi6SjQWulZCkDDFuQfe';
// const videos = await _videosByPlaylistId(playlistId);
// console.log(videos);
