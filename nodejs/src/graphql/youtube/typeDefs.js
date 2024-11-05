import { typeDefs as sqliteTypeDefs } from './typeDefsSqlite.js'; // typeDefsSqlite에서 임포트

export const typeDefs = `#graphql
  ${sqliteTypeDefs}

  type Subscription {
    subscriptionId: String!
    userId: String!
    subscribed: String
    channel: ChannelSqlite
  }

  type Playlist {
    playlist: PlaylistSqlite
    channel: ChannelSqlite
  }

  type Video {
    video: VideoSqlite
    channel: ChannelSqlite
    playlist: PlaylistSqlite
  }

  type UpsertResult {
    success: Boolean
  }

  # Queries
  type Query {
    youtubeAllSubscriptions: [Subscription]  # 모든 구독 가져오기
    youtubeSubscriptionById(subscriptionId: String!): Subscription  # ID로 구독 가져오기
    youtubeAllVideos: [Video]  # 모든 비디오 가져오기
    youtubeVideoById(videoId: String!): Video  # ID로 비디오 가져오기
    youtubeAllChannels: [ChannelSqlite]
    youtubeChannelById(channelId: String!): ChannelSqlite
    youtubeAllPlaylists: [Playlist]
    youtubePlaylistById(playlistId: String!): Playlist
    youtubePlaylistByChannelId(channelId: String!): [Playlist]
    youtubeVideosByPlaylistId(playlistId: String!): [Video]
    youtubeVideosByChannelId(channelId: String!): [Video]
  }

  # Mutations
  type Mutation {
    youtubeUpsertUsersFromJson(path: String): UpsertResult
    youtubeUpsertSubscriptionsFromJson(path: String): UpsertResult
    youtubeUpsertChannelsFromJson(path: String): UpsertResult
    youtubeUpsertPlaylistsFromJson(path: String): UpsertResult
    youtubeUpsertVideosFromJson(path: String): UpsertResult
  }
`;
