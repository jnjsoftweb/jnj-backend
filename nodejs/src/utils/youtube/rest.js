// [API Reference](https://developers.google.com/youtube/v3/docs?hl=ko)
import axios from 'axios';
import { API_KEY, API_URL } from '../../env.js';

// console.log(API_KEY, API_URL);

// * REST API용 함수
// YouTube API 응답을 가져오는 함수
const getResponse = async (slug, params) => {
  try {
    const response = await axios.get(`${API_URL}/${slug}`, {
      params: {
        ...params,
        key: API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`YouTube API 오류 (${slug}):`, error);
    throw new Error(
      `YouTube API 요청 중 오류가 발생했습니다: ${error.message}`
    );
  }
};

// 모든 응답을 가져오는 함수
const getAllResponses = async (slug, params, maxItems = Infinity) => {
  let results = [];
  let nextPageToken = null;

  do {
    const data = await getResponse(slug, {
      ...params,
      pageToken: nextPageToken,
      maxResults: Math.min(50, maxItems - results.length), // Adjust maxResults based on remaining items
    });

    results = results.concat(data.items);
    nextPageToken = data.nextPageToken;
  } while (nextPageToken && results.length < maxItems);

  // Trim excess items if we've exceeded maxItems
  if (results.length > maxItems) {
    results = results.slice(0, maxItems);
  }

  return results;
};

// * Utils
// https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails,id,liveStreamingDetails,localizations,player, recordingDetails,snippet,statistics,status,topicDetails&id=qQPxP9TZEO8,D4nZW4wk3gQ&key=AIzaSyBHsLKBGbPRGi11o2m7i7e_TZU3efYsWag
const videosFromVideoIds = async (
  videoIds,
  part = 'contentDetails,id,liveStreamingDetails,localizations,player,recordingDetails,snippet,statistics,status,topicDetails'
) => {
  const videos = [];
  for (const id of videoIds) {
    const query = { part, id };
    const video = await getAllResponses('videos', query);
    videos.push(video[0]);
  }
  return videos;
};

// YouTube API 응답을 가져오는 함수
const getChannelIdByCustomUrl = async (customUrl) => {
  try {
    if (!customUrl) {
      return '';
    }
    customUrl = customUrl.startsWith('@') ? customUrl.slice(1) : customUrl;
    const searchResponse = await getResponse('search', {
      part: 'id',
      type: 'channel',
      q: customUrl,
      maxResults: 1,
    });

    if (searchResponse.items && searchResponse.items.length > 0) {
      return searchResponse.items[0].id.channelId;
    } else {
      return '';
    }
  } catch (error) {
    return '';
  }
};

// // ! 쇼츠 여부 판단이 불완전함(추후 수정 필요, 60S 이하여도 쇼츠가 아닐 수 있음)
// const isShorts = (video) => {
//   const duration = video.contentDetails.duration;
//   return duration.includes('PT') && !duration.includes('M');
// };

const isShorts = async (videoId) => {
  const url = `https://www.youtube.com/shorts/${videoId}`;
  try {
    const response = await axios.get(url, {
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 300; // 리디렉션 상태 코드도 허용
      },
    });
    // 최종 URL이 '/shorts/'를 포함하는지 확인
    return response.request.res.responseUrl.includes('/shorts/');
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
};

// ** videoId 배열 가져오기

// * 인기 동영상
const mostPopularVideoIds = async (maxItems = 50) => {
  const videos = await getAllResponses(
    'videos',
    {
      part: 'id',
      chart: 'mostPopular',
    },
    maxItems
  );
  return videos.map((video) => video.id);
};

const getVideoTitle = async (videoId) => {
  const video = await getResponse('videos', { part: 'snippet', id: videoId });
  return video.items[0].snippet.title;
};

const getPlaylistTitle = async (playlistId) => {
  const playlist = await getResponse('playlists', {
    part: 'snippet',
    id: playlistId,
  });
  return playlist.items[0].snippet.title;
};

export {
  getAllResponses,
  getResponse,
  getChannelIdByCustomUrl,
  videosFromVideoIds,
  isShorts,
  mostPopularVideoIds,
  getVideoTitle,
  getPlaylistTitle,
};

// const response = await axios.get(`https://youtube.googleapis.com/youtube/v3/playlists?part=snippet&channelId=UCJIlfUISLIj9DODAQJWGHfA&maxResults=25&key=${API_KEY}`);
// console.log(response.data);

// const videoIds = [
//   'ekr2nIex040', // video
//   '4RCBcV2Ucpo', // video
//   'c3V_p6SPUFQ', // redirect
//   'h1xDiBr6HD4', // shorts
// ];

// for (const videoId of videoIds) {
//   isShorts(videoId).then((result) => console.log(videoId, result));
// }

// getVideoTitle('zgGSy0seeYc').then((result) => console.log(result));
// getPlaylistTitle('PLqSw3o2OV6pzr8U1BJSCwyosUi0oNiJ9Z').then((result) =>
//   console.log(result)
// );
