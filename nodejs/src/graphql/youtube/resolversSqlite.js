import { Sqlite } from '../../database/sqlite.js';

// 각 함수에서 새로운 연결 생성
const createConnection = () => new Sqlite('youtube');

// Users
const _allUsersSqlite = async () => {
  const sqlite = createConnection();
  try {
    return await sqlite.find('users');
  } finally {
    await sqlite.close();
  }
};

const _usersSqlite = async (args) => {
  const sqlite = createConnection();
  try {
    return await sqlite.find('users', args);
  } finally {
    await sqlite.close();
  }
};

const _userOneByIdSqlite = async (userId) => {
  const sqlite = createConnection();
  try {
    return await sqlite.findOne('users', `userId='${userId}'`);
  } finally {
    await sqlite.close();
  }
};

// Subscriptions
const _subscriptionsSqlite = async (args) => {
  const sqlite = createConnection();
  try {
    return await sqlite.find('subscriptions', args);
  } finally {
    await sqlite.close();
  }
};

const _subscriptionsByUserIdSqlite = async (userId) => {
  const sqlite = createConnection();
  try {
    return await sqlite.find('subscriptions', { filter: `userId='${userId}'` });
  } finally {
    await sqlite.close();
  }
};

const _subscriptionOneByIdSqlite = async (subscriptionId) => {
  const sqlite = createConnection();
  try {
    return await sqlite.findOne(
      'subscriptions',
      `subscriptionId='${subscriptionId}'`
    );
  } finally {
    await sqlite.close();
  }
};

// Channels
const _channelsSqlite = async (args) => {
  const sqlite = createConnection();
  try {
    return await sqlite.find('channels', args);
  } finally {
    await sqlite.close();
  }
};

const _channelsByUserIdSqlite = async (userId) => {
  const sqlite = createConnection();
  try {
    const subscriptions = await sqlite.find('subscriptions', {
      filter: `userId='${userId}'`,
    });
    const channelIds = subscriptions.map((s) => s.channelId);
    return await Promise.all(
      channelIds.map(async (channelId) => {
        const channel = await sqlite.findOne(
          'channels',
          `channelId='${channelId}'`
        );
        delete channel.id;
        return channel;
      })
    );
  } finally {
    await sqlite.close();
  }
};

const _channelOneByIdSqlite = async (channelId) => {
  const sqlite = createConnection();
  try {
    return await sqlite.findOne('channels', `channelId='${channelId}'`);
  } finally {
    await sqlite.close();
  }
};

// Playlists
const _playlistsSqlite = async (args) => {
  const sqlite = createConnection();
  try {
    return await sqlite.find('playlists', args);
  } finally {
    await sqlite.close();
  }
};

const _playlistOneByIdSqlite = async (playlistId) => {
  const sqlite = createConnection();
  try {
    return await sqlite.findOne('playlists', `playlistId='${playlistId}'`);
  } finally {
    await sqlite.close();
  }
};

// Videos
const _videosSqlite = async (args) => {
  const sqlite = createConnection();
  try {
    return await sqlite.find('videos', args);
  } finally {
    await sqlite.close();
  }
};

const _videoOneByIdSqlite = async (videoId) => {
  const sqlite = createConnection();
  try {
    return await sqlite.findOne('videos', `videoId='${videoId}'`);
  } finally {
    await sqlite.close();
  }
};

const _videoIdsByPlaylistIdSqlite = async (playlistId) => {
  const sqlite = createConnection();
  try {
    const playlist = await sqlite.findOne('playlists', `playlistId='${playlistId}'`);
    return playlist.videoIds.split(',');
  } finally {
    await sqlite.close();
  }
};

const _videosByPlaylistIdSqlite = async (playlistId) => {
  const sqlite = createConnection();
  try {
    const playlist = await sqlite.findOne('playlists', `playlistId='${playlistId}'`);
    const videoIds = playlist.videoIds.split(',');
    const videos = await Promise.all(
      videoIds.map((videoId) => {
        const video = sqlite.findOne('videos', `videoId="${videoId}"`);
        delete video.id;
        return video;
        // const { id, ...rest } = video;
        // return { ...rest };
      })
    );
    return videos;
  } finally {
    await sqlite.close();
  }
};

const _videosByChannelIdSqlite = async (channelId) => {
  const sqlite = createConnection();
  try {
    return await sqlite.find('videos', {
      filter: `channelId='${channelId}'`,
    });
  } finally {
    await sqlite.close();
  }
};

