import pocketbaseDB from '../../database/pocketbase.js';
import { mapYoutubeCollection } from './mapsTypeDb.js'

const idFromType = (typeName) => {
  return mapYoutubeCollection[typeName].id;
}

const collectionFromType = (typeName) => {
  return mapYoutubeCollection[typeName].collection;
}

const dataFromDb = (typeName, data) => {
  return {
    ...data,
    id: data[idFromType(typeName)],
  };
}

const dataFromType = (type, data) => {
  const { [idFromType(type)]: id, ...rest } = data;
  return { [idFromType(type)]: id, ...rest };
}

const findYoutubeDataById = async (type='channel', id='') => {
  const filter = `${idFromType(type)}="${id}"`;
  const data = await pocketbaseDB.findOne(collectionFromType(type), filter);
  return dataFromDb(type, data);
};

const findYoutubeData = async (type='channel', options={}) => {
  const data = await pocketbaseDB.find(collectionFromType(type), options);
  return data.map((item) => dataFromDb(type, item));
};

const upsertYoutubeDataOne = async (type='channel', data={}) => {
  const result = await pocketbaseDB.upsertOne(
    collectionFromType(type),
    dataFromTyp(type, data),
    idFromType(type)
  );
  return {
    [idFromType(type)]: id
  };
};

const upsertYoutubeData = async (type='channel', items=[]) => {
  return Promise.all(items.map((item) => upsertYoutubeDataOne(type, item)));
};

export const resolvers = {
  Query: {
    youtubeGetChannelsPB: async (_, args) => {
      const { filter, ...options } = args;
      return findYoutubeData('channel', { filter, ...options });
    },
  },

  Mutation: {
    youtubeUpsertUsersPB: async (_, { users }) => {
      return upsertYoutubeData("user", users);
    },
    youtubeUpsertSubscriptionsPB: async (_, { subscriptions }) => {
      return upsertYoutubeData("subscription", subscriptions);
    },
    youtubeUpsertChannelPB: async (_, { channels }) => {
      return upsertChannel("channel", channels);
    }
  },
};

// * TEST
// * FIND
// console.log(await findYoutubeDataById('UC-9-kyTW8ZkZNDHQJ6FgpwQ__', 'channel'))
// console.log(await findYoutubeData({ filter: 'title~"test"' }, 'channel'))

// const channel = {
//   id: 'UC-9-kyTW8ZkZNDHQJ6FgpwQ__',
//   title: 'test',
// };

// const result = await upsertChannelOne(channel);
// console.log(result);

// const channels = [
//   {
//     id: 'UC-9-kyTW8ZkZNDHQJ6FgpwQ__',
//     title: 'test',
//   },
//   {
//     id: 'UC-9-kyTW8ZkZNDHQJ6FgpwQ_',
//     title: 'test2',
//   },
// ];

// const result = await upsertChannel(channels)
// console.log(result);

// await pocketbaseDB.delete('youtubeChannel', `channelId="UC-9-kyTW8ZkZNDHQJ6FgpwQ__"`);

// const channelId = 'UC-9-kyTW8ZkZNDHQJ6FgpwQ__';
// const channel = await findYoutubeDataById('channel', channelId);
// console.log(channel);

// const channels = await findYoutubeData('channel', { sort: 'title' });
// console.log(channels);