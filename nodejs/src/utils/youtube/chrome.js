import { chromium } from 'playwright';
// import { saveFile, loadJson, findFolders } from 'jnj-lib-base';
import fs from 'fs';
import path from 'path';
import { saveFile, loadJson } from 'jnj-lib-base';

import { DEFAULT_USER_DATA_DIR, DEFAULT_EXE_PATH } from '../../env.js';

const MAX_SCROLLS = 10;
const HEADLESS = false;

// * findFolders 에러 때문에 임시로 만든 함수
const findFolders = (basePath = DEFAULT_USER_DATA_DIR, keyword = 'Profile') => {
  try {
    if (!fs.existsSync(basePath)) {
      console.warn(`Base path does not exist: ${basePath}`);
      return [];
    }
    const items = fs.readdirSync(basePath);
    return items
      .filter((item) => {
        const fullPath = path.join(basePath, item);
        try {
          return (
            fs.statSync(fullPath).isDirectory() && item.startsWith(keyword)
          );
        } catch (error) {
          console.warn(`Error accessing folder: ${fullPath}`, error.message);
          return false;
        }
      })
      .map((folder) => `${basePath}/${folder}`);
  } catch (error) {
    console.error(`Error reading directory: ${basePath}`, error.message);
    return [];
  }
};

