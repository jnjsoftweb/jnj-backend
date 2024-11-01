import { pbFindOne, pbFind, pbInsertOne, pbInsert, pbUpdate } from '../../pocketbase/app.js';

const _channelById = async (id) => {
    const channel = await pbFindOne('youtubeChannel', `channelId="${id}"`);
    return {
        ...channel,
        id: channel.channelId,
    };
};

export const resolvers = {
    Query: {
        youtubeGetChannelsPB: async (_, args) => {
          const channels = await pbFind('youtubeChannel', args);
          return channels.map(channel => ({
            ...channel,
            id: channel.channelId,  // channelId를 id로 매핑
          }));
        }
    }
}

// const channel = await _channelById(id)
// console.log(JSON.stringify(channel))

// const channels = await pbFind('youtubeChannel');
// console.log(channels);

const channel = await _channelById('UCWvJB2C8EZBptAJIQBOBllw_')
// const channel = await _channelById('UCWvJB2C8EZBptAJIQBOBllw')
console.log(JSON.stringify(channel))

// const channels = await pbFind('youtubeChannel');
// const channels = await pbFind('youtubeChannel', {filter: `customUrl="@codingapple"`});
// const channels = await pbFind('youtubeChannel', {filter: `customUrl~"@a"`});
// console.log(channels);


// # 모든 채널 조회
// query GetAllChannels {
//   youtubeGetChannelsPB {
//     id
//     title
//     customUrl
//     subscriberCount
//     videoCount
//   }
// }

// # 특정 채널 조회 (customUrl로 정확히 매칭)
// query GetChannelByCustomUrl {
//   youtubeGetChannelsPB(filter: "customUrl=\"@codingapple\"") {
//     id
//     title
//     customUrl
//     subscriberCount
//     description
//   }
// }

// # 채널명에 특정 문자열이 포함된 채널 검색
// query SearchChannelsByTitle {
//   youtubeGetChannelsPB(filter: "title~\"coding\"") {
//     id
//     title
//     customUrl
//     subscriberCount
//   }
// }

// # 구독자 수로 정렬하여 상위 채널 조회
// query GetTopChannelsBySubscribers {
//   youtubeGetChannelsPB(
//     filter: "subscriberCount>1000"
//     sort: "-subscriberCount"
//     perPage: 5
//   ) {
//     id
//     title
//     customUrl
//     subscriberCount
//     videoCount
//   }
// }

// # 최근에 생성된 채널 조회
// query GetRecentChannels {
//   youtubeGetChannelsPB(
//     sort: "-publishedAt"
//     perPage: 10
//   ) {
//     id
//     title
//     customUrl
//     publishedAt
//     subscriberCount
//   }
// }

// # 여러 조건을 조합한 복잡한 쿼리
// query GetActiveChannels {
//   youtubeGetChannelsPB(
//     filter: "videoCount>100 && subscriberCount>10000"
//     sort: "-viewCount"
//     perPage: 5
//   ) {
//     id
//     title
//     customUrl
//     subscriberCount
//     videoCount
//     viewCount
//     description
//   }
// }