export const typeDefs = `#graphql
  type UserSqlite {
    userId: String!
    email: String
    apiKey: String
    name: String
    description: String
    thumbnail: String
  }

  type SubscriptionSqlite {
    subscriptionId: String!
    userId: String!
    channelId: String!
    subscribed: String
  }

  type ChannelSqlite {
    channelId: String
    title: String
    customUrl: String
    publishedAt: String
    description: String
    thumbnail: String
    uploadsPlaylistId: String
    viewCount: Int
    subscriberCount: Int
    videoCount: Int
  }

  type PlaylistSqlite {
    playlistId: String
    channelId: String
    title: String
    description: String
    thumbnail: String
    publishedAt: String
    itemCount: Int
    privacyStatus: String
    videoIds: String
  }

  type VideoSqlite {
    videoId: String
    channelId: String
    playlistId: String
    title: String
    description: String
    thumbnail: String
    publishedAt: String
    duration: String
    caption: String
    tags: String
    viewCount: Int
    likeCount: Int
    commentCount: Int
  }

  input UserSqliteInput {
    userId: String!
    email: String
    apiKey: String
    name: String
    description: String
    thumbnail: String
  }

  input SubscriptionSqliteInput {
    subscriptionId: String!
    userId: String!
    channelId: String!
    subscribed: String
  }

  input ChannelSqliteInput {
    channelId: String
    title: String
    customUrl: String
    publishedAt: String
    description: String
    thumbnail: String
    uploadsPlaylistId: String
    viewCount: Int
    subscriberCount: Int
    videoCount: Int
  }

  input PlaylistSqliteInput {
    playlistId: String
    channelId: String
    title: String
    description: String
    thumbnail: String
    publishedAt: String
    itemCount: Int
    privacyStatus: String
    videoIds: String
  }

  input VideoSqliteInput {
    videoId: String
    channelId: String
    playlistId: String
    title: String
    description: String
    thumbnail: String
    publishedAt: String
    duration: String
    caption: String
    tags: String
    viewCount: Int
    likeCount: Int
    commentCount: Int
  }

  # Queries
  type Query {
    youtubeAllUsersSqlite : [UserSqlite]

    youtubeUsersSqlite(
      filter: String
      sort: String
      expand: String
      fields: String
      skipTotal: Boolean
      page: Int
      perPage: Int
    ): [UserSqlite]
    
    youtubeUserOneByIdSqlite(userId: String!): UserSqlite
    
    youtubeSubscriptionsSqlite(
      filter: String
      sort: String
      expand: String
      fields: String
      skipTotal: Boolean
      page: Int
      perPage: Int
    ): [SubscriptionSqlite]
    
    youtubeSubscriptionsByUserIdSqlite(userId: String!): [SubscriptionSqlite]

    youtubeChannelsSqlite(
      filter: String
      sort: String
      expand: String
      fields: String
      skipTotal: Boolean
      page: Int
      perPage: Int
    ): [ChannelSqlite]

    youtubeChannelOneByIdSqlite(channelId: String!): ChannelSqlite

    youtubePlaylistsSqlite(
      filter: String
      sort: String
      expand: String
      fields: String
      skipTotal: Boolean
      page: Int
      perPage: Int
    ): [PlaylistSqlite]

    youtubePlaylistOneByIdSqlite(playlistId: String!): PlaylistSqlite

    youtubeVideosSqlite(
      filter: String
      sort: String
      expand: String
    ): [VideoSqlite]
  }

  # Mutations
  type Mutation {
    youtubeUpsertUsersSqlite(users: [UserSqliteInput!]!): [UserSqlite]
    youtubeUpsertSubscriptionsSqlite(subscriptions: [SubscriptionSqliteInput!]!): [SubscriptionSqlite]
    youtubeUpsertChannelsSqlite(channels: [ChannelSqliteInput!]!): [ChannelSqlite]
    youtubeUpsertPlaylistsSqlite(playlists: [PlaylistSqliteInput!]!): [PlaylistSqlite]
    youtubeUpsertVideosSqlite(videos: [VideoSqliteInput!]!): [VideoSqlite]
  }
`;
