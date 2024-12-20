import fs from 'fs';
import path from 'path';
import cp from 'child_process';

import youtubeSubtitlesScraper from 'youtube-captions-scraper';

import { BASE_DOWN_DIR } from '../../env.js';
import { getAllResponses, getVideoTitle, getPlaylistTitle } from './rest.js';

// console.log('BASE_DOWN_DIR: ', BASE_DOWN_DIR);

// * utils
const composeHangul = (str) => {
  // return Hangul.assemble(str);
  return str.normalize('NFKC');
};

const sanitizeFileName = (str) => {
  if (!str) return '';
  str = composeHangul(str);

  // 윈도우에서 파일/폴더명으로 사용할 수 없는 문자 제거
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
  // 마침표(.)로 시작하거나 끝나는 경우 제거
  const invalidDots = /(^\.+|\.+$)/g;
  // 연속된 공백을 하나의 공백으로 변환
  const multipleSpaces = /\s+/g;

  return str
    .replace(invalidChars, '') // 사용할 수 없는 문자 제거
    .replace(invalidDots, '') // 시작/끝 마침표 제거
    .replace(multipleSpaces, ' ') // 연속된 공백을 하나로
    .trim(); // 앞뒤 공백 제거
};

const createDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// 중복 제거 함수 추가
const removeDuplicates = (str) => {
  return [...new Set(str.split(','))].join(',');
};

const filterVideo = (file) => {
  return file.endsWith('.mp4');
};

const extractId = (src) => {
  return src.split('_').pop().split('.').shift();
};

// * listFiles
const listFilesInDir = (directory = BASE_DOWN_DIR) => {
  const result = {
    files: [],
    folders: [],
  };

  try {
    const items = fs.readdirSync(directory);

    for (const item of items) {
      const fullPath = path.join(directory, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        result.folders.push(item);
      } else {
        if (filterVideo(item)) {
          result.files.push(item);
        }
      }
    }

    return result;
  } catch (error) {
    console.error('디렉토리 읽기 오류:', error.message);
    return {
      files: [],
      folders: [],
    };
  }
};

const listIdsInDir = (directory = BASE_DOWN_DIR) => {
  const { files, folders } = listFilesInDir(directory);
  const videoIds = files.map((file) => extractId(file));
  const playlistIds = folders.map((folder) => extractId(folder));
  return { videoIds, playlistIds };
};

// * download
const srtFromSubtitles = (Subtitles) => {
  return Subtitles.map((Subtitle, index) => {
    const start = parseFloat(Subtitle.start);
    const end = start + parseFloat(Subtitle.dur);
    const startTime = new Date(start * 1000).toISOString().substr(11, 12);
    const endTime = new Date(end * 1000).toISOString().substr(11, 12);

    return `${index + 1}\n${startTime.replace('.', ',')} --> ${endTime.replace(
      '.',
      ','
    )}\n${Subtitle.text}\n`;
  }).join('\n');
};

const txtFromSubtitles = (Subtitles) => {
  return Subtitles.map((Subtitle) => `${Subtitle.text}`).join('\n');
};

const _getSubtitles = async (videoId, languages) => {
  languages = languages.split(',').map((lang) => lang.trim());
  console.log('languages: ', languages);
  let subtitles = [];
  for (const language of languages) {
    console.log('language: ', language);
    try {
      const captions = await youtubeSubtitlesScraper.getSubtitles({
        videoID: videoId,
        lang: language,
      });
      console.log(`성공적으로 가져온 자막 언어: ${language || '자동 감지'}`);
      subtitles.push({ language, captions });
    } catch (error) {
      console.log(
        `${
          language || '자동 감지'
        } 자막을 가져오는 데 실패했습니다. 다음 언어 시도 중...`
      );
    }
  }

  return subtitles;
};

const _downloadSubtitles = (captions, formatType = 'srt') => {
  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const secs = date.getUTCSeconds().toString().padStart(2, '0');
    const ms = date.getUTCMilliseconds().toString().padStart(3, '0');
    return `${hours}:${minutes}:${secs},${ms}`;
  };

  switch (formatType.toLowerCase()) {
    case 'vtt':
      return `WEBVTT\n\n${captions
        .map(
          (caption) =>
            `${formatTime(caption.start)} --> ${formatTime(
              parseFloat(caption.start) + parseFloat(caption.dur)
            )}\n${caption.text}`
        )
        .join('\n\n')}`;
    case 'srt':
      return captions
        .map(
          (caption, index) =>
            `${index + 1}\n${formatTime(caption.start)} --> ${formatTime(
              parseFloat(caption.start) + parseFloat(caption.dur)
            )}\n${caption.text}`
        )
        .join('\n\n');
    case 'txt':
      return captions.map((caption) => caption.text).join('\n');
    default:
      return captions.map((caption) => caption.text).join('\n');
  }
};

