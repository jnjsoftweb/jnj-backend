import { Youtube } from 'jnj-lib-google';

const yt = async (userId) => {
  const youtube = new Youtube(userId);
  await youtube.init();
  return youtube;
};

// 내 채널의 관련 플레이 리스트  { likes: 'LL', uploads: 'UUGKts6AP1HFBqcAo4r6GHTg' }
const getRelatedPlaylists = async (userId) => {
  const response = await this.service.channels.list({
    part: 'contentDetails',
    mine: true,
  });

  return response.data.items[0].contentDetails.relatedPlaylists;
};

// 내 구독 목록 가져오기
const mySubscriptions = async (userId) => {
  const youtube = await yt(userId);
  return youtube.subscriptions_();
};

// "LL": 좋아요 표시한 동영상 가져오기
const myPlaylistItems = async (userId, playlistId = 'LL') => {
  const youtube = await yt(userId);
  const playlistItems = [];
  let nextPageToken;

  do {
    const response = await youtube.service.playlistItems.list({
      part: 'snippet,contentDetails',
      playlistId: playlistId,
      maxResults: 50,
      pageToken: nextPageToken || undefined,
    });

    playlistItems.push(...response.data.items);
    nextPageToken = response.data.nextPageToken || undefined;
  } while (nextPageToken);

  return playlistItems;
};

// 좋아요 누른 동영상
// const getWatchHistory = async (userId) => {
//   const youtube = await yt(userId);
//   try {
//     const response = await youtube.service.videos.list({
//       part: 'id',
//       // part: 'snippet,contentDetails',
//       myRating: 'like',
//       maxResults: 10, // 최대 50개까지 가져올 수 있습니다
//     });

//     console.log('시청 기록:', response.data.items);
//     return response.data.items;
//   } catch (error) {
//     console.error('에러 발생:', error);
//     return [];
//   }
// };

export { getRelatedPlaylists, mySubscriptions, myPlaylistItems };
