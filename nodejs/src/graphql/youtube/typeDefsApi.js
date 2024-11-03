export const typeDefs = `#graphql
  # Common Types
  type YouTubeSnippet {
    publishedAt: String
    channelId: String
    title: String
    description: String
    thumbnails: YouTubeThumbnails
    channelTitle: String
    tags: [String]
    categoryId: String
    liveBroadcastContent: String
    defaultLanguage: String
    localized: YouTubeLocalizedText
    defaultAudioLanguage: String
  }

  type YouTubePageInfo {
    totalResults: Int
    resultsPerPage: Int
    nextPageToken: String
    prevPageToken: String
  }

  type YouTubeThumbnails {
    default: YouTubeThumbnail
    medium: YouTubeThumbnail
    high: YouTubeThumbnail
    standard: YouTubeThumbnail
    maxres: YouTubeThumbnail
  }

  type YouTubeThumbnail {
    url: String
    width: Int
    height: Int
  }

  type YouTubeLocalizedText {
    title: String
    description: String
  }

  # Channel Types
  type YouTubeChannel {
    kind: String
    etag: String
    id: String
    snippet: YouTubeChannelSnippet
    contentDetails: YouTubeChannelContentDetails
    statistics: YouTubeChannelStatistics
    topicDetails: YouTubeChannelTopicDetails
    status: YouTubeChannelStatus
    brandingSettings: YouTubeChannelBrandingSettings
  }

  type YouTubeChannelSnippet {
    title: String
    description: String
    customUrl: String
    publishedAt: String
    thumbnails: YouTubeThumbnails
    defaultLanguage: String
    localized: YouTubeLocalizedText
    country: String
  }

  type YouTubeChannelContentDetails {
    relatedPlaylists: YouTubeRelatedPlaylists
  }

  type YouTubeRelatedPlaylists {
    likes: String
    favorites: String
    uploads: String
    watchHistory: String
    watchLater: String
  }

  type YouTubeChannelStatistics {
    viewCount: String
    subscriberCount: String
    hiddenSubscriberCount: Boolean
    videoCount: String
  }

  type YouTubeChannelTopicDetails {
    topicIds: [String]
    topicCategories: [String]
  }

  type YouTubeChannelStatus {
    privacyStatus: String
    isLinked: Boolean
    longUploadsStatus: String
    madeForKids: Boolean
    selfDeclaredMadeForKids: Boolean
  }

  type YouTubeChannelBrandingSettings {
    channel: YouTubeChannelSettings
    image: YouTubeImageSettings
  }

  type YouTubeChannelSettings {
    title: String
    description: String
    keywords: String
    defaultTab: String
    defaultLanguage: String
    country: String
  }

  type YouTubeImageSettings {
    bannerExternalUrl: String
  }

  # Custom Types for Extended Functionality
  type YouTubeChannelDetailResult {
    id: String
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

  type YouTubePlaylistDetailResult {
    id: String!
    title: String!
    description: String
    thumbnail: String
    channelTitle: String
    publishedAt: String
    itemCount: Int
    privacyStatus: String
  }

  type YouTubeVideoDetailResult {
    id: String
    title: String
    description: String
    thumbnail: String
    channelId: String
    channelTitle: String
    channelThumbnail: String
    publishedAt: String
    duration: String
    caption: [YouTubeRichText]
    tags: [String]
    viewCount: String
    likeCount: String
    dislikeCount: String
    favoriteCount: String
    commentCount: String
    embedHtml: String
    embedHeight: Int
    embedWidth: Int
  }

  type YouTubeRichText {
    type: String!
    text: YouTubeTextContent
    annotations: YouTubeAnnotations
    plain_text: String!
    href: String
  }

  type YouTubeTextContent {
    content: String!
    link: YouTubeLink
  }

  type YouTubeLink {
    url: String!
  }

  type YouTubeAnnotations {
    bold: Boolean!
    italic: Boolean!
    strikethrough: Boolean!
    underline: Boolean!
    code: Boolean!
    color: String!
  }

  type YouTubeSearchResult {
    kind: String
    etag: String
    id: YouTubeSearchResultId
    snippet: YouTubeSnippet
  }

  type YouTubeSearchResultId {
    kind: String
    videoId: String
    channelId: String
    playlistId: String
  }

  # Playlist Types
  type YouTubePlaylist {
    kind: String
    etag: String
    id: String
    snippet: YouTubePlaylistSnippet
    status: YouTubePlaylistStatus
    contentDetails: YouTubePlaylistContentDetails
    player: YouTubePlaylistPlayer
  }

  type YouTubePlaylistSnippet {
    publishedAt: String
    channelId: String
    title: String
    description: String
    thumbnails: YouTubeThumbnails
    channelTitle: String
    defaultLanguage: String
    localized: YouTubeLocalizedText
  }

  type YouTubePlaylistStatus {
    privacyStatus: String
  }

  type YouTubePlaylistContentDetails {
    itemCount: Int
  }

  type YouTubePlaylistPlayer {
    embedHtml: String
  }

  type YouTubePlaylistItem {
    kind: String
    etag: String
    id: String
    snippet: YouTubePlaylistItemSnippet
    contentDetails: YouTubePlaylistItemContentDetails
    status: YouTubePlaylistItemStatus
  }

  type YouTubePlaylistItemSnippet {
    publishedAt: String
    channelId: String
    title: String
    description: String
    thumbnails: YouTubeThumbnails
    channelTitle: String
    playlistId: String
    position: Int
    resourceId: YouTubeResourceId
  }

  type YouTubePlaylistItemContentDetails {
    videoId: String
    startAt: String
    endAt: String
    note: String
    videoPublishedAt: String
  }

  type YouTubePlaylistItemStatus {
    privacyStatus: String
  }

  type YouTubeResourceId {
    kind: String
    videoId: String
  }

  # Video Types
  type YouTubeVideo {
    kind: String
    etag: String
    id: String
    snippet: YouTubeVideoSnippet
    contentDetails: YouTubeVideoContentDetails
    status: YouTubeVideoStatus
    statistics: YouTubeVideoStatistics
    player: YouTubeVideoPlayer
    topicDetails: YouTubeVideoTopicDetails
    recordingDetails: YouTubeRecordingDetails
    liveStreamingDetails: YouTubeLiveStreamingDetails
  }

  type YouTubeVideoSnippet {
    publishedAt: String
    channelId: String
    title: String
    description: String
    thumbnails: YouTubeThumbnails
    channelTitle: String
    tags: [String]
    categoryId: String
    liveBroadcastContent: String
    defaultLanguage: String
    localized: YouTubeLocalizedText
    defaultAudioLanguage: String
  }

  type YouTubeVideoContentDetails {
    duration: String
    dimension: String
    definition: String
    caption: String
    licensedContent: Boolean
    regionRestriction: YouTubeRegionRestriction
    contentRating: YouTubeContentRating
    projection: String
  }

  type YouTubeVideoStatus {
    uploadStatus: String
    failureReason: String
    rejectionReason: String
    privacyStatus: String
    publishAt: String
    license: String
    embeddable: Boolean
    publicStatsViewable: Boolean
    madeForKids: Boolean
  }

  type YouTubeVideoStatistics {
    viewCount: String
    likeCount: String
    dislikeCount: String
    favoriteCount: String
    commentCount: String
  }

  type YouTubeVideoPlayer {
    embedHtml: String
    embedHeight: Int
    embedWidth: Int
  }

  type YouTubeVideoTopicDetails {
    topicIds: [String]
    relevantTopicIds: [String]
    topicCategories: [String]
  }

  type YouTubeRegionRestriction {
    allowed: [String]
    blocked: [String]
  }

  type YouTubeContentRating {
    acbRating: String
    agcomRating: String
    anatelRating: String
    bbfcRating: String
    bfvcRating: String
    bmukkRating: String
    catvRating: String
    catvfrRating: String
    cbfcRating: String
    cccRating: String
    cceRating: String
    chfilmRating: String
    chvrsRating: String
    cicfRating: String
    cnaRating: String
    cncRating: String
    csaRating: String
    cscfRating: String
    czfilmRating: String
    djctqRating: String
    djctqRatingReasons: [String]
    ecbmctRating: String
    eefilmRating: String
    egfilmRating: String
  }

  type YouTubeRecordingDetails {
    recordingDate: String
  }

  type YouTubeLiveStreamingDetails {
    actualStartTime: String
    actualEndTime: String
    scheduledStartTime: String
    scheduledEndTime: String
    concurrentViewers: String
    activeLiveChatId: String
  }

  # Subscription Types
  type YouTubeSubscription {
    kind: String
    etag: String
    id: String
    snippet: YouTubeSubscriptionSnippet
    contentDetails: YouTubeSubscriptionContentDetails
    subscriberSnippet: YouTubeSubscriberSnippet
  }

  type YouTubeSubscriptionSnippet {
    publishedAt: String
    channelTitle: String
    title: String
    description: String
    resourceId: YouTubeResourceId
    channelId: String
    thumbnails: YouTubeThumbnails
  }

  type YouTubeSubscriptionContentDetails {
    totalItemCount: Int
    newItemCount: Int
    activityType: String
  }

  type YouTubeSubscriberSnippet {
    title: String
    description: String
    channelId: String
    thumbnails: YouTubeThumbnails
  }

  type Query {
    # Channel Queries
    youtubeGetChannels(
      part: [String]
      id: [String]
      forUsername: String
      managedByMe: Boolean
      mine: Boolean
      maxResults: Int
      onBehalfOfContentOwner: String
      pageToken: String
    ): [YouTubeChannel]

    youtubeChannelDetail(id: String!): YouTubeChannelDetailResult
    youtubeGetChannelIdByCustomUrl(customUrl: String!): String
    youtubeChannelDetailByCustomUrl(customUrl: String!): YouTubeChannelDetailResult

    # Playlist Queries
    youtubeGetPlaylists(
      part: [String]
      channelId: String
      id: [String]
      mine: Boolean
      maxResults: Int
      onBehalfOfContentOwner: String
      onBehalfOfContentOwnerChannel: String
      pageToken: String
    ): [YouTubePlaylist]

    youtubeGetPlaylistItems(
      part: [String]
      id: String
      playlistId: String
      maxResults: Int
      pageToken: String
      videoId: String
    ): [YouTubePlaylistItem]

    youtubeGetPlaylistsByChannelId(channelId: String!): [YouTubePlaylistDetailResult]
    youtubeGetPlaylistsByCustomUrl(customUrl: String!): [YouTubePlaylistDetailResult]
    youtubeGetSimplePlaylistItems(playlistId: String): [YouTubeSimplePlaylistItem]

    # Video Queries
    youtubeGetVideos(
      part: [String]
      chart: String
      id: [String]
      myRating: String
      maxResults: Int
      pageToken: String
      regionCode: String
      videoCategoryId: String
    ): [YouTubeVideo]

    youtubeGetVideoDetailsByPlaylistId(playlistId: String!, maxItems: Int): [YouTubeVideoDetailResult]
    youtubeGetVideoIdsByChannelId(channelId: String!, maxItems: Int): [String]
    youtubeGetVideoDetailsByChannelId(channelId: String!, maxItems: Int): [YouTubeVideoDetailResult]
    youtubeMostPopularVideos(maxItems: Int): [YouTubeVideoDetailResult]

    # Search Query
    youtubeSearch(
      part: String
      q: String
      channelId: String
      type: String
      eventType: String
      order: String
    ): [YouTubeSearchResult]

    # Subscription Queries
    youtubeGetSubscriptions(args: JSON): [YouTubeSubscription]
    youtubeMySubscriptions(userId: String!): [YouTubeChannelDetailResult]
    youtubeSimpleMySubscriptions(userId: String!): [YouTubeSimpleSubscription]
    youtubeMyLikeVideos(userId: String!): [YouTubePlaylistItem]
    youtubeMyWatchLaterVideos(userId: String!): [YouTubeVideo]
    youtubeMyHistoryVideos(userId: String!): [YouTubeVideo]
    youtubeShortsVideos(userId: String!): [YouTubeVideo]
  }

  type YouTubeSimplePlaylistItem {
    title: String
    videoId: String
    description: String
    thumbnail: String
  }

  type YouTubeSimpleSubscription {
    title: String
    channelId: String
    thumbnail: String
    description: String
  }

  scalar JSON
`;
