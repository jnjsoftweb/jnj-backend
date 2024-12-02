import fs from 'fs';
import { By } from 'selenium-webdriver';
import { Chrome } from 'jnj-lib-web';
import * as cheerio from 'cheerio';
import { JSDOM } from 'jsdom';
import {
  YOUTUBE_DEFAULT_USER_ID,
  YOUTUBE_DEFAULT_USER_EMAIL,
  DEFAULT_USER_DATA_DIR,
} from '../../env.js';
import { saveFile, loadFile, saveJson, loadJson } from 'jnj-lib-base';

// const YOUTUBE_DEFAULT_USER_EMAIL = "bigwhitekmc@gmail.com"

const URL_CATEGORIES = 'https://class101.net/ko/categories';
const CLASS101_JSON_ROOT =
  'C:/JnJ-soft/Projects/internal/jnj-backend/db/json/class101';
const CLASS101_HTML_ROOT =
  'C:/JnJ-soft/Projects/internal/jnj-backend/db/html/class101';
const CATEGORIES_JSON_PATH = `${CLASS101_JSON_ROOT}/categories.json`;
const PRODUCTS_JSON_PATH = `${CLASS101_JSON_ROOT}/products.json`;
// const CATEGORIES_HTML_PATH = './test.html';

// * 정보
const flattenedProducts = loadJson(
  `${CLASS101_JSON_ROOT}/flattened-products.json`
);

// ** Sub Functions
// * 페이지 이동 함수
const goToUrl = async (
  url,
  {
    email = YOUTUBE_DEFAULT_USER_EMAIL,
    userDataDir = DEFAULT_USER_DATA_DIR,
    headless = false,
    scroll = false,
  } = {} // 빈 객체를 기본값으로 설정
) => {
  const chrome = new Chrome({
    headless: headless ? 'new' : false,
    email,
    userDataDir,
    arguments: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--window-size=1920,1080',
    ],
  });

  try {
    await chrome.goto(url);
    if (scroll) await chrome.getFullSize();
    return chrome;
  } catch (error) {
    console.error('Chrome 초기화 중 오류 발생:', error);
    await chrome.close();
    throw error;
  }
};

const parseNextData = (html) => {
  try {
    // cheerio로 HTML 파싱
    const $ = cheerio.load(html);
    // __NEXT_DATA__ 스크립트 찾기
    const nextDataScript = $('#__NEXT_DATA__');

    if (!nextDataScript.length) {
      throw new Error('__NEXT_DATA__ 스크립트를 찾을 수 없습니다.');
    }

    // JSON 파싱
    return JSON.parse(nextDataScript.html());
  } catch (error) {
    console.error('에러 발생:', error);
    throw error;
  }
};

const saveNextData = (name, html) => {
  const json = parseNextData(html);
  saveJson(`${CLASS101_JSON_ROOT}/${name}.json`, json);
  return json;
};

// const addJsonData = (path, data) => {
//   saveJson(path, [...loadJson(path), ...data]);
// }

const jsonFromNextData = async (nextData) => {
  const data = nextData.props.apolloState.data;
  const data_ = [];

  Object.values(data).forEach((item) => {
    if (item.__typename === 'CategoryV2' && item.depth === 0) {
      const categoryId0 = item.id;
      const title0 = item.title;

      // 하위 카테고리 처리
      item.children.forEach((childRef) => {
        const childId = childRef.__ref.split(':')[1];
        const childCategory = data[`CategoryV2:${childId}`];

        data_.push({
          categoryId0,
          title0,
          categoryId: childCategory.id,
          title: childCategory.title,
        });
      });
    }
  });

  return data_;
};

const existFile = (path) => {
  return fs.existsSync(path);
};

// ** Main Functions

// * STEP 1: 메인 카테고리 저장(NextData)
const saveNextDataCategories = async (
  url = URL_CATEGORIES,
  headless = false
) => {
  const chrome = await goToUrl(url, { headless });
  saveNextData('nextData/categories', await chrome.driver.getPageSource());
  await chrome.close();
  // return chrome;
};

// * STEP 2: 메인 카테고리 저장
const saveMainCategories = async () => {
  const nextData = loadJson(`${CLASS101_JSON_ROOT}/nextData/categories.json`);
  const json = await jsonFromNextData(nextData);
  saveJson(`${CLASS101_JSON_ROOT}/categories.json`, json);
  return json;
};

