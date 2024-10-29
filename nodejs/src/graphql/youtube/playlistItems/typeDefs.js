import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type YouTubePlaylistItem {
    id: String!
    snippet: PlaylistItemSnippet!
    contentDetails: PlaylistItemContentDetails
  }

  type PlaylistItemSnippet {
    publishedAt: String
    channelId: String
    title: String
    description: String
    thumbnails: Thumbnails
    channelTitle: String
    playlistId: String
    position: Int
    resourceId: ResourceId
  }

  type PlaylistItemContentDetails {
    videoId: String
    startAt: String
    endAt: String
    note: String
    videoPublishedAt: String
  }

  type ResourceId {
    kind: String
    videoId: String
  }

  type SimplePlaylistItem {
    title: String
    videoId: String
    description: String
    thumbnail: String
  }

  type SimplePlaylistItemList {
    items: [SimplePlaylistItem!]!
  }

  type YouTubePlaylistItemList {
    items: [YouTubePlaylistItem!]!
  }
`;
