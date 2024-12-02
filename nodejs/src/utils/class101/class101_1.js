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

const URL_CATEGORIES = 'https://class101.net/ko/categories';
const CLASS101_JSON_ROOT =
  'C:/JnJ-soft/Projects/internal/jnj-backend/db/json/class101';
const CLASS101_HTML_ROOT =
  'C:/JnJ-soft/Projects/internal/jnj-backend/db/html/class101';
const CATEGORIES_JSON_PATH = `${CLASS101_JSON_ROOT}/categories.json`;
const PRODUCTS_JSON_PATH = `${CLASS101_JSON_ROOT}/products.json`;
// const CATEGORIES_HTML_PATH = './test.html';

// * 정보 
const flattenedProducts = loadJson(`${CLASS101_JSON_ROOT}/flattened-products.json`);

// * 페이지 이동 함수
const goToUrl = async ({
  url,
  email = YOUTUBE_DEFAULT_USER_EMAIL,
  userDataDir = DEFAULT_USER_DATA_DIR,
  headless = true,
  scroll = false,
}) => {
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

const extractMainCatetories = (html) => {
  const dom = new JSDOM(html, {
    // CSS 파싱 비활성화
    features: {
      QuerySelector: true,
      ProcessExternalResources: false,
    },
  });
  const doc = dom.window.document;

  const categories = [];

  // 모든 카테고리 링크 찾기
  const categoryLinks = doc.querySelectorAll(
    '#__next > main > div > div.css-zmnfx9 > div > div > div > div > div > a'
  );

  categoryLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href || !href.includes('/categories/')) return;

    const titleElement = link.querySelector('div > h3');
    if (!titleElement) return;

    const title = titleElement.textContent.trim();
    const categoryId = href.split('/').pop();

    categories.push({ title, categoryId });
  });

  return categories;
};

