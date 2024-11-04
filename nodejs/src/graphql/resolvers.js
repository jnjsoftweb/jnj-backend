import { resolvers as youtubeResolvers } from './youtube/resolvers.js';
// import { resolvers as youtubeResolvers } from './youtube/resolvers.js';
// import { resolvers as youtubeResolversPb } from './youtube/resolversPb.js';
// import { resolvers as notionResolvers } from './notion/resolvers.js';
import { resolvers as ilmacResolvers } from './ilmac/resolvers.js';

export const resolvers = {
  Query: {
    ...youtubeResolvers.Query,
    // ...youtubeResolvers.Query,
    // ...youtubeResolversPb.Query,
    // ...notionResolvers.Query,
    // ...ilmacResolvers.Query,
  },
  // Mutation: {
  //   ...youtubeResolvers.Mutation,
  //   ...youtubeResolversPb.Mutation,
  //   // ...notionResolvers.Mutation,
  //   ...ilmacResolvers.Mutation,
  // },
};
