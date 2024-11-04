import { Sqlite } from '../../database/sqlite.js';
import { mapYoutubeCollection } from './mapsTypeDb.js'

const sqlite = new Sqlite('youtube');

const idFromType = (typeName) => {
  return mapYoutubeCollection[typeName].id;
}

const collectionFromType = (typeName) => {
  return mapYoutubeCollection[typeName].collection;
}


const findYoutubeDataById = async (type='channels', id='') => {
  const filter = `${idFromType(type)}="${id}"`;
  console.log(`filter: ${filter}`);
  return await sqlite.findOne(collectionFromType(type), filter);
};

const findYoutubeData = async (type='channels', options={}) => {
  return await sqlite.find(collectionFromType(type), options);
};

const upsertYoutubeDataOne = async (type='channels', data={}) => {
  const result = await sqlite.upsertOne(
    collectionFromType(type),
    dataFromTyp(type, data),
    idFromType(type)
  );
  return {
    [idFromType(type)]: [idFromType(type)]
  };
};

const upsertYoutubeData = async (type='channels', items=[]) => {
  return Promise.all(items.map((item) => upsertYoutubeDataOne(type, item)));
};

const channelIdByplaylistId = async (playlistId) => {
  const data = await findYoutubeData('channels', {filter: `uploadsPlaylistId="${playlistId}"`});
  return data[0].id;
}

export const resolvers = {
  Query: {
    youtubeAllUsersSqlite: async (_, args) => {
      return findYoutubeData('channel', { filter, ...options });
    },
    youtubeUserByIdSqlite: async (_, { userId }) => {
      await findYoutubeDataById(type='channels', `id="${userId}"`)
      return findYoutubeData('channel', { filter, ...options });
    },
  },

  // Mutation: {
  //   youtubeUpsertUsersSqlite: async (_, { users }) => {
  //     return upsertYoutubeData("user", users);
  //   },
  //   youtubeUpsertSubscriptionsSqlite: async (_, { subscriptions }) => {
  //     return upsertYoutubeData("subscription", subscriptions);
  //   },
  //   youtubeUpsertChannelSqlite: async (_, { channels }) => {
  //     return upsertChannel("channel", channels);
  //   }
  // },
};

// // * TEST
// const data = await findYoutubeDataById('channels', 'UCcfz-8gGDYJfaRHYD7kkQpw');
// console.log(JSON.stringify(data, null, 2));

// const data = await findYoutubeData('channels', {filter: 'viewCount>50000000'});
// console.log(JSON.stringify(data, null, 2));