const _specialVideoIdsSqlite  = async (userId, type) => {
  const sqlite = createConnection();
  try {
    const _videos = await sqlite.findOne('specialVideos', `userId='${userId}' && type='${type}'`,
    );
    return _videos.videoIds;
  } finally {
    await sqlite.close();
  }
};

// Mutations
const _upsertUsersSqlite = async (users) => {
  const sqlite = createConnection();
  try {
    return await sqlite.upsert('users', users, 'userId');
  } finally {
    await sqlite.close();
  }
};

const _upsertSubscriptionsSqlite = async (subscriptions) => {
  const sqlite = createConnection();
  try {
    return await sqlite.upsert('subscriptions', subscriptions, 'subscriptionId');
  } finally {
    await sqlite.close();
  }
};

const _upsertChannelsSqlite = async (channels) => {
  const sqlite = createConnection();
  try {
    return await sqlite.upsert('channels', channels, 'channelId');
  } finally {
    await sqlite.close();
  }
};

const _upsertPlaylistsSqlite = async (playlists) => {
  const sqlite = createConnection();
  try {
    return await sqlite.upsert('playlists', playlists, 'playlistId');
  } finally {
    await sqlite.close();
  }
};

const _upsertVideosSqlite = async (videos) => {
  const sqlite = createConnection();
  try {
    return await sqlite.upsert('videos', videos, 'videoId');
  } finally {
    await sqlite.close();
  }
};

// * 기타
// * playlistId에 포함된 videoIds 조회(sqlite 기준)
const _videoIdsInPlaylistSqlite = async (playlistId) => {
  const sqlite = createConnection();
  try {
    const playlist = await sqlite.findOne('playlists', `playlistId='${playlistId}'`);
    const videoIds = await sqlite
      .find('videos', { filter: `playlistId="${playlistId}"` })
      .map((v) => v.videoId);
    return videoIds;
  } finally {
    await sqlite.close();
  }
};

const _notMatchPlaylistItemsInPlaylistSqlite = async (playlistId) => {
  const sqlite = createConnection();
  try {
    const playlist = await sqlite.findOne('playlists', `playlistId='${playlistId}'`);
    const videoIds = await sqlite
      .find('videos', { filter: `playlistId="${playlistId}"` })
      .map((v) => v.videoId);
    const itemsCount = playlist.itemCount;
    if (videoIds.length !== itemsCount) {
      return {
        playlistId,
        videoIds: videoIds.join(','),
        videosCount: videoIds.length,
        itemsCount,
      };
    }
    return null;
  } finally {
    await sqlite.close();
  }
};

const _upsertNotMatchPlaylistItemsSqlite = async (playlistId) => {
  const sqlite = createConnection();
  try {
    const item = await sqlite.findOne('notMatchPlaylistItems', `playlistId='${playlistId}'`);
    if (item) {
      return await sqlite.upsertOne('notMatchPlaylistItems', item, 'playlistId');
    }
  } finally {
    await sqlite.close();
  }
};

const resolvers = {
  Query: {
    youtubeAllUsersSqlite: async (_, args) => await _allUsersSqlite(),
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
  _channelsByUserIdSqlite,
  _channelOneByIdSqlite,
  _playlistsSqlite,
  _playlistOneByIdSqlite,
  _videosSqlite,
  _videoOneByIdSqlite,
  _videoIdsByPlaylistIdSqlite,
  _videosByPlaylistIdSqlite,
  _videosByChannelIdSqlite,
  _specialVideoIdsSqlite,
  _upsertUsersSqlite,
  _upsertSubscriptionsSqlite,
  _upsertChannelsSqlite,
  _upsertPlaylistsSqlite,
  _upsertVideosSqlite,
  _videoIdsInPlaylistSqlite,
  _notMatchPlaylistItemsInPlaylistSqlite,
  _upsertNotMatchPlaylistItemsSqlite,
  resolvers,
};

// const userId = 'mooninlearn';
// const channels = await _channelsByUserIdSqlite(userId);
// console.log(channels);

// const playlistId = 'PLwt0kothbrpdAlGrzPwjSxbkxZXqrfL5k';
// const videos = await _videosByPlaylistIdSqlite(playlistId);
// console.log(videos);

// const userId = 'bigwhitekmc';
// const type = 'watchLater';

// const videoIds = await _specialVideoIdsSqlite(userId, type);
// console.log(videoIds);
