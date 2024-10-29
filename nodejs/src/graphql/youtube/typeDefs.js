export const typeDefs = `#graphql
  type YouTubeChannel {
    id: ID!
    snippet: Snippet
    statistics: Statistics
    contentDetails: ContentDetails
  }

  type Snippet {
    publishedAt: String
    channelId: String
    title: String
    description: String
    thumbnails: Thumbnails
    channelTitle: String
    playlistId: String
    position: Int
    resourceId: ResourceId
    videoOwnerChannelTitle: String
    videoOwnerChannelId: String
  }

  type ResourceId {
    kind: String
    videoId: String
  }

  type Thumbnails {
    default: Thumbnail
    medium: Thumbnail
    high: Thumbnail
  }

  type Thumbnail {
    url: String
    width: Int
    height: Int
  }

  type Statistics {
    viewCount: String
    subscriberCount: String
    hiddenSubscriberCount: Boolean
    videoCount: String
  }

  type ContentDetails {
    videoId: String
    videoPublishedAt: String
    duration: String
    dimension: String
    definition: String
    caption: String
    licensedContent: Boolean
    regionRestriction: RegionRestriction
    contentRating: ContentRating
    projection: String
    hasCustomThumbnail: Boolean
  }

  type RegionRestriction {
    allowed: [String]
    blocked: [String]
  }

  type ContentRating {
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

  type YouTubePlaylist {
    id: ID!
    snippet: Snippet
    status: Status
    contentDetails: ContentDetails
  }

  type Status {
    privacyStatus: String
  }

  type YouTubePlaylistItem {
    id: ID!
    snippet: Snippet
    contentDetails: ContentDetails
  }

  type YouTubeSearchResult {
    kind: String
    etag: String
    id: SearchResultId
    snippet: Snippet
  }

  type SearchResultId {
    kind: String
    videoId: String
    channelId: String
    playlistId: String
  }

  type YouTubeSubscription {
    id: ID!
    snippet: Snippet
    contentDetails: ContentDetails
  }

  type YouTubeVideo {
    kind: String
    etag: String
    id: String
    snippet: VideoSnippet
    contentDetails: VideoContentDetails
    status: VideoStatus
    statistics: VideoStatistics
    player: Player
    topicDetails: TopicDetails
    recordingDetails: RecordingDetails
    fileDetails: FileDetails
    processingDetails: ProcessingDetails
    suggestions: Suggestions
    liveStreamingDetails: LiveStreamingDetails
  }

  type VideoSnippet {
    publishedAt: String
    channelId: String
    title: String
    description: String
    thumbnails: Thumbnails
    channelTitle: String
    tags: [String]
    categoryId: String
    liveBroadcastContent: String
    defaultLanguage: String
    localized: Localized
    defaultAudioLanguage: String
  }

  type Localized {
    title: String
    description: String
  }

  type VideoContentDetails {
    duration: String
    dimension: String
    definition: String
    caption: String
    licensedContent: Boolean
    regionRestriction: RegionRestriction
    contentRating: ContentRating
    projection: String
  }

  type VideoStatus {
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

  type VideoStatistics {
    viewCount: String
    likeCount: String
    dislikeCount: String
    favoriteCount: String
    commentCount: String
  }

  type Player {
    embedHtml: String
    embedHeight: Int
    embedWidth: Int
  }

  type TopicDetails {
    topicIds: [String]
    relevantTopicIds: [String]
    topicCategories: [String]
  }

  type RecordingDetails {
    recordingDate: String
  }

  type FileDetails {
    fileName: String
    fileSize: String
    fileType: String
    container: String
    videoStreams: [VideoStream]
    audioStreams: [AudioStream]
    durationMs: String
    bitrateBps: String
    creationTime: String
  }

  type VideoStream {
    widthPixels: Int
    heightPixels: Int
    frameRateFps: Float
    aspectRatio: Float
    codec: String
    bitrateBps: String
    rotation: String
    vendor: String
  }

  type AudioStream {
    channelCount: Int
    codec: String
    bitrateBps: String
    vendor: String
  }

  type ProcessingDetails {
    processingStatus: String
    processingProgress: ProcessingProgress
    processingFailureReason: String
    fileDetailsAvailability: String
    processingIssuesAvailability: String
    tagSuggestionsAvailability: String
    editorSuggestionsAvailability: String
    thumbnailsAvailability: String
  }

  type ProcessingProgress {
    partsTotal: Int
    partsProcessed: Int
    timeLeftMs: String
  }

  type Suggestions {
    processingErrors: [String]
    processingWarnings: [String]
    processingHints: [String]
    tagSuggestions: [TagSuggestion]
    editorSuggestions: [String]
  }

  type TagSuggestion {
    tag: String
    categoryRestricts: [String]
  }

  type LiveStreamingDetails {
    actualStartTime: String
    actualEndTime: String
    scheduledStartTime: String
    scheduledEndTime: String
    concurrentViewers: String
    activeLiveChatId: String
  }

  type Query {
    youtubeGetChannels(
      part: String
      id: String
      forUsername: String
      mine: Boolean
    ): [YouTubeChannel]
    youtubeGetChannelIdByCustomUrl(customUrl: String!): String
    youtubeGetChannelByCustomUrl(customUrl: String!): [YouTubeChannel]
    youtubeGetPlaylists(
      part: String
      id: String
      channelId: String
      mine: Boolean
    ): [YouTubePlaylist]
    youtubeGetPlaylistsByCustomUrl(customUrl: String!): [YouTubePlaylist]
    youtubeGetPlaylistItems(
      part: String
      id: String
      playlistId: String
      videoId: String
    ): [YouTubePlaylistItem]
    youtubeSearch(
      part: String
      q: String
      channelId: String
      type: String
      eventType: String
      order: String
    ): [YouTubeSearchResult]
    youtubeGetSubscriptions(args: JSON): [YouTubeSubscription!]!
    youtubeGetVideos(
      part: String
      id: String
      chart: String
      myRating: String
      regionCode: String
    ): [YouTubeVideo]
  }
`;
