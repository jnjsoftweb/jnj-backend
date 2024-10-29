# PlaylistItems: list

bookmark_border

재생목록 항목 리소스의 컬렉션을 반환합니다.

**할당량 영향:** 이 메서드를 호출하면 1단위의 [할당량 비용](https://developers.google.com/youtube/v3/getting-started?hl=ko#quota)이 적용됩니다.

## 요청

### HTTP 요청

GET https://www.googleapis.com/youtube/v3/playlistItems

### 매개변수

다음 표에는 이 쿼리가 지원하는 매개변수가 나와 있습니다. 나열된 모든 매개변수는 쿼리 매개변수입니다.

|매개변수|   |
|---|---|
|**필수 매개변수**|   |   |
|`part`|`string`  <br>`**part**` 매개변수는 API 응답에 포함될 하나 이상의 `playlistItem` 리소스 속성의 쉼표로 구분된 목록을 지정합니다.  <br>  <br>다음 목록에는 매개변수 값에 포함할 수 있는 `part` 이름이 나와 있습니다.  <br><br>- `contentDetails`<br>- `id`<br>- `snippet`<br>- `status`|
|`playlistId`|`string`  <br>`**playlistId**` 매개변수는 검색할 재생목록의 고유 ID를 지정합니다.|
|**선택적 매개변수**|   |   |
|`id`|`string`  <br>`**id**` 매개변수는 검색되는 리소스에 대한 YouTube 재생목록 항목 ID의 쉼표로 구분된 목록을 지정합니다.|
|`maxResults`|`unsigned integer`  <br>`**maxResults**` 매개변수는 결과 집합에 반환해야 하는 최대 항목 수를 지정합니다. 사용 가능한 값: `0`~`50` 기본값은 `5`입니다.|
|`onBehalfOfContentOwner`|`string`  <br>이 매개변수는 제대로 [승인된 요청](https://developers.google.com/youtube/v3/guides/authentication?hl=ko)에서만 사용할 수 있습니다. **참고:** 이 매개변수는 YouTube 콘텐츠 파트너 전용입니다.|
|`pageToken`|`string`  <br>`**pageToken**` 매개변수는 반환해야 하는 결과 집합의 특정 페이지를 식별합니다. API 응답에서 `nextPageToken` 및 `prevPageToken` 속성은 검색할 수 있는 다른 페이지를 식별합니다.|
|`videoId`|`string`  <br>`**videoId**` 매개변수는 재생목록에서 특정 동영상의 리소스를 검색하도록 API에 지시합니다.|

### 요청 본문

이 메소드를 호출할 때 요청 본문을 제공하지 마세요.

## 응답

요청에 성공할 경우 이 메소드는 다음과 같은 구조의 응답 본문을 반환합니다.

{  "kind": "youtube#playlistItemListResponse",  "etag": etag,  "nextPageToken": string,  "prevPageToken": string,  "pageInfo": {    "totalResults": integer,    "resultsPerPage": integer  },  "items": [    playlistItem Resource  ]  
}

### 속성

다음 표는 이 리소스에 표시되는 속성을 정의합니다.

|속성|   |
|---|---|
|`kind`|`string`  <br>API 리소스 유형을 식별합니다. 값은 `youtube#playlistItemListResponse`입니다.|
|`etag`|`etag`  <br>이 리소스의 Etag입니다.|
|`nextPageToken`|`string`  <br>`pageToken` 매개변수의 값으로 사용하여 결과 집합의 다음 페이지를 검색할 수 있는 토큰입니다.|
|`prevPageToken`|`string`  <br>`pageToken` 매개변수의 값으로 사용하여 결과 집합의 이전 페이지를 검색할 수 있는 토큰입니다.|
|`pageInfo`|`object`  <br>`pageInfo` 객체는 결과 집합의 페이지 정보를 요약합니다.|
|`pageInfo.totalResults`|`integer`  <br>결과 집합의 총 결과 수입니다.|
|`pageInfo.resultsPerPage`|`integer`  <br>API 응답에 포함된 결과 수입니다.|
|`items[]`|`list`  <br>요청 기준과 일치하는 재생목록 항목 목록입니다.|