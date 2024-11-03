const mapYoutubeCollection = {
  users: {
    collection: 'youtubeUsers',
    id: 'userId',
    uniqueFields: 'userId'
  },
  subscriptions: {
    collection: 'youtubeSubscriptions',
    id: 'subscriptionId',
    uniqueFields: 'subscriptionId'
  },
  channels: {
    collection: 'youtubeChannels',
    id: 'channelId',
    uniqueFields: 'channelId'
  },
  playlists: {
    collection: 'youtubePlaylists',
    id: 'playlistId',
    uniqueFields: 'playlistId'
  },
  videos: {
    collection: 'youtubeVideos',
    id: 'videoId',
    uniqueFields: 'videoId'
  }
};
export {mapYoutubeCollection };
