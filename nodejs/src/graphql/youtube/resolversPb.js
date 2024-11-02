import {
  pbFindOne,
  pbFind,
  pbInsertOne,
  pbInsert,
  pbUpdate,
  pbUpsertOne,
  pbUpsert,
} from '../../pocketbase/app.js';

const _channelById = async (id) => {
  const channel = await pbFindOne('youtubeChannel', `channelId="${id}"`);
  return {
    ...channel,
    id: channel.channelId,
  };
};

export const resolvers = {
  Query: {
    youtubeGetChannelsPB: async (_, args) => {
      const channels = await pbFind('youtubeChannel', args);
      return channels.map((channel) => ({
        ...channel,
        id: channel.channelId,
      }));
    },
  },

  Mutation: {
    youtubeUpsertOneChannelPB: async (_, { channel }) => {
      console.log('Received channel data:', channel);

      try {
        const { id, ...rest } = channel;
        const pbChannel = {
          channelId: id,
          title: rest.title,
          customUrl: rest.customUrl,
          publishedAt: rest.publishedAt,
          description: rest.description,
          thumbnail: rest.thumbnail,
          uploadsPlaylistId: rest.uploadsPlaylistId,
          viewCount: rest.viewCount,
          subscriberCount: rest.subscriberCount,
          videoCount: rest.videoCount,
        };

        console.log('Transformed channel data:', pbChannel);

        const result = await pbUpsertOne(
          'youtubeChannel',
          pbChannel,
          'channelId'
        );
        console.log('Upsert result:', result);

        return {
          channelId: id,
        };
      } catch (error) {
        console.error('Channel upsert failed:', error);
        return {
          channelId: channel.id,
        };
      }
    },
  },
};