// const downloadSubtitles = async (
//   videoId,
//   languages = 'en,ko',
//   formatType = 'srt',
//   outputDir = BASE_DOWN_DIR
// ) => {
const downloadSubtitles = async ({
  videoId,
  languages = 'en,ko',
  formatType = 'srt',
  outputDir = BASE_DOWN_DIR,
}) => {
  let subtitles = await _getSubtitles(videoId, languages);
  for (const subtitle of subtitles) {
    subtitle.captions = _downloadSubtitles(subtitle.captions, formatType);
  }

  const filePaths = [];
  // T파일 저장
  let index = 0;
  for (const subtitle of subtitles) {
    const title = sanitizeFileName(await getVideoTitle(videoId));
    let filePath = `${outputDir}/${title}_${videoId}_${subtitle.language}.${formatType}`;
    fs.writeFileSync(filePath, subtitle.captions);
    filePaths.push(filePath);
    if (index === 0) {
      filePath = `${outputDir}/${title}_${videoId}.${formatType}`;
      fs.writeFileSync(filePath, subtitle.captions);
      filePaths.push(filePath);
    }
    index++;
  }

  return filePaths;
};

const downloadYoutube = async ({
  videoId,
  resolution = '720',
  bitrate = '128',
  outputDir = BASE_DOWN_DIR,
}) => {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const title = sanitizeFileName(await getVideoTitle(videoId));
  // console.log('Downloading from:', url, 'title: ', Hangul.assemble(title));

  // yt-dlp -S vcodec:h264,fps,res:1080,acodec:m4a https://www.youtube.com/watch?v=rc4DLFqMRbk
  // const command = `yt-dlp -f "bestvideo[height<=?${resolution}][ext=mp4]+bestaudio[ext=m4a]/best[height<=?${resolution}][ext=mp4]/best[ext=mp4]" -o "${outputDir}/${videoId}.mp4" ${url}`;
  const command = `yt-dlp -S vcodec:h264,fps,res:${resolution},acodec:m4a -o "${outputDir}/${title}_${videoId}.mp4" ${url}`;
  // const command = `yt-dlp -S vcodec:h264,fps,res:${resolution},acodec:m4a -o "${outputDir}/%(title)s_%(id)s.%(ext)s" ${url}`;
  // -o "%(id)s_%(title)s.%(ext)s"   "%(playlist_id)s_%(playlist_title)s"

  console.log('command: ', command);

  const result = cp.execSync(command);
  // console.log('result: ', result);

  return `${outputDir}/${title}_${videoId}.mp4`;
};

const downloadYoutubeAll = async ({
  videoIds, // ','로 구분 여러 동영상
  resolution = '720',
  bitrate = '128',
  languages = 'en,ko',
  formatType = 'srt',
  outputDir = BASE_DOWN_DIR,
}) => {
  // const filePaths = [];
  const downloaded = {
    resolution,
    bitrate,
    languages,
    formatType,
    outputDir,
    downs: [],
  };
  for (const videoId of videoIds.split(',')) {
    const down = {};
    try {
      const subtitles = await downloadSubtitles({
        videoId,
        languages,
        formatType,
        outputDir,
      });
      if (subtitles) {
        down.subtitles = subtitles.map((s) => s.split('/').pop()).join('|');
      }
      const video = await downloadYoutube({
        videoId,
        resolution,
        bitrate,
        outputDir,
      });
      if (video) {
        down.video = video.split('/').pop();
        downloaded.downs.push(down);
      }
    } catch (error) {
      console.error('An error occurred:', error.message);
      return [];
    }
  }
  return downloaded;
};

// downloadPlaylist 함수 수정
const downloadPlaylist = async ({
  playlistId,
  resolution = '720',
  bitrate = '128',
  languages = 'en,ko',
  formatType = 'srt',
  outputDir = BASE_DOWN_DIR,
}) => {
  const playlistTitle = await getPlaylistTitle(playlistId);

  outputDir = `${BASE_DOWN_DIR}/${playlistTitle}_${playlistId}`; // snippet.title  // snippet.channelTitle
  // outputDir이 없으면 생성
  createDir(outputDir);

  const query = { part: 'contentDetails', playlistId };

  try {
    const res = await getAllResponses('playlistItems', query);
    console.log('res: ', res);
    let videoIds = res.map((item) => item.contentDetails.videoId).join(',');
    // 중복 제거
    videoIds = removeDuplicates(videoIds);
    console.log(videoIds);
    return await downloadYoutubeAll({
      videoIds, // ','로 구분 여러 동영상
      resolution,
      bitrate,
      languages,
      formatType,
      outputDir,
    });
  } catch (error) {
    console.error('An error occurred:', error.message);
    return [];
  }
};