const extractVideoId = (url) => {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?(?:v\/)?(?:shorts\/)?(?:live\/)?(?:@[\w.-]+\/)?(?:video\/)?(?:playlist\?list=)?([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

/**
 * Finds all Chrome profiles and their associated information
 * @param {string} [basePath]
 * @returns {Array<{profile: string, email?: string, full_name?: string, given_name?: string}>}
 */
const findChromeProfiles = (basePath) => {
  const actualBasePath = basePath || DEFAULT_USER_DATA_DIR;
  const pattern = 'Profile';
  const folders = findFolders(actualBasePath, pattern);
  const profiles = [];

  for (const folder of folders) {
    const json = loadJson(`${folder}/Preferences`);

    if (json.account_info && json.account_info.length > 0) {
      const profilePath = folder.replace(/\\/g, '/');
      const profileName = profilePath.split('/').pop() || '';

      const profile = {
        profile: profileName,
        email: json.account_info[0].email,
        full_name: json.account_info[0].full_name,
        given_name: json.account_info[0].given_name,
      };

      profiles.push(profile);
    }
  }

  return profiles;
};

/**
 * Gets the profile name associated with a specific email
 * @param {string} [email="bigwhitekmc@gmail.com"]
 * @param {string} [basePath]
 * @returns {string}
 */
const getProfileByEmail = (email = 'bigwhitekmc@gmail.com', basePath) => {
  const actualBasePath = basePath || DEFAULT_USER_DATA_DIR;
  const folders = findFolders(actualBasePath, 'Profile');

  for (const folder of folders) {
    const json = loadJson(`${folder}/Preferences`);

    if (json.account_info && json.account_info.length > 0) {
      if (json.account_info[0].email === email) {
        return folder.replace(/\\/g, '/').split('/').pop() || 'Profile 1';
      }
    }
  }

  return 'Profile 1';
};

/**
 * Gets the Chrome paths for user data directory and executable
 * @param {string} [userDataDir]
 * @param {string} [exePath]
 * @returns {{userDataDir: string, exePath: string}}
 */
const getChromePaths = (userDataDir, exePath) => ({
  userDataDir: userDataDir || DEFAULT_USER_DATA_DIR,
  exePath: exePath || DEFAULT_EXE_PATH,
});

const scrapePage = async ({
  url = 'https://www.google.com',
  email = 'jnjsoft.one@gmail.com',
  // email = 'bigwhitekmc@gmail.com',
  callBack = async ({ browser, page }) => {
    saveFile('google.html', await page.content());
  },
  params = {},
  waitTime = 30000,
}) => {
  const { userDataDir, exePath } = getChromePaths();
  const profileName = getProfileByEmail(email);

  // Chrome 브라우저를 실행합니다.
  const browser = await chromium.launchPersistentContext(userDataDir, {
    headless: HEADLESS,
    executablePath: exePath,
    args: [`--profile-directory=${profileName}`],
  });

  const page = await browser.newPage();

  try {
    await page.goto(url);
    const result = await callBack({ browser, page, params });
    await new Promise((resolve) => setTimeout(resolve, waitTime)); // waitTime초간 작업 완료 후 대기
    return result;
  } catch (error) {
    console.error('에러 발생:', error);
  } finally {
    await browser.close();
  }
};

// 페이지 자동 스크롤 함수
async function autoScroll(page, maxScrolls = MAX_SCROLLS) {
  await page.evaluate(async (maxScrolls) => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      let scrollCount = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        scrollCount++;

        if (totalHeight >= scrollHeight || scrollCount >= maxScrolls) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  }, maxScrolls);
}

const _watchLaterVideos = async ({ browser, page }) => {
  try {
    await page.goto('https://www.youtube.com/playlist?list=WL', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });

    await page.waitForSelector('#contents.ytd-playlist-video-list-renderer', {
      timeout: 10000,
    });

    await autoScroll(page);

    const videos = await page.evaluate(() => {
      const videoElements = document.querySelectorAll(
        'ytd-playlist-video-renderer'
      );
      return Array.from(videoElements).map((element) => {
        const titleElement = element.querySelector('#video-title');
        return {
          videoUrl: titleElement ? titleElement.href : '',
        };
      });
    });

    return videos.map((video) => extractVideoId(video.videoUrl));
  } catch (error) {
    console.error('에러 발생:', error);
    return [];
  }
};

const _historyVideos = async ({ browser, page }) => {
  try {
    await page.goto('https://www.youtube.com/feed/history', {
      waitUntil: 'networkidle',
      timeout: 60000,
    });

    await page.waitForSelector('ytd-browse[page-subtype="history"]', {
      timeout: 10000,
    });

    await autoScroll(page, MAX_SCROLLS);

    const videos = await page.evaluate(() => {
      const videoElements = document.querySelectorAll('ytd-video-renderer');
      return Array.from(videoElements).map((element) => {
        const titleElement = element.querySelector('#video-title');
        return {
          videoUrl: titleElement ? titleElement.href : '',
        };
      });
    });

    return videos.map((video) => extractVideoId(video.videoUrl));
  } catch (error) {
    console.error('에러 발생:', error);
    return [];
  }
};

const _shortsVideos = async ({
  browser,
  page,
  params = { channelId: 'UCUpJs89fSBXNolQGOYKn0YQ' },
}) => {
  try {
    await page.goto(
      `https://www.youtube.com/channel/${params.channelId}/shorts`,
      {
        waitUntil: 'networkidle',
        timeout: 60000,
      }
    );

    console.log('page.url:', page.url());

    await page.waitForSelector('#contents', {
      timeout: 10000,
    });

    await autoScroll(page, MAX_SCROLLS);

    const videos = await page.evaluate(() => {
      const videoElements = document.querySelectorAll('ytd-rich-item-renderer');
      return Array.from(videoElements).map((element) => {
        const titleElement = element.querySelector('a');
        return {
          videoUrl: titleElement ? titleElement.href : '',
        };
      });
    });

    return videos.map((video) => extractVideoId(video.videoUrl));
  } catch (error) {
    console.error('에러 발생:', error);
    return [];
  }
};

// * 나중에 볼 동영상 추출
const watchLaterVideoIds = async (userId = 'bigwhitekmc') => {
  return await scrapePage({
    email: `${userId}@gmail.com`, // 'bigwhitekmc@gmail.com'
    url: 'https://www.youtube.com/playlist?list=WL',
    callBack: _watchLaterVideos,
    waitTime: 5000,
  });
};

// * 시청 기록 추출
const historyVideoIds = async (userId = 'bigwhitekmc') => {
  return await scrapePage({
    email: `${userId}@gmail.com`, // 'bigwhitekmc@gmail.com'
    url: 'https://www.youtube.com/feed/history',
    callBack: _historyVideos,
    waitTime: 10000,
  });
};

// * 쇼츠 영상 추출
const shortsVideoIds = async (
  userId = 'bigwhitekmc',
  { channelId = 'UCUpJs89fSBXNolQGOYKn0YQ' }
) => {
  return await scrapePage({
    email: `${userId}@gmail.com`, // 'bigwhitekmc@gmail.com'
    url: `https://www.youtube.com/channel/${channelId}/shorts`,
    callBack: _shortsVideos,
    params: { channelId },
    waitTime: 10000,
  });
};

export { scrapePage, watchLaterVideoIds, historyVideoIds, shortsVideoIds };

// console.log(DEFAULT_EXE_PATH);
// // console.log('findFolders:', findFolders());

// console.log('watchLaterVideoIds:', await watchLaterVideoIds('bigwhitekmc'));
// console.log('watchLaterVideoIds:', await watchLaterVideoIds('bigwhitekmc'));
// console.log('historyVideoIds:', await historyVideoIds('bigwhitekmc'));
// console.log('shortsVideoIds:', await shortsVideoIds('bigwhitekmc', {}));

// https://www.youtube.com/channel/UC-9-kyTW8ZkZNDHQJ6FUs5g/shorts
// https://www.youtube.com/channel/UCUpJs89fSBXNolQGOYKn0YQ/shorts