const extractSubCatetories = (html) => {
  const dom = new JSDOM(html, {
    // CSS 파싱 비활성화
    features: {
      QuerySelector: true,
      ProcessExternalResources: false,
    },
  });
  const doc = dom.window.document;
  const categories = [];

  // 서브카테고리 링크 찾기
  const subCategoryDivs = doc.querySelectorAll('.css-1d944kd');

  subCategoryDivs.forEach((div) => {
    const link = div.querySelector('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || !href.includes('/categories/')) return;

    const titleElement = div.querySelector('.css-1h8wj8h');
    if (!titleElement) return;

    const title = titleElement.textContent.trim();
    const categoryId = href.split('/').pop();

    categories.push({ title, categoryId });
  });

  return categories;
};

const getMainCategoryHtml = async (url = URL_CATEGORIES, headless = false) => {
  const chrome = await goToUrl({ url, headless });
  const html = await chrome.driver.getPageSource();
  await chrome.close();
  return html;
};

const getSubCategoryHtml = async (categoryId, scroll = false) => {
  const url = `${URL_CATEGORIES}/${categoryId}`;
  const chrome = await goToUrl({ url, headless: false, scroll });
  const html = await chrome.driver.getPageSource();
  await chrome.close();
  return html;
};

const getMainCategories = async () => {
  return extractMainCatetories(await getMainCategoryHtml());
};

// * 전체 카테고리
const getCategories = async () => {
  const mainCategories = await getMainCategories();
  // console.log('메인 카테고리:', mainCategories);

  for (let mc of mainCategories) {
    // console.log(`서브카테고리 가져오기: ${mc.title}`);
    const html = await getSubCategoryHtml(mc.categoryId);
    const subCategories = extractSubCatetories(html);
    // console.table(subCategories);
    mc.subcategories = subCategories;
    // console.log(`- 서브카테고리 수: ${subCategories.length}`);
  }

  return mainCategories;
};

const extractProducts = (html) => {
  const dom = new JSDOM(html, {
    features: {
      QuerySelector: true,
      ProcessExternalResources: false,
    },
  });
  const doc = dom.window.document;

  const products = [];

  // 상품 목록 찾기
  const productItems = doc.querySelectorAll(
    'div[data-testid="content-area"] > div > div > div > ul > li'
  );

  productItems.forEach((item) => {
    try {
      const link = item.querySelector('div > div > a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || !href.includes('/products/')) return;

      const productId = href.split('/').pop();

      // 이미지 찾기
      const imageElement = link.querySelector('img');
      const image = imageElement ? imageElement.getAttribute('src') : '';

      // 제목 찾기 (첫 번째 span)
      const titleElement = link.querySelector('span[data-testid="body"]');
      const title = titleElement ? titleElement.textContent.trim() : '';

      // 강사명 찾기 (두 번째 span)
      const spans = link.querySelectorAll('span[data-testid="body"]');
      const instructor =
        spans.length > 1 ? spans[1].textContent.split('|').pop().trim() : '';

      // 개별구매 여부 확인 (link의 부모의 형제 div 요소에서)
      const purchaseDiv = link.parentElement.nextElementSibling;
      const isIndividual = purchaseDiv
        ? purchaseDiv.textContent.includes('개별구매')
        : false;

      if (productId && title) {
        products.push({
          productId,
          image,
          title,
          instructor,
          isIndividual,
        });
      }
    } catch (error) {
      console.error('상품 정보 추출 중 오류:', error);
    }
  });

  return products;
};

const getProducts = async (categoryId) => {
  try {
    const html = loadFile(`./${categoryId}.html`);
    return extractProducts(html);
  } catch (error) {
    console.error('상품 정보 추출 중 오류 발생:', error);
    throw error;
  }
};

const _getAllProductsByCategories = async (categories) => {
  const results = [];

  for (const category of categories) {
    // const categoryWithProducts = { ...category, subcategories: [] };

    for (const subcategory of category.subcategories) {
      try {
        console.log(
          `카테고리: ${subcategory.title} (${subcategory.categoryId})`
        );

        const chrome = await goToUrl({
          url: `${URL_CATEGORIES}/${subcategory.categoryId}`,
          headless: false,
          scroll: true,
        });
        const html = await chrome.driver.getPageSource();
        await chrome.close();
        // saveFile(htmlPath, html, { encoding: 'utf-8' });

        // 연속 요청 방지를 위한 대기
        await new Promise((resolve) => setTimeout(resolve, 5000));

        const products = extractProducts(html);
        subcategory.products = products;
        console.log(`- 상품 수: ${products.length}`);

        // categoryWithProducts.subcategories.push(subcategory);
      } catch (error) {
        console.error(`${subcategory.categoryId} 처리 중 오류:`, error);
      }
    }

    // results.push(categoryWithProducts);
  }

  return categories;
};

const getAllProductsByCategories = async () => {
  try {
    const categories = loadJson(CATEGORIES_JSON_PATH);
    console.log(`카테고리 수: ${categories.length}`);

    const results = await _getAllProductsByCategories(categories);

    // 결과 저장
    saveJson(PRODUCTS_JSON_PATH, results);
    console.log('모든 상품 정보 저장 완료');

    return results;
  } catch (error) {
    console.error('전체 상품 정보 추출 중 오류 발생:', error);
    throw error;
  }
};

// image: 'https://cdn.class101.net/images/f149d91f-8f52-48b5-a116-6a7dc8ebd7b9'
const imageIdFromUrl = (url) => {
  return url.includes('/') ? url.split('/')[4] : '';
};

const flattenProducts = (products) => {
  const flattened = [];
  for (const product of products) {
    product.subcategories.forEach((subcategory) => {
      subcategory.products.forEach((product) => {
        product.categoryId = subcategory.categoryId;
        product.imageId = imageIdFromUrl(product.image);
        delete product.image;
        flattened.push(product);
      });
    });
  }
  saveJson(`${CLASS101_JSON_ROOT}/flattened-products.json`, flattened);
  return flattened;
};

// const findProductByImageId = (imageId) => {
//   const flattenedProducts = loadJson(`${CLASS101_JSON_ROOT}/flattened-products.json`);
//   return flattenedProducts.find(p => p.imageId = imageId);
// };

const extractMyClasses = (html) => {
  const dom = new JSDOM(html, {
    // CSS 파싱 비활성화
    features: {
      QuerySelector: true,
      ProcessExternalResources: false,
    },
  });
  const doc = dom.window.document;

  const classes = [];

  // 모든 카테고리 링크 찾기
  // const imgs = doc.querySelectorAll('ul[data-testid="grid-list"] img');
  const imgs = doc.querySelectorAll('img[data-testid="image-thumbnail-content"]')
  // /2048xauto.webp
  imgs.forEach((img) => {
    let image = img.getAttribute('src') ?? '';
    const imageId = imageIdFromUrl(image);
    const p = flattenedProducts.find(p => p.imageId == imageId)
    // const productId = p ? p.productId : ''
    if (p) {
      // console.log(imageId);
      classes.push(p.productId);
      // classes.push({ imageId, productId: p.productId });
    }
    // console.log(productId);
    // classes.push({ imageId, productId: p.productId });
  });

  // console.log(flattenedProducts)
  saveJson(`${CLASS101_JSON_ROOT}/myclasses.json`, classes);
  return classes;
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
}

const saveNextData = (name, html) => {
  saveJson(`${CLASS101_JSON_ROOT}/${name}.json`, parseNextData(html));
}


// ** Account
// 이어보기
// https://class101.net/ko/my-classes
// https://class101.net/ko/my-classes#continue-watching

// // C:\JnJ-soft\Projects\internal\jnj-backend\db\html\class101\myclass.html
const html = loadFile(`${CLASS101_HTML_ROOT}/myclass.html`);
const classes = await extractMyClasses(html);
console.log(classes);


// const flattenedProducts = flattenProducts(loadJson(PRODUCTS_JSON_PATH));
// console.log(flattenedProducts);

// 구매 목록
// https://class101.net/ko/my-classes#purchased-list

// 내 보관함
// https://class101.net/ko/my-classes#my-library

// ** web => json
// * getCategories
// await getCategories();

// await getAllProductsByCategories();

// 실행
// getAllProductsByCategories().catch(console.error);

// const products = extractProducts(loadFile('./6114891dfe1ca7f7b31b4a23.html'));
// console.log(products);
// saveJson('./test1.json', products);

// image: https://cdn.class101.net/images/d65b860f-f84a-47c2-bb55-63836e9d0e34/320xauto.webp
// src: {image}/320xauto.webp
