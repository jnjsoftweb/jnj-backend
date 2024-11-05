const mapYoutubePbCollection = {
    users: {
      collection: 'users',
      id: 'userId',
      uniqueFields: 'userId'
    },
    subscriptions: {
      collection: 'subscriptions',
      id: 'subscriptionId',
      uniqueFields: 'subscriptionId'
    },
    channels: {
      collection: 'channels',
      id: 'channelId',
      uniqueFields: 'channelId'
    },
    playlists: {
      collection: 'playlists',
      id: 'playlistId',
      uniqueFields: 'playlistId'
    },
    videos: {
      collection: 'videos',
      id: 'videoId',
      uniqueFields: 'videoId'
    }
  };
  
  export { mapYoutubePbCollection };