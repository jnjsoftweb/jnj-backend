import { Client } from '@notionhq/client';
import { GraphQLError } from 'graphql';
import { NOTION_API_KEY } from '../../../env.js';

// console.log(NOTION_API_KEY);

const notion = new Client({
  auth: NOTION_API_KEY,
});

export const resolvers = {
  Query: {
    notionGetPage: async (_, { id }) => {
      try {
        if (!NOTION_API_KEY) {
          throw new GraphQLError('Notion API 토큰이 설정되지 않았습니다.', {
            extensions: { code: 'NOTION_TOKEN_MISSING' },
          });
        }

        const response = await notion.pages.retrieve({ page_id: id });

        if (!response) {
          throw new GraphQLError('페이지를 찾을 수 없습니다.', {
            extensions: { code: 'PAGE_NOT_FOUND' },
          });
        }

        return response;
      } catch (error) {
        console.error('Notion API Error:', error);

        if (error.code === 'unauthorized') {
          throw new GraphQLError('Notion API 인증 오류가 발생했습니다.', {
            extensions: { code: 'NOTION_UNAUTHORIZED' },
          });
        }

        if (error.code === 'object_not_found') {
          throw new GraphQLError('요청한 페이지를 찾을 수 없습니다.', {
            extensions: { code: 'NOTION_PAGE_NOT_FOUND' },
          });
        }

        throw new GraphQLError(
          error.message || 'Notion API 호출 중 오류가 발생했습니다.',
          {
            extensions: {
              code: 'NOTION_API_ERROR',
              originalError: error,
            },
          }
        );
      }
    },

    notionGetDatabase: async (_, { id }) => {
      try {
        if (!NOTION_API_KEY) {
          throw new GraphQLError('Notion API 토큰이 설정되지 않았습니다.', {
            extensions: { code: 'NOTION_TOKEN_MISSING' },
          });
        }

        const response = await notion.databases.retrieve({ database_id: id });

        if (!response) {
          throw new GraphQLError('데이터베이스를 찾을 수 없습니다.', {
            extensions: { code: 'DATABASE_NOT_FOUND' },
          });
        }

        return response;
      } catch (error) {
        console.error('Notion API Error:', error);

        if (error.code === 'unauthorized') {
          throw new GraphQLError('Notion API 인증 오류가 발생했습니다.', {
            extensions: { code: 'NOTION_UNAUTHORIZED' },
          });
        }

        if (error.code === 'object_not_found') {
          throw new GraphQLError('요청한 데이터베이스를 찾을 수 없습니다.', {
            extensions: { code: 'NOTION_DATABASE_NOT_FOUND' },
          });
        }

        throw new GraphQLError(
          error.message || 'Notion API 호출 중 오류가 발생했습니다.',
          {
            extensions: {
              code: 'NOTION_API_ERROR',
              originalError: error,
            },
          }
        );
      }
    },

    notionGetBlock: async (_, { id }) => {
      try {
        if (!NOTION_API_KEY) {
          throw new GraphQLError('Notion API 토큰이 설정되지 않았습니다.', {
            extensions: { code: 'NOTION_TOKEN_MISSING' },
          });
        }

        const response = await notion.blocks.retrieve({ block_id: id });

        if (!response) {
          throw new GraphQLError('블록을 찾을 수 없습니다.', {
            extensions: { code: 'BLOCK_NOT_FOUND' },
          });
        }

        return response;
      } catch (error) {
        console.error('Notion API Error:', error);

        if (error.code === 'unauthorized') {
          throw new GraphQLError('Notion API 인증 오류가 발생했습니다.', {
            extensions: { code: 'NOTION_UNAUTHORIZED' },
          });
        }

        if (error.code === 'object_not_found') {
          throw new GraphQLError('요청한 블록을 찾을 수 없습니다.', {
            extensions: { code: 'NOTION_BLOCK_NOT_FOUND' },
          });
        }

        throw new GraphQLError(
          error.message || 'Notion API 호출 중 오류가 발생했습니다.',
          {
            extensions: {
              code: 'NOTION_API_ERROR',
              originalError: error,
            },
          }
        );
      }
    },

    notionQueryDatabase: async (_, { database_id, filter, sorts }) => {
      try {
        if (!NOTION_API_KEY) {
          throw new GraphQLError('Notion API 토큰이 설정되지 않았습니다.', {
            extensions: { code: 'NOTION_TOKEN_MISSING' },
          });
        }

        const response = await notion.databases.query({
          database_id,
          filter,
          sorts,
        });

        return response.results;
      } catch (error) {
        console.error('Notion API Error:', error);

        if (error.code === 'unauthorized') {
          throw new GraphQLError('Notion API 인증 오류가 발생했습니다.', {
            extensions: { code: 'NOTION_UNAUTHORIZED' },
          });
        }

        if (error.code === 'object_not_found') {
          throw new GraphQLError('요청한 데이터베이스를 찾을 수 없습니다.', {
            extensions: { code: 'NOTION_DATABASE_NOT_FOUND' },
          });
        }

        throw new GraphQLError(
          error.message || 'Notion API 호출 중 오류가 발생했습니다.',
          {
            extensions: {
              code: 'NOTION_API_ERROR',
              originalError: error,
            },
          }
        );
      }
    },
  },

  Block: {
    content: (parent) => {
      const content = parent[parent.type];
      return {
        __typename: parent.type.charAt(0).toUpperCase() + parent.type.slice(1),
        ...content,
      };
    },
  },
};
