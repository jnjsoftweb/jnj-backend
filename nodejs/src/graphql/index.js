import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { ApolloServerPluginLandingPageGraphQLPlayground } from '@apollo/server-plugin-landing-page-graphql-playground'; // Playground 플러그인 임포트
import { typeDefs } from './typeDefs.js';
import { resolvers } from './youtube/resolvers.js';
import { GRAPHQL_PORT } from '../env.js';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (error) => {
    console.error('\n=== GraphQL Error ===');
    console.error('Message:', error.message);
    console.error('Path:', error.path);
    if (error.originalError) {
      console.error('Original Error:', error.originalError);
    }
    console.error('=== End Error ===\n');
    return error;
  },
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground({
      settings: {
        'editor.theme': 'dark', // 기본 테마
        'request.credentials': 'include', // credentials 설정
      },
    }),
  ],
  introspection: true, // Introspection 활성화
});

const { url } = await startStandaloneServer(server, {
  listen: { port: GRAPHQL_PORT },
  cors: {
    origin: '*',
    credentials: true,
    // methods: ['POST', 'GET', 'OPTIONS'],
    // allowedHeaders: [
    //   'Content-Type',
    //   'x-apollo-operation-name',
    //   'apollo-require-preflight',
    // ],
  },
});

console.log(`🚀 Server ready at: ${url}`);
