export const typeDefs = `#graphql
  type User {
    userId: String!
    email: String
    apiKey: String
    name: String
    description: String
    thumbnail: String
  }

  type Subscription {
    subscriptionId: String!
    userId: String!
    channelId: String!
    subscribed: String
  }

  type Channel {
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

  type Playlist {
    playlistId: String
    channelId: String
    title: String
    description: String
    thumbnail: String
    publishedAt: String
    itemCount: Int
    privacyStatus: String
  }

  type Video {
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
`; 