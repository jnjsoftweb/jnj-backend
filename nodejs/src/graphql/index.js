import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './typeDefs.js';
import { resolvers } from './youtube/resolvers.js';

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
  listen: { port: 3007 },
});

console.log(`🚀 Server ready at: ${url}`);
