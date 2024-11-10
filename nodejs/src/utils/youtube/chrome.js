import { By } from 'selenium-webdriver';
import { Chrome } from 'jnj-lib-web';
import { DEFAULT_USER_DATA_DIR } from '../../env.js';

const MAX_SCROLLS = 10;
const YOUTUBE_DEFAULT_USER_ID = 'bigwhitekmc';
const YOUTUBE_DEFAULT_USER_EMAIL = 'bigwhitekmc@gmail.com';

const extractVideoId = (url) => {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?(?:v\/)?(?:shorts\/)?(?:live\/)?(?:@[\w.-]+\/)?(?:video\/)?(?:playlist\?list=)?([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};


// * 페이지 이동
const goToUrl = async ({url, email= YOUTUBE_DEFAULT_USER_EMAIL, userDataDir= DEFAULT_USER_DATA_DIR, headless= true}) => {
  // * 초기화
  const chrome = new Chrome({
    headless,
    email,
    userDataDir,
  });
  await chrome.goto(url);
  await chrome.getFullSize();  // auto scroll
  return chrome;
}

// * 요소 추출
const _getElements = async (url, css, {email= YOUTUBE_DEFAULT_USER_EMAIL, userDataDir = DEFAULT_USER_DATA_DIR, headless = false}) => {
  const chrome = await goToUrl({url, email, userDataDir, headless});
  const driver = chrome.driver;
  return {chrome, elements: await driver.findElements(By.css(css))};
}

// * 나중에 볼 동영상 추출
const watchLaterVideoIds = async (userId = YOUTUBE_DEFAULT_USER_ID) => {
  const email = `${userId}@gmail.com`
  const {chrome, elements} = await _getElements('https://www.youtube.com/playlist?list=WL', 'ytd-playlist-video-renderer', {email});

  console.log(elements, elements.length)

  const videos = [];
  for (const element of elements) {
    const titleElement = await element.findElement(By.css('#video-title'));
    const videoUrl = await titleElement.getAttribute('href');
    if (videoUrl) {
        videos.push({ videoUrl });
    }
  }

  chrome.close();

  return videos.map((video) => extractVideoId(video.videoUrl));
}


const historyVideoIds = async (userId = YOUTUBE_DEFAULT_USER_ID) => {
  const email = `${userId}@gmail.com`
  const {chrome, elements} = await _getElements('https://www.youtube.com/feed/history', 'ytd-video-renderer', {email});

  console.log(elements, elements.length)
  const videos = [];
  for (const element of elements) {
    const titleElement = await element.findElement(By.css('#video-title'));
    const videoUrl = await titleElement.getAttribute('href');
    if (videoUrl) {
        videos.push({ videoUrl });
    }
  }

  chrome.close();
  return videos.map((video) => extractVideoId(video.videoUrl));
};

const shortsVideoIdsByChannelId = async (channelId = 'UCUpJs89fSBXNolQGOYKn0YQ') => {
  const {chrome, elements} = await _getElements(`https://www.youtube.com/channel/${channelId}/shorts`, 'ytd-rich-item-renderer', {});
  
  const videos = [];

  for (const element of elements) {
    const titleElement = element.findElement(By.css('a'));
    const videoUrl = await titleElement.getAttribute('href');
    if (videoUrl) {
        videos.push({ videoUrl });
    }
  }

  chrome.close();
  return videos.map((video) => extractVideoId(video.videoUrl));
};


export { watchLaterVideoIds, historyVideoIds, shortsVideoIdsByChannelId };

// console.log(await watchLaterVideoIds("bigwhitekmc"))
// console.log(await historyVideoIds("bigwhitekmc"))
// console.log(await shortsVideoIdsByChannelId('UCUpJs89fSBXNolQGOYKn0YQ'))