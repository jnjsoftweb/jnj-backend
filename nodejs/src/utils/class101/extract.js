import { saveFile, loadFile, saveJson, loadJson } from 'jnj-lib-base';

const URL_CATEGORIES = 'https://class101.net/ko/categories';
const CLASS101_JSON_ROOT =
  'C:/JnJ-soft/Projects/internal/jnj-backend/db/json/class101';
const CLASS101_HTML_ROOT =
  'C:/JnJ-soft/Projects/internal/jnj-backend/db/html/class101';
const CATEGORIES_JSON_PATH = `${CLASS101_JSON_ROOT}/categories.json`;
const PRODUCTS_JSON_PATH = `${CLASS101_JSON_ROOT}/products.json`;

async function extractClass101Data(nextData, ancestorId) {
  try {
    // JSON 파일 읽기
    const data = nextData.props.apolloState.data;
    const data_ = [];

    // 결과 객체 초기화
    const result = {
      subCategories: [],
      authors: [],
      products: [],
    };

    // 데이터 추출
    Object.entries(data).forEach(([key, value]) => {
      // ProductV3 데이터 처리
      if (key.startsWith('ProductV3:')) {
        const product = {
          categoryId: value.category.__ref.split(':')[1],
          productId: value._id,
          title: value.title,
          imageId: value.coverImageUrl.split('/').pop().split('.')[0],
          klassId: value.klassId,
          likedCount: value.likedCount,
          authorId: value.author.__ref.split(':')[1],
        };
        result.products.push(product);

        // 카테고리 정보 수집 (중복 제거를 위해 Set 사용)
        if (
          !result.subCategories.some(
            (cat) => cat.categoryId === product.categoryId
          )
        ) {
          const categoryRef = value.category.__ref;
          const category = data[categoryRef];
          if (category) {
            result.subCategories.push({
              ancestorId: ancestorId,
              categoryId: product.categoryId,
              title: category.title || '알 수 없음',
            });
          }
        }
      }

      // Author(User) 데이터 처리
      if (key.startsWith('User:')) {
        result.authors.push({
          userId: value._id,
          displayName: value.displayName,
        });
      }
    });

    console.log(result.subCategories);
    console.log(result.authors);
    console.log(result.products);

    console.log('데이터 추출 완료');
    return result;
  } catch (error) {
    console.error('에러 발생:', error);
    throw error;
  }
}

const saveProducts = (categoryId) => {
  const jsonPath = `${CLASS101_JSON_ROOT}/nextData/products_${categoryId}.json`;
  const nextData = loadJson(jsonPath);
  // const ancestorId = jsonPath.match(/products_(.+?)\.json/)[1];
  const result = extractClass101Data(nextData, categoryId);
  saveJson(
    `${CLASS101_JSON_ROOT}/products_${categoryId}.json`,
    result.products
  );
  saveJson(
    `${CLASS101_JSON_ROOT}/products_${categoryId}.json`,
    result.products
  );
  saveJson(`${CLASS101_JSON_ROOT}/authors.json`, result.authors);
};

// 사용 예시
// const jsonPath = 'C:/JnJ-soft/Projects/internal/jnj-backend/db/json/class101/nextData/products_604f1c9756c3676f1ed0030e.json';
const jsonPath = `${CLASS101_JSON_ROOT}/nextData/products_604f1c9756c3676f1ed0030e.json`;
const nextData = loadJson(jsonPath);
const ancestorId = jsonPath.match(/products_(.+?)\.json/)[1];
extractClass101Data(nextData, ancestorId);
