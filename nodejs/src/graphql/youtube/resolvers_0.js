import { loadJson } from 'jnj-lib-base';
import { resolvers as sqliteResolvers } from './resolversSqlite.js';

const JSON_ROOT = 'C:/JnJ-soft/Projects/internal/jnj-backend/db/json/youtube';

const _videoById = async (videoId) => {
  const video = await sqliteResolvers.Query.youtubeVideoOneByIdSqlite(_, {
    videoId,
  });
  const playlist = await sqliteResolvers.Query.youtubePlaylistOneByIdSqlite(_, {
    playlistId: video.playlistId,
  });
  const channel = await sqliteResolvers.Query.youtubeChannelOneByIdSqlite(_, {
    channelId: video.channelId,
  });
  return { video, playlist, channel };
};

const _videoByVideoSqlite = async (video) => {
  const playlist = await sqliteResolvers.Query.youtubePlaylistOneByIdSqlite(_, {
    playlistId: video.playlistId,
  });
  const channel = await sqliteResolvers.Query.youtubeChannelOneByIdSqlite(_, {
    channelId: video.channelId,
  });
  return { video, playlist, channel };
};

const _videosByPlaylistId = async (playlistId) => {
  const videos = await sqliteResolvers.Query.youtubeVideosByPlaylistIdSqlite(
    _,
    { playlistId }
  );
  return Promise.all(
    videos.map(async (video) => await _videoByVideoSqlite(video))
  );
};

export const resolvers = {
  // * 쿼리
  Query: {
    youtubeAllSubscriptions: async (_, args) => {
      const subscriptions =
        await sqliteResolvers.Query.youtubeSubscriptionsSqlite(_, args);
      return Promise.all(
        subscriptions.map(async (subscription) => {
          subscription.channel =
            await sqliteResolvers.Query.youtubeChannelOneByIdSqlite(_, {
              channelId: subscription.channelId,
            });
          return subscription;
        })
      );
    },
    youtubeSubscriptionById: async (_, { subscriptionId }) => {
      const subscription =
        await sqliteResolvers.Query.youtubeSubscriptionOneByIdSqlite(_, {
          subscriptionId,
        });
      subscription.channel =
        await sqliteResolvers.Query.youtubeChannelOneByIdSqlite(_, {
          channelId: subscription.channelId,
        });
      return subscription;
    },
    youtubeAllChannels: async (_, args) => {
      return await sqliteResolvers.Query.youtubeChannelsSqlite(_, args);
    },
    youtubeChannelById: async (_, { channelId }) => {
      return await sqliteResolvers.Query.youtubeChannelOneByIdSqlite(_, {
        channelId,
      });
    },
    youtubeAllPlaylists: async (_, args) => {
      return await sqliteResolvers.Query.youtubePlaylistsSqlite(_, args);
    },
    youtubePlaylistById: async (_, { playlistId }) => {
      return await sqliteResolvers.Query.youtubePlaylistOneByIdSqlite(_, {
        playlistId,
      });
    },
    youtubePlaylistByChannelId: async (_, { channelId }) => {
      return await sqliteResolvers.Query.youtubePlaylistsByChannelIdSqlite(_, {
        channelId,
      });
    },
    youtubeAllVideos: async (_, args) => {
      const videos = await sqliteResolvers.Query.youtubeVideosSqlite(_, args);
      return Promise.all(
        videos.map(async (video) => {
          video.playlist =
            await sqliteResolvers.Query.youtubePlaylistOneByIdSqlite(_, {
              playlistId: video.playlistId,
            });
          return video;
        })
      );
    },
    youtubeVideoById: async (_, { videoId }) => {
      return await _videoById(videoId);
    },
    youtubeVideosByPlaylistId: async (_, { playlistId }) => {
      return await sqliteResolvers.Query.youtubeVideosByPlaylistIdSqlite(_, {
        playlistId,
      });
    },
    youtubeVideosByChannelId: async (_, { channelId }) => {
      return await sqliteResolvers.Query.youtubeVideosByChannelIdSqlite(_, {
        channelId,
      });
    },
  },

  // * 뮤테이션
  Mutation: {
    youtubeUpsertUsersFromJson: async (
      _,
      { path = `${JSON_ROOT}/youtubeUsers.json` }
    ) => {
      const users = loadJson(path);
      await sqliteResolvers.Mutation.youtubeUpsertUsersSqlite(
        {},
        {
          users,
        }
      );
      return {
        success: true,
      };
    },

    youtubeUpsertSubscriptionsFromJson: async (
      _,
      { path = `${JSON_ROOT}/youtubeSubscriptions.json` }
    ) => {
      const subscriptions = loadJson(path);
      await sqliteResolvers.Mutation.youtubeUpsertSubscriptionsSqlite(
        {},
        {
          subscriptions,
        }
      );
      return {
        success: true,
      };
    },

    youtubeUpsertChannelsFromJson: async (
      _,
      { path = `${JSON_ROOT}/youtubeChannels.json` }
    ) => {
      const channels = loadJson(path);
      await sqliteResolvers.Mutation.youtubeUpsertChannelsSqlite(
        {},
        {
          channels,
        }
      );
      return {
        success: true,
      };
    },

    youtubeUpsertPlaylistsFromJson: async (
      _,
      { path = `${JSON_ROOT}/youtubePlaylists.json` }
    ) => {
      const playlists = loadJson(path);
      await sqliteResolvers.Mutation.youtubeUpsertPlaylistsSqlite(
        {},
        {
          playlists,
        }
      );
      return {
        success: true,
      };
    },

    youtubeUpsertVideosFromJson: async (
      _,
      { path = `${JSON_ROOT}/youtubeVideos.json` }
    ) => {
      const videos = loadJson(path);
      await sqliteResolvers.Mutation.youtubeUpsertVideosSqlite(
        {},
        {
          videos,
        }
      );
      return {
        success: true,
      };
    },
  },
};

// * 쿼리 함수 테스트
const playlistId = 'PLwt0kothbrpdAlGrzPwjSxbkxZXqrfL5k';
const videos = await _videosByPlaylistId(playlistId);
console.log(videos);
