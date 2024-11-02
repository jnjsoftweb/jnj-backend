export const typeDefs = `#graphql
  type ChannelUpsertResult {
    channelIds: [String!]!
    success: Boolean!
    error: String
  }

  type ChannelUpsertOneResult {
    channelId: String!
  }

  input ChannelDetailInput {
    id: String!
    title: String
    customUrl: String
    publishedAt: String
    description: String
    thumbnail: String
    uploadsPlaylistId: String
    viewCount: String
    subscriberCount: String
    videoCount: String
  }

  type Query {
    youtubeGetChannelsPB(
      filter: String
      sort: String
      expand: String
      fields: String
      skipTotal: Boolean
      page: Int
      perPage: Int
    ): [ChannelDetail]
  }

  type Mutation {
    youtubeUpsertChannelsPB(channels: [ChannelDetailInput!]!): ChannelUpsertResult!
    youtubeUpsertOneChannelPB(channel: ChannelDetailInput!): ChannelUpsertOneResult!
  }
`;