// * 부카테고리
async function extractSubCategories(nextData, ancestorId) {
  const data = nextData.props.apolloState.data;
  let subCategories = [];

  // 데이터 추출
  Object.entries(data).forEach(([key, value]) => {
    if (key.startsWith('CategoryV2:')) {
      const categoryId = value.id;
      const title = value.title;

      subCategories.push({
        ancestorId,
        categoryId,
        title,
      });
    }
  });
  return subCategories.length > 1 ? subCategories.slice(1) : subCategories; // 첫번째 요소(전체) 제거
}

const fetchSubCategories = async (categoryId) => {
  const url = `https://class101.net/ko/categories/${categoryId}`;
  const chrome = await goToUrl(url);
  // const nextData = parseNextData(await chrome.driver.getPageSource());
  const nextData = saveNextData(
    `nextData/categories/${categoryId}`,
    await chrome.driver.getPageSource()
  );
  const subCategories = await extractSubCategories(nextData, categoryId);

  await chrome.close();
  return subCategories;
};

const saveAllSubCategories = async () => {
  const categories = loadJson(`${CLASS101_JSON_ROOT}/categories.json`);
  let subCategories = [];
  // let chrome;

  for (const category of categories) {
    if (
      existFile(
        `${CLASS101_JSON_ROOT}/nextData/categories/${category.categoryId}.json`
      )
    ) {
      continue;
    }
    const url = `https://class101.net/ko/categories/${category.categoryId}`;
    const chrome = await goToUrl(url);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const nextData = saveNextData(
      `nextData/categories/${category.categoryId}`,
      await chrome.driver.getPageSource()
    );
    console.log(`subCategories: ${category.title}`);
    subCategories = [
      ...subCategories,
      ...(await extractSubCategories(nextData, category.categoryId)),
    ];
  }

  // await chrome.close();
  saveJson(`${CLASS101_JSON_ROOT}/subCategories.json`, subCategories);
  return subCategories;
};

const fetchCategoryProducts = async (categoryId, cursor = null) => {
  const response = await fetch(
    'https://cdn-production-gateway.class101.net/graphql',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operationName: 'CategoryProductsV3OnCategoryProductList',
        variables: {
          filter: {
            purchaseOptions: ['Lifetime', 'Rental', 'Subscription'],
          },
          categoryId,
          first: 1000,
          isLoggedIn: true,
          sort: 'Popular',
          originalLanguages: [],
          ...(cursor && { after: cursor }),
        },
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash:
              'de9123f7372649c2874c9939436d6c5417a48b55af12045b7bdaea7de0a079cc',
          },
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

const saveAllProducts = async () => {
  const subCategories = loadJson(`${CLASS101_JSON_ROOT}/subCategories.json`);
  let products = [];

  for (const subCategory of subCategories) {
    const response = await fetchCategoryProducts(subCategory.categoryId);
    if (
      !response ||
      !response.data ||
      !response.data.categoryProductsV3 ||
      response.data.categoryProductsV3.edges.length === 0
    ) {
      console.log(
        `No products in ${subCategory.title} ${subCategory.categoryId}`
      );
      continue;
    }

    response.data.categoryProductsV3.edges.map((edge) => {
      const node = edge.node;
      const [
        productId,
        title,
        imageId,
        klassId,
        likedCount,
        firestoreId,
        categoryId,
        categoryTitle,
        authorId,
        authorName,
      ] = [
        node._id,
        node.title,
        node.coverImageUrl.split('/').pop().split('.')[0],
        node.klassId,
        node.likedCount,
        node.firestoreId,
        node.category.id,
        node.category.title,
        node.author._id,
        node.author.displayName,
      ];
      const product = {
        productId,
        title,
        imageId,
        klassId,
        likedCount,
        firestoreId,
        categoryId,
        categoryTitle,
        authorId,
        authorName,
      };
      products.push(product);
      saveJson(`${CLASS101_JSON_ROOT}/products.json`, products);
    });
  }

  // saveJson(`${CLASS101_JSON_ROOT}/products.json`, products);
  return products;
};

// // ** Main
// await saveNextDataCategories();

// await saveMainCategories();

// await saveAllSubCategories();

await saveAllProducts();

// console.log(
//   existFile(
//     `${CLASS101_JSON_ROOT}/nextData/categories_62206086d39299379ee5b83b.json`
//   )
// );
