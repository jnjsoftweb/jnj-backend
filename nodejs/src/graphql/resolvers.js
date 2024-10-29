import { resolvers as youtubeResolvers } from './youtube/resolvers.js';
import { resolvers as notionResolvers } from './notion/resolvers.js';

export const resolvers = {
  Query: {
    ...youtubeResolvers.Query,
    ...notionResolvers.Query,
  },
  // 필요한 경우 Mutation도 추가
};
