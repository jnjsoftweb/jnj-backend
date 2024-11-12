import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './typeDefs.js';
import { resolvers } from './youtube/resolvers.js';
import { GRAPHQL_PORT } from '../env.js';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    // 에러 상세 정보 로깅
    console.error('\n=== GraphQL Error ===');
    console.error('Message:', error.message);
    console.error('Path:', error.path);
    if (error.originalError) {
      console.error('Original Error:', error.originalError);
    }
    console.error('=== End Error ===\n');
    return error;
  },
});

const { url } = await startStandaloneServer(server, {
  listen: { port: GRAPHQL_PORT },
  cors: {
    origin: '*',
    credentials: true,
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'x-apollo-operation-name',
      'apollo-require-preflight',
    ],
  },
});

console.log(`🚀 Server ready at: ${url}`);
