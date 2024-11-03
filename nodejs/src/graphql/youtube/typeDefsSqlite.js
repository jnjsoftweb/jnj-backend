export const typeDefs = `#graphql
  # Input Types
  input UserInput {
    userId: String!
    email: String
    apiKey: String
    name: String
    description: String
    thumbnail: String
  }

  input SubscriptionInput {
    userId: String!
    channelId: String!
    subscribed: String
  }

  input ChannelInput {
    channelId: String!
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

  # Result Types
  type UserUpsertResult {
    userId: String!
    success: Boolean!
    error: String
  }

  type SubscriptionUpsertResult {
    userId: String!
    channelId: String!
    success: Boolean!
    error: String
  }

  type ChannelUpsertResult {
    channelId: String!
    success: Boolean!
    error: String
  }

  # Queries
  type Query {
    youtubeGetUsers(
      filter: String
      sort: String
      expand: String
      fields: String
      skipTotal: Boolean
      page: Int
      perPage: Int
    ): [User]
    
    youtubeGetUserById(userId: String!): User
    
    youtubeGetSubscriptions(
      filter: String
      sort: String
      expand: String
      fields: String
      skipTotal: Boolean
      page: Int
      perPage: Int
    ): [Subscription]
    
    youtubeGetSubscriptionsByUserId(userId: String!): [Subscription]
  }

  # Mutations
  type Mutation {
    youtubeUpsertUser(user: UserInput!): UserUpsertResult!
    youtubeUpsertUsers(users: [UserInput!]!): [UserUpsertResult!]!
    youtubeUpsertSubscription(subscription: SubscriptionInput!): SubscriptionUpsertResult!
    youtubeUpsertSubscriptions(subscriptions: [SubscriptionInput!]!): [SubscriptionUpsertResult!]!
    youtubeUpsertChannel(channel: ChannelInput!): ChannelUpsertResult!
    youtubeUpsertChannels(channels: [ChannelInput!]!): [ChannelUpsertResult!]!
  }
`; 