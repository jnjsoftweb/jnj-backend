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
  }

  type NotMatchPlaylistItem {
    playlistId: String!
    videoIds: String!
    videosCount: Int!
    itemsCount: Int!
  }

  # Queries
  type Query {
    youtubeAllUsers: [UserSqlite]  # 모든 사용자 가져오기
    youtubeUserById(userId: String!): UserSqlite  # ID로 사용자 가져오기
    youtubeAllSubscriptions: [Subscription]  # 모든 구독 가져오기
    youtubeSubscriptionById(subscriptionId: String!): Subscription  # ID로 구독 가져오기
    youtubeAllChannels: [ChannelSqlite]  # 모든 채널 가져오기
    youtubeChannelsByUserId(userId: String!): [ChannelSqlite]  # 사용자 ID로 채널 가져오기
    youtubeChannelById(channelId: String!): ChannelSqlite  # ID로 채널 가져오기
    youtubeAllPlaylists: [PlaylistSqlite]  # 모든 재생목록 가져오기
    youtubePlaylistById(playlistId: String!): PlaylistSqlite  # ID로 재생목록 가져오기
    youtubePlaylistByChannelId(channelId: String!): [PlaylistSqlite]  # 채널 ID로 재생목록 가져오기
    youtubeAllVideos: [Video]  # 모든 비디오 가져오기
    youtubeVideoById(videoId: String!): Video  # ID로 비디오 가져오기
    youtubeVideosByPlaylistId(playlistId: String!): [Video]  # 재생목록 ID로 비디오 가져오기
    youtubeVideosByChannelId(channelId: String!): [Video]  # 채널 ID로 비디오 가져오기
    youtubeMostPopularVideos: [Video]  # 인기 비디오 가져오기
    youtubeWatchLaterVideos(userId: String!): [Video]  # 찜 비디오 가져오기
    youtubeHistoryVideos(userId: String!): [Video]  # 시청 기록 비디오 가져오기
    youtubeWatchLaterVideosApi(userId: String!): [Video]  # 찜 비디오 가져오기
    youtubeHistoryVideosApi(userId: String!): [Video]  # 시청 기록 비디오 가져오기
    youtubeShortsVideosByChannelIdApi(channelId: String!): [Video]  # 쇼츠 비디오 가져오기
  }

  # Mutations
  type Mutation {
    youtubeUpsertUsersFromJson(path: String): Response  # JSON에서 사용자 추가/업데이트
    youtubeUpsertSubscriptionsFromJson(path: String): Response  # JSON에서 구독 추가/업데이트
    youtubeUpsertChannelsFromJson(path: String): Response  # JSON에서 채널 추가/업데이트
    youtubeUpsertPlaylistsFromJson(path: String): Response  # JSON에서 재생목록 추가/업데이트
    youtubeUpsertVideosFromJson(path: String): Response  # JSON에서 비디오 추가/업데이트
    youtubeUpsertSubscriptionsFromApi(userId: String!): Response  # API에서 구독 추가/업데이트
    youtubeUpsertChannelsFromApi(userId: String!): Response  # API에서 채널 추가/업데이트
    youtubeUpsertPlaylistsFromApi(channelId: String!): Response  # API에서 재생목록 추가/업데이트
    youtubeUpsertPlaylistsByUserIdFromApi(userId: String!): Response  # API에서 재생목록 추가/업데이트  
    youtubeUpsertVideosFromApi(channelId: String!): Response  # API에서 비디오 추가/업데이트
    youtubeMostPopularVideosToJson: Response  # API에서 인기 비디오 가져오기
    youtubeDownloadVideos(videoIds: [String!]!, resolution: String, bitrate: String, languages: String, formatType: String, outputDir: String): Response  # API에서 비디오 다운로드
    youtubeDownloadPlaylist(playlistId: String!, resolution: String, bitrate: String, languages: String, formatType: String, outputDir: String): Response  # API에서 재생목록 다운로드
  }

  type Response {
    success: Boolean!
  }
`;