// * 자막 변환
const srtToVtt = (srtContent) => {
  // 줄 단위로 분리
  const lines = srtContent.split('\n');

  // 숫자만 있는 줄 제거
  const filteredLines = lines.filter((line) => {
    const trimmed = line.trim();
    return !(trimmed !== '' && !isNaN(Number(trimmed)));
  });

  // 콤마를 점으로 변경
  const content = filteredLines.join('\n').replace(/,/g, '.');

  // WEBVTT 헤더 추가
  return `WEBVTT\n\n${content}`;
};

// 파일 시스템 작업을 위한 함수 (Node.js 환경에서 사용)
const convertSrtFileToVtt = (srtPath, vttPath) => {
  try {
    // SRT 파일 읽기
    const srtContent = fs.readFileSync(srtPath, 'utf-8');

    // VTT로 변환
    const vttContent = srtToVtt(srtContent);

    // VTT 파일 저장
    fs.writeFileSync(vttPath, vttContent, 'utf-8');

    console.log('변환이 완료되었습니다.');
  } catch (error) {
    console.error('변환 중 오류가 발생했습니다:', error);
    throw error;
  }
};

// 폴더 내의 모든 자막 변환(하위 폴더 포함 recursive)
const convertSrtToVttInFolder = (srtDir, vttDir) => {
  const files = fs.readdirSync(srtDir);

  for (const file of files) {
    const srtPath = path.join(srtDir, file);
    const vttPath = path.join(vttDir, file.replace('.srt', '.vtt'));

    // 디렉토리인 경우 재귀적으로 처리
    if (fs.statSync(srtPath).isDirectory()) {
      // vtt 디렉토리가 없으면 생성
      if (!fs.existsSync(vttPath)) {
        fs.mkdirSync(vttPath, { recursive: true });
      }
      convertSrtToVttInFolder(srtPath, vttPath);
    }
    // srt 파일인 경우에만 변환
    else if (file.endsWith('.srt')) {
      convertSrtFileToVtt(srtPath, vttPath);
    }
  }
};

export {
  downloadSubtitles,
  downloadYoutube,
  downloadYoutubeAll,
  downloadPlaylist,
  listFilesInDir,
  listIdsInDir,
  convertSrtFileToVtt,
  convertSrtToVttInFolder,
  BASE_DOWN_DIR,
};

// // const videoId = 'fFIlEGnziMg';
// const videoId = 'zgGSy0seeYc';
// const response = await downloadYoutubeAll({ videoIds: videoId });
// console.table(response);

// // const playlistId = 'PLa67URrD8G_iSqfCFlw0683wH0TPFV5ys';
// // const playlistId = 'PL8vH7pXTpMi1byn3s2yj2vNw1gV4Qse1l';
// const playlistId = 'PL8vH7pXTpMi1byn3s2yj2vNw1gV4Qse1l';
// const playlistId = 'PL7jH19IHhOLNiUmS1s_4gKfWU43r8c-0p';
// await downloadPlaylist({ playlistId });

// const files = listFiles();
// console.log(files);

// const ids = listIdsInDir();
// console.log(ids);

// const srtPath =
//   'C:/JnJ-soft/Projects/internal/jnj-backend/downloads/[SEF2024] AI 어디까지 왔나, 앞으로 어떻게 될까ᅵ박태웅(녹서포럼 의장)_fFIlEGnziMg.srt';
// const vttPath =
//   'C:/JnJ-soft/Projects/internal/jnj-backend/downloads/[SEF2024] AI 어디까지 왔나, 앞으로 어떻게 될까ᅵ박태웅(녹서포럼 의장)_fFIlEGnziMg.vtt';

// convertSrtFileToVtt(srtPath, vttPath);

// const srtDir = 'C:/JnJ-soft/Projects/internal/jnj-backend/downloads';
// const vttDir = 'C:/JnJ-soft/Projects/internal/jnj-backend/downloads';
// convertSrtToVttInFolder(srtDir, vttDir);

// await downloadYoutubeAll({ videoIds: 'zcjTErUqvxM,kdt5J2bpchM' });
// await downloadPlaylist({ playlistId: 'PLOI8xpLfBsbvljNN-Dy37vBvZA33aa_6W' });
