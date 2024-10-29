import { gql } from 'apollo-server-express';
import { typeDefs as youtubeTypeDefs } from './youtube/typeDefs.js';
import { typeDefs as notionTypeDefs } from './notion/typeDefs.js';
import { typeDefs as ilmacTypeDefs } from './ilmac/typeDefs.js';

export const typeDefs = [youtubeTypeDefs, notionTypeDefs, ilmacTypeDefs];
