import { gql } from 'apollo-server-express';
import { typeDefs as youtubeTypeDefsApi } from './youtube/typeDefsApi.js';
import { typeDefs as youtubeTypeDefsBasic } from './youtube/typeDefsBasic.js';
import { typeDefs as youtubeTypeDefsEx } from './youtube/typeDefsPb.js';
import { typeDefs as notionTypeDefs } from './notion/typeDefs.js';
import { typeDefs as ilmacTypeDefs } from './ilmac/typeDefs.js';

export const typeDefs = [
  youtubeTypeDefsApi,
  youtubeTypeDefsBasic,
  youtubeTypeDefsEx,
  notionTypeDefs,
  ilmacTypeDefs,
];
