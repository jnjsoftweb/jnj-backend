import fs from 'fs/promises';

async function extractClass101Data(jsonPath) {
    try {
        // JSON 파일 읽기
        const jsonData = JSON.parse(await fs.readFile(jsonPath, 'utf-8'));
        const data = jsonData.props.apolloState.data;
        
        // 결과 객체 초기화
        const result = {
            subCategories: [],
            users: [],
            products: []
        };
        
        // ancestorId 가져오기 (URL에서 추출)
        const ancestorId = jsonPath.match(/products_(.+?)\.json/)[1];
        
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
                    authorId: value.author.__ref.split(':')[1]
                };
                result.products.push(product);
                
                // 카테고리 정보 수집 (중복 제거를 위해 Set 사용)
                if (!result.subCategories.some(cat => cat.categoryId === product.categoryId)) {
                    const categoryRef = value.category.__ref;
                    const category = data[categoryRef];
                    if (category) {
                        result.subCategories.push({
                            ancestorId: ancestorId,
                            categoryId: product.categoryId,
                            title: category.title || '알 수 없음'
                        });
                    }
                }
            }
            
            // User 데이터 처리
            if (key.startsWith('User:')) {
                result.users.push({
                    userId: value._id,
                    displayName: value.displayName
                });
            }
        });

        // 결과 파일들 저장
        const basePath = jsonPath.replace('.json', '');
        await Promise.all([
            fs.writeFile(
                `${basePath}_subcategories.json`,
                JSON.stringify(result.subCategories, null, 2),
                'utf-8'
            ),
            fs.writeFile(
                `${basePath}_users.json`,
                JSON.stringify(result.users, null, 2),
                'utf-8'
            ),
            fs.writeFile(
                `${basePath}_products.json`,
                JSON.stringify(result.products, null, 2),
                'utf-8'
            )
        ]);

        console.log('데이터 추출 완료');
        return result;

    } catch (error) {
        console.error('에러 발생:', error);
        throw error;
    }
}

// 사용 예시
const jsonPath = 'C:/JnJ-soft/Projects/internal/jnj-backend/db/json/class101/nextData/products_604f1c9756c3676f1ed0030e.json';
extractClass101Data(jsonPath);


// import fs from 'fs/promises';

// async function extractCategories(jsonPath) {
//     try {
//         // JSON 파일 읽기
//         const jsonData = JSON.parse(await fs.readFile(jsonPath, 'utf-8'));
//         const categories = [];
        
//         // apolloState.data에서 카테고리 정보 추출
//         const data = jsonData.props.apolloState.data;
        
//         // depth가 0인 카테고리들을 찾아서 처리
//         Object.values(data).forEach(item => {
//             if (item.__typename === 'CategoryV2' && item.depth === 0) {
//                 const categoryId0 = item.id;
//                 const title0 = item.title;
                
//                 // 하위 카테고리 처리
//                 item.children.forEach(childRef => {
//                     const childId = childRef.__ref.split(':')[1];
//                     const childCategory = data[`CategoryV2:${childId}`];
                    
//                     categories.push({
//                         categoryid_0: categoryId0,
//                         title_0: title0,
//                         categoryid_1: childCategory.id,
//                         title_1: childCategory.title
//                     });
//                 });
//             }
//         });

//         // 결과 파일 저장
//         const outputPath = jsonPath.replace('.json', '_extracted.json');
//         await fs.writeFile(
//             outputPath,
//             JSON.stringify(categories, null, 2),
//             'utf-8'
//         );

//         console.log(`추출된 카테고리가 저장되었습니다: ${outputPath}`);
//         return categories;

//     } catch (error) {
//         console.error('에러 발생:', error);
//         throw error;
//     }
// }

// // 사용 예시
// const jsonPath = 'C:/JnJ-soft/Projects/internal/jnj-backend/db/json/class101/nextData/categories.json';
// extractCategories(jsonPath);