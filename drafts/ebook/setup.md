## EPUB 뷰어

### 필요한 패키지 설치:
```sh
npm install epub cheerio express
```

### 주요 기능:
1. EPUB 파일 파싱
2. 목차 표시
3. 챕터별 내용 표시
4. 이미지 지원
5. 웹 인터페이스 제공

### 사용 방법:

```js
import { EpubViewer } from './epub-viewer.js';

// EPUB 뷰어 생성 및 시작
const viewer = new EpubViewer('./books/my-book.epub');
viewer.start(3000);
```

이 코드는 웹 브라우저를 통해 EPUB 파일을 읽을 수 있는 간단한 뷰어를 제공합니다. 브라우저에서 http://localhost:3000에 접속하면 목차가 표시되고, 각 챕터를 클릭하여 내용을 읽을 수 있습니다.

### 추가로 구현할 수 있는 기능들:
1. 페이지 네비게이션
2. 글자 크기 조절
3. 테마 변경
4. 북마크 기능
5. 검색 기능
6. 주석 기능

## PDF 뷰어

### 필요한 패키지 설치:
```sh
npm install express pdf-lib
```

### 사용 방법:
```js
import { PdfViewer } from './pdf-viewer.js';

const viewer = new PdfViewer('./path/to/your/document.pdf');
viewer.start(3000);
```

### 주요 기능:
1. PDF 파일 로드 및 표시
2. 페이지 이동 (이전/다음)
3. 특정 페이지로 직접 이동
4. 줌 기능 (50% ~ 200%)
5. 웹 인터페이스 제공

### 추가로 구현할 수 있는 기능들:
1. 문서 검색
2. 북마크
3. 주석 달기
4. 페이지 썸네일 보기
5. PDF 다운로드
6. 페이지 회전
7. 다크 모드
8. 여러 페이지 동시 표시

이 코드는 웹 브라우저에서 PDF 파일을 볼 수 있는 기본적인 뷰어를 제공합니다. PDF.js 라이브러리를 사용하여 클라이언트 측에서 PDF를 렌더링합니다.


## HWP 뷰어

HWP 파일을 직접 읽고 변환하는 것은 복잡하기 때문에, 일반적으로 다음과 같은 방법들을 사용합니다:
1. HWP 파일을 PDF로 변환 후 표시
2. HWP Viewer ActiveX 컨트롤 사용 (Windows 환경)
3. 한글과컴퓨터의 공식 API 사용

여기서는 HWP를 PDF로 변환 후 표시하는 방법을 구현해보겠습니다:

### 사용방법

```js
import { HwpViewer } from './hwp-viewer.js';

const viewer = new HwpViewer('./path/to/your/document.hwp');
viewer.start(3000);
```

### 주의사항:
1. HWP 파일 변환을 위해서는 다음 중 하나의 방법이 필요합니다:
한글과컴퓨터의 공식 변환 도구
hwp2pdf와 같은 서드파티 변환 도구
LibreOffice의 변환 기능
상용 변환 API 서비스

### 변환 도구 설치 예시 (Ubuntu):

```sh
# LibreOffice 설치
sudo apt-get install libreoffice

# unoconv 설치 (LibreOffice 기반 변환 도구)
sudo apt-get install unoconv
```

3. 변환 명령어 예시 (LibreOffice 사용):

```sh
async convertToPdf() {
    return new Promise((resolve, reject) => {
        exec(`soffice --headless --convert-to pdf ${this.hwpPath} --outdir ${path.dirname(this.pdfPath)}`, (error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(this.pdfPath);
        });
    });
}
```

### 추가 기능 제안:
1. 변환 진행 상태 표시
2. 변환 실패 시 대체 방법 제공
3. 변환된 PDF 캐시 관리
4. 미리보기 이미지 생성
5. 다중 페이지 동시 변환
6. 변환 옵션 설정 (해상도, 품질 등)

### 실제 구현 시 고려사항:
1. HWP 파일 형식의 특수성으로 인한 변환 품질 문제
2. 한글 폰트 지원
3. 변환 시간 최적화
4. 보안 문제 (파일 접근 권한 등)
5. 서버 리소스 관리

이 구현은 기본적인 예시이며, 실제 사용을 위해서는 적절한 변환 도구와 추가적인 에러 처리가 필요합니다.


### COM / API 사용

```js
// COM API 사용 (Windows)
const viewer = new HwpViewer();
try {
    await viewer.openDocument('example.hwp');
    await viewer.saveToPdf('example.pdf');
} finally {
    viewer.close();
}

// 웹 API 사용
const webViewer = new HwpWebViewer('YOUR_API_KEY', 'YOUR_SECRET_KEY');
const pdfUrl = await webViewer.convertToPdf('example.hwp');
const docInfo = await webViewer.getDocumentInfo('example.hwp');
```

### 주의사항:
1. COM API 사용 시:
- Windows 환경 필수
- 한/글 프로그램 설치 필요
- 서버에서 실행 시 서비스 계정 권한 필요
2. 웹 API 사용 시:
- API 키와 비용 발생
- 인터넷 연결 필요
- 문서 업로드/다운로드 시간 고려
- 보안 및 개인정보 처리 주의

### API 신청 방법:
1. 한/글 문서 서비스 포털 (https://docs.hancom.com) 가입
2. API 키 발급 신청
3. 사용량 및 과금 정책 확인
4. 개발 가이드 문서 참조

### 추가 기능:
1. 문서 미리보기
2. 텍스트 추출
3. 이미지 추출
4. 양식 필드 처리
5. 주석 처리
6. 변환 옵션 설정

이러한 API를 사용하면 보다 안정적이고 고품질의 HWP 문서 처리가 가능합니다.