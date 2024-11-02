import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './typeDefs.js';
import { resolvers } from './youtube/resolvers.js';
import { resolvers as resolversPb } from './youtube/resolversPb.js';

// 로깅을 위한 플러그인 추가
const loggingPlugin = {
  async requestDidStart(requestContext) {
    // IntrospectionQuery는 로깅하지 않음
    if (requestContext.request.operationName !== 'IntrospectionQuery') {
      console.log('\n=== GraphQL Request ===');
      console.log(
        'Operation:',
        requestContext.request.operationName || 'Anonymous Operation'
      );
      console.log('Query:', requestContext.request.query);
      console.log(
        'Variables:',
        JSON.stringify(requestContext.request.variables, null, 2)
      );

      return {
        async willSendResponse(requestContext) {
          console.log('\n=== GraphQL Response ===');
          console.log(
            'Operation:',
            requestContext.request.operationName || 'Anonymous Operation'
          );
          console.log(
            'Data:',
            JSON.stringify(requestContext.response.data, null, 2)
          );
          console.log('=== End ===\n');
        },
        async didEncounterErrors(requestContext) {
          console.error('\n=== GraphQL Errors ===');
          console.error(JSON.stringify(requestContext.errors, null, 2));
          console.error('=== End Errors ===\n');
        },
      };
    }
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers: {
    Query: {
      ...resolvers.Query,
      ...resolversPb.Query,
    },
    Mutation: {
      ...resolvers.Mutation,
      ...resolversPb.Mutation,
    },
  },
  plugins: [loggingPlugin],
  formatError: (error) => {
    if (!error.message.includes('IntrospectionQuery')) {
      console.error('GraphQL Error:', JSON.stringify(error, null, 2));
    }
    return error;
  },
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 3007 },
});

console.log(`🚀 Server ready at: ${url}`);
