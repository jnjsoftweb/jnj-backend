import { gql } from 'apollo-server-express';
import { typeDefs as youtubeTypeDefs } from './youtube/typeDefs.js';
import { typeDefs as notionTypeDefs } from './notion/typeDefs.js';

// const baseTypeDefs = gql`
//   scalar JSON

//   type Query {
//     _empty: String
//   }

//   type Mutation {
//     _empty: String
//   }
// `;

// export const typeDefs = [baseTypeDefs, youtubeTypeDefs];
export const typeDefs = [youtubeTypeDefs, notionTypeDefs];
