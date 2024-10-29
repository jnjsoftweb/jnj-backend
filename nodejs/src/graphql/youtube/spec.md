# Channels: list
> https://developers.google.com/youtube/v3/docs/channels/list?hl=ko

bookmark_border

채널 리소스의 컬렉션을 반환합니다.

**할당량 영향:** 이 메서드를 호출하면 1단위의 [할당량 비용](https://developers.google.com/youtube/v3/getting-started?hl=ko#quota)이 적용됩니다.

## 요청

### HTTP 요청

GET https://www.googleapis.com/youtube/v3/channels

### 매개변수

다음 표에는 이 쿼리가 지원하는 매개변수가 나와 있습니다. 나열된 모든 매개변수는 쿼리 매개변수입니다.

|매개변수|   |
|---|---|
|**필수 매개변수**|   |   |
|`part`|`string`  <br>`**part**` 매개변수는 API 응답에 포함될 하나 이상의 `channel` 리소스 속성의 쉼표로 구분된 목록을 지정합니다.  <br>  <br>다음 목록에는 매개변수 값에 포함할 수 있는 `part` 이름이 나와 있습니다.  <br><br>- `auditDetails`<br>- `brandingSettings`<br>- `contentDetails`<br>- `contentOwnerDetails`<br>- `id`<br>- `localizations`<br>- `snippet`<br>- `statistics`<br>- `status`<br>- `topicDetails`|
|**필터(다음 매개변수 중 하나만 지정)**|   |   |
|`categoryId`|`string`  <br>`**categoryId**` 매개변수는 지정된 가이드 카테고리 ID와 연결된 채널을 반환하도록 API에 지시합니다.|
|`forUsername`|`string`  <br>`**forUsername**` 매개변수는 지정된 YouTube 사용자 이름과 연결된 채널을 반환하도록 API에 지시합니다.|
|`id`|`string`  <br>`**id**` 매개변수는 검색되는 리소스에 대한 YouTube 채널 ID의 쉼표로 구분된 목록을 지정합니다.|
|`managedByMe`|`boolean`  <br>`**managedByMe**` 매개변수는 요청을 인증하는 사용자가 관리하는 채널만 반환하도록 API에 지시합니다.|
|`mine`|`boolean`  <br>`**mine**` 매개변수는 요청을 인증하는 사용자의 채널 ID를 반환하도록 API에 지시합니다.|
|**선택적 매개변수**|   |   |
|`hl`|`string`  <br>`**hl**` 매개변수는 [YouTube 웹사이트에서 지원하는 특정 애플리케이션 언어](https://developers.google.com/youtube/v3/docs/i18nLanguages?hl=ko)에 대해 현지화된 리소스 메타데이터를 검색하도록 API에 지시합니다.|
|`maxResults`|`unsigned integer`  <br>`**maxResults**` 매개변수는 결과 집합에 반환해야 하는 최대 항목 수를 지정합니다. 사용 가능한 값: `0`~`50` 기본값은 `5`입니다.|
|`onBehalfOfContentOwner`|`string`  <br>이 매개변수는 제대로 [승인된 요청](https://developers.google.com/youtube/v3/guides/authentication?hl=ko)에서만 사용할 수 있습니다. **참고:** 이 매개변수는 YouTube 콘텐츠 파트너 전용입니다.|
|`pageToken`|`string`  <br>`**pageToken**` 매개변수는 반환해야 하는 결과 집합의 특정 페이지를 식별합니다. API 응답에서 `nextPageToken` 및 `prevPageToken` 속성은 검색할 수 있는 다른 페이지를 식별합니다.|

### 요청 본문

이 메소드를 호출할 때 요청 본문을 제공하지 마세요.

## 응답

요청에 성공할 경우 이 메소드는 다음과 같은 구조의 응답 본문을 반환합니다.

{  "kind": "youtube#channelListResponse",  "etag": etag,  "nextPageToken": string,  "prevPageToken": string,  "pageInfo": {    "totalResults": integer,    "resultsPerPage": integer  },  "items": [    channel Resource  ]  
}

### 속성

다음 표는 이 리소스에 표시되는 속성을 정의합니다.

|속성|   |
|---|---|
|`kind`|`string`  <br>API 리소스 유형을 식별합니다. 값은 `youtube#channelListResponse`입니다.|
|`etag`|`etag`  <br>이 리소스의 Etag입니다.|
|`nextPageToken`|`string`  <br>`pageToken` 매개변수의 값으로 사용하여 결과 집합의 다음 페이지를 검색할 수 있는 토큰입니다.|
|`prevPageToken`|`string`  <br>`pageToken` 매개변수의 값으로 사용하여 결과 집합의 이전 페이지를 검색할 수 있는 토큰입니다.|
|`pageInfo`|`object`  <br>`pageInfo` 객체는 결과 집합의 페이지 정보를 요약합니다.|
|`pageInfo.totalResults`|`integer`  <br>결과 집합의 총 결과 수입니다.|
|`pageInfo.resultsPerPage`|`integer`  <br>API 응답에 포함된 결과 수입니다.|
|`items[]`|`list`  <br>요청 기준과 일치하는 채널 목록입니다.|

## 오류

다음 표에서는 이 메서드에 대한 호출에 대한 응답으로 API가 반환할 수 있는 오류 메시지를 확인합니다. 자세한 내용은 [오류 메시지](https://developers.google.com/youtube/v3/docs/errors?hl=ko) 설명서를 참조하세요.

|오류 유형|오류 세부정보|설명|
|---|---|---|
|`badRequest (400)`|`invalidChannelId`|요청에 지정된 채널 ID가 유효하지 않습니다.|
|`forbidden (403)`|`channelClosed`|요청한 채널이 닫혔습니다.|
|`notFound (404)`|`channelNotFound`|요청한 채널을 찾을 수 없습니다.|


# Playlists: list

bookmark_border

재생목록 리소스의 컬렉션을 반환합니다.

**할당량 영향:** 이 메서드를 호출하면 1단위의 [할당량 비용](https://developers.google.com/youtube/v3/getting-started?hl=ko#quota)이 적용됩니다.

## 요청

### HTTP 요청

GET https://www.googleapis.com/youtube/v3/playlists

### 매개변수

다음 표에는 이 쿼리가 지원하는 매개변수가 나와 있습니다. 나열된 모든 매개변수는 쿼리 매개변수입니다.

|매개변수|   |
|---|---|
|**필수 매개변수**|   |   |
|`part`|`string`  <br>`**part**` 매개변수는 API 응답에 포함될 하나 이상의 `playlist` 리소스 속성의 쉼표로 구분된 목록을 지정합니다.  <br>  <br>다음 목록에는 매개변수 값에 포함할 수 있는 `part` 이름이 나와 있습니다.  <br><br>- `contentDetails`<br>- `id`<br>- `localizations`<br>- `player`<br>- `snippet`<br>- `status`|
|**필터(다음 매개변수 중 하나만 지정)**|   |   |
|`channelId`|`string`  <br>`**channelId**` 매개변수는 지정된 채널 ID와 연결된 재생목록을 반환하도록 API에 지시합니다.|
|`id`|`string`  <br>`**id**` 매개변수는 검색되는 리소스에 대한 YouTube 재생목록 ID의 쉼표로 구분된 목록을 지정합니다.|
|`mine`|`boolean`  <br>`**mine**` 매개변수는 요청을 인증하는 사용자의 재생목록을 반환하도록 API에 지시합니다.|
|**선택적 매개변수**|   |   |
|`hl`|`string`  <br>`**hl**` 매개변수는 [YouTube 웹사이트에서 지원하는 특정 애플리케이션 언어](https://developers.google.com/youtube/v3/docs/i18nLanguages?hl=ko)에 대해 현지화된 리소스 메타데이터를 검색하도록 API에 지시합니다.|
|`maxResults`|`unsigned integer`  <br>`**maxResults**` 매개변수는 결과 집합에 반환해야 하는 최대 항목 수를 지정합니다. 사용 가능한 값: `0`~`50` 기본값은 `5`입니다.|
|`onBehalfOfContentOwner`|`string`  <br>이 매개변수는 제대로 [승인된 요청](https://developers.google.com/youtube/v3/guides/authentication?hl=ko)에서만 사용할 수 있습니다. **참고:** 이 매개변수는 YouTube 콘텐츠 파트너 전용입니다.|
|`onBehalfOfContentOwnerChannel`|`string`  <br>이 매개변수는 제대로 [승인된 요청](https://developers.google.com/youtube/v3/guides/authentication?hl=ko)에서만 사용할 수 있습니다. **참고:** 이 매개변수는 YouTube 콘텐츠 파트너 전용입니다.|
|`pageToken`|`string`  <br>`**pageToken**` 매개변수는 반환해야 하는 결과 집합의 특정 페이지를 식별합니다. API 응답에서 `nextPageToken` 및 `prevPageToken` 속성은 검색할 수 있는 다른 페이지를 식별합니다.|

### 요청 본문

이 메소드를 호출할 때 요청 본문을 제공하지 마세요.

## 응답

요청에 성공할 경우 이 메소드는 다음과 같은 구조의 응답 본문을 반환합니다.

{  "kind": "youtube#playlistListResponse",  "etag": etag,  "nextPageToken": string,  "prevPageToken": string,  "pageInfo": {    "totalResults": integer,    "resultsPerPage": integer  },  "items": [    playlist Resource  ]  
}

### 속성

다음 표는 이 리소스에 표시되는 속성을 정의합니다.

|속성|   |
|---|---|
|`kind`|`string`  <br>API 리소스 유형을 식별합니다. 값은 `youtube#playlistListResponse`입니다.|
|`etag`|`etag`  <br>이 리소스의 Etag입니다.|
|`nextPageToken`|`string`  <br>`pageToken` 매개변수의 값으로 사용하여 결과 집합의 다음 페이지를 검색할 수 있는 토큰입니다.|
|`prevPageToken`|`string`  <br>`pageToken` 매개변수의 값으로 사용하여 결과 집합의 이전 페이지를 검색할 수 있는 토큰입니다.|
|`pageInfo`|`object`  <br>`pageInfo` 객체는 결과 집합의 페이지 정보를 요약합니다.|
|`pageInfo.totalResults`|`integer`  <br>결과 집합의 총 결과 수입니다.|
|`pageInfo.resultsPerPage`|`integer`  <br>API 응답에 포함된 결과 수입니다.|
|`items[]`|`list`  <br>요청 기준과 일치하는 재생목록 목록입니다.|


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



# Videos: list 

bookmark_border

API 요청 매개변수와 일치하는 동영상의 목록을 반환합니다.

**할당량 영향:** 이 메서드를 호출하면 1단위의 [할당량 비용](https://developers.google.com/youtube/v3/getting-started?hl=ko#quota)이 적용됩니다.

## 일반적인 사용 사례

## 요청

### HTTP 요청

GET https://www.googleapis.com/youtube/v3/videos

### 매개변수

다음 표에는 이 쿼리가 지원하는 매개변수가 나와 있습니다. 나열된 모든 매개변수는 쿼리 매개변수입니다.

|매개변수|   |
|---|---|
|**필수 매개변수**|   |   |
|`part`|`string`  <br>`**part**` 매개변수는 API 응답에 포함될 하나 이상의 `video` 리소스 속성의 쉼표로 구분된 목록을 지정합니다.  <br>  <br>매개변수가 하위 속성을 포함하는 속성을 식별하는 경우 하위 속성이 응답에 포함됩니다. 예를 들어 `video` 리소스에서 `snippet` 속성은 `channelId`, `title`, `description`, `tags`, `categoryId` 속성을 포함합니다. 따라서 `**part=snippet**`를 설정하면 API 응답에 이러한 모든 속성이 포함됩니다.  <br>  <br>다음 목록에는 매개변수 값에 포함할 수 있는 `part` 이름이 나와 있습니다.  <br><br>- `contentDetails`<br>- `fileDetails`<br>- `id`<br>- `liveStreamingDetails`<br>- `localizations`<br>- `player`<br>- `processingDetails`<br>- `recordingDetails`<br>- `snippet`<br>- `statistics`<br>- `status`<br>- `suggestions`<br>- `topicDetails`|
|**필터(다음 매개변수 중 하나만 지정)**|   |   |
|`chart`|`string`  <br>`**chart**` 매개변수는 검색하려는 차트를 식별합니다.  <br>  <br>허용되는 값은 다음과 같습니다.<br><br>- `**mostPopular**` – 지정된 [콘텐츠 지역](https://developers.google.com/youtube/v3/docs/videos/list?hl=ko#regionCode) 및 [동영상 카테고리](https://developers.google.com/youtube/v3/docs/videos/list?hl=ko#videoCategoryId)의 인기 동영상을 반환합니다.|
|`id`|`string`  <br>`**id**` 매개변수는 검색되는 리소스에 대한 YouTube 동영상 ID의 쉼표로 구분된 목록을 지정합니다. `video` 리소스에서 `id` 속성은 동영상의 ID를 지정합니다.|
|`myRating`|`string`  <br>이 매개변수는 제대로 [승인된 요청](https://developers.google.com/youtube/v3/guides/authentication?hl=ko)에서만 사용할 수 있습니다. 이 매개변수의 값을 `like` 또는 `dislike`로 설정하여 API에서 인증된 사용자가 좋아요 또는 싫어요 표시한 동영상만 반환하도록 지시합니다.  <br>  <br>허용되는 값은 다음과 같습니다.<br><br>- `**dislike**` – 인증된 사용자가 싫어요 표시한 동영상만 반환합니다.<br>- `**like**` – 인증된 사용자가 좋아요 표시한 동영상만 반환합니다.|
|**선택적 매개변수**|   |   |
|`hl`|`string`  <br>`**hl**` 매개변수는 [YouTube 웹사이트에서 지원하는 특정 애플리케이션 언어](https://developers.google.com/youtube/v3/docs/i18nLanguages?hl=ko)에 대해 현지화된 리소스 메타데이터를 검색하도록 API에 지시합니다. 매개변수 값은 `[i18nLanguages.list](https://developers.google.com/youtube/v3/docs/i18nLanguages/list?hl=ko)` 메서드에서 반환하는 목록에 포함된 언어 코드여야 합니다.  <br>  <br>현지화된 리소스 세부정보가 해당 언어로 제공되는 경우 리소스의 `snippet.localized` 객체에 현지화된 값이 포함됩니다. 하지만 현지화된 세부정보를 사용할 수 없는 경우 `snippet.localized` 객체에는 리소스의 [기본 언어](https://developers.google.com/youtube/v3/docs/videos?hl=ko#snippet.defaultLanguage)로 된 리소스 세부정보가 포함됩니다.|
|`maxHeight`|`unsigned integer`  <br>`**maxHeight**` 매개변수는 `[player.embedHtml](https://developers.google.com/youtube/v3/docs/videos?hl=ko#player.embedHtml)` 속성에서 반환되는 내장 플레이어의 최대 높이를 지정합니다. 이 매개변수를 사용하여 기본 크기 대신 소스 코드가 애플리케이션 레이아웃에 적합한 높이를 사용하도록 지정할 수 있습니다. `maxWidth` 매개변수도 제공되는 경우 최대 너비를 위반하지 않도록 플레이어가 `maxHeight`보다 짧을 수도 있습니다. 사용 가능한 값: `72`~`8192`|
|`maxResults`|`unsigned integer`  <br>`**maxResults**` 매개변수는 결과 집합에 반환해야 하는 최대 항목 수를 지정합니다.  <br>  <br>**참고:** 이 매개변수는 `[myRating](https://developers.google.com/youtube/v3/docs/videos/list?hl=ko#myRating)` 매개변수와 함께 사용하도록 지원되지만 `[id](https://developers.google.com/youtube/v3/docs/videos/list?hl=ko#id)` 매개변수와 함께 사용하도록 지원되지는 않습니다. 사용 가능한 값: `1`~`50` 기본값은 `5`입니다.|
|`maxWidth`|`unsigned integer`  <br>`**maxWidth**` 매개변수는 `[player.embedHtml](https://developers.google.com/youtube/v3/docs/videos?hl=ko#player.embedHtml)` 속성에서 반환되는 내장 플레이어의 최대 너비를 지정합니다. 이 매개변수를 사용하여 기본 크기 대신 소스 코드에서 애플리케이션 레이아웃에 적합한 너비를 사용하도록 지정할 수 있습니다.  <br>  <br>`maxHeight` 매개변수도 제공되는 경우 최대 높이를 위반하지 않도록 플레이어의 범위가 `maxWidth`보다 좁을 수도 있습니다. 사용 가능한 값: `72`~`8192`|
|`onBehalfOfContentOwner`|`string`  <br>이 매개변수는 제대로 [승인된 요청](https://developers.google.com/youtube/v3/guides/authentication?hl=ko)에서만 사용할 수 있습니다. **참고:** 이 매개변수는 YouTube 콘텐츠 파트너 전용입니다.  <br>  <br>`**onBehalfOfContentOwner**` 매개변수는 요청의 승인 사용자 인증 정보가 매개변수 값에 지정된 콘텐츠 소유자를 대신하는 YouTube CMS 사용자를 식별함을 나타냅니다. 이 매개변수는 다양한 YouTube 채널을 소유하고 관리하는 YouTube 콘텐츠 파트너를 위한 것입니다. 콘텐츠 소유자가 각 채널에 사용자 인증 정보를 제공하지 않고도 한 번만 인증하면 모든 동영상 및 채널 데이터에 액세스할 수 있습니다. 사용자가 인증할 CMS 계정은 지정된 YouTube 콘텐츠 소유자에게 연결되어야 합니다.|
|`pageToken`|`string`  <br>`**pageToken**` 매개변수는 반환해야 하는 결과 집합의 특정 페이지를 식별합니다. API 응답에서 `nextPageToken` 및 `prevPageToken` 속성은 검색할 수 있는 다른 페이지를 식별합니다.  <br>  <br>**참고:** 이 매개변수는 `[myRating](https://developers.google.com/youtube/v3/docs/videos/list?hl=ko#myRating)` 매개변수와 함께 사용하도록 지원되지만 `[id](https://developers.google.com/youtube/v3/docs/videos/list?hl=ko#id)` 매개변수와 함께 사용하도록 지원되지는 않습니다.|
|`regionCode`|`string`  <br>`**regionCode**` 매개변수는 지정된 지역에서 사용할 수 있는 동영상 차트를 선택하도록 API에 지시합니다. 이 매개변수는 `[chart](https://developers.google.com/youtube/v3/docs/videos/list?hl=ko#chart)` 매개변수와 함께만 사용할 수 있습니다. 이 매개변수 값은 ISO 3166-1 alpha-2 국가 코드입니다de.|
|`videoCategoryId`|`string`  <br>`**videoCategoryId**` 매개변수는 차트를 검색해야 하는 [동영상 카테고리](https://developers.google.com/youtube/v3/docs/videoCategories?hl=ko)를 식별합니다. 이 매개변수는 `[chart](https://developers.google.com/youtube/v3/docs/videos/list?hl=ko#chart)` 매개변수와 함께만 사용할 수 있습니다. 기본적으로 차트는 특정 카테고리로 제한되지 않습니다. 기본값은 `0`입니다.|

### 요청 본문

이 메소드를 호출할 때 요청 본문을 제공하지 마세요.

## 응답

요청에 성공할 경우 이 메소드는 다음과 같은 구조의 응답 본문을 반환합니다.

{  "kind": "youtube#videoListResponse",  "etag": etag,  "nextPageToken": string,  "prevPageToken": string,  "pageInfo": {    "totalResults": integer,    "resultsPerPage": integer  },  "items": [    [video Resource](https://developers.google.com/youtube/v3/docs/videos?hl=ko#resource)  ]  
}

### 속성

다음 표는 이 리소스에 표시되는 속성을 정의합니다.

|속성|   |
|---|---|
|`kind`|`string`  <br>API 리소스 유형을 식별합니다. 값은 `youtube#videoListResponse`입니다.|
|`etag`|`etag`  <br>이 리소스의 Etag입니다.|
|`nextPageToken`|`string`  <br>`pageToken` 매개변수의 값으로 사용하여 결과 집합의 다음 페이지를 검색할 수 있는 토큰입니다.|
|`prevPageToken`|`string`  <br>`pageToken` 매개변수의 값으로 사용하여 결과 집합의 이전 페이지를 검색할 수 있는 토큰입니다.|
|`pageInfo`|`object`  <br>`pageInfo` 객체는 결과 집합의 페이지 정보를 요약합니다.|
|`pageInfo.totalResults`|`integer`  <br>결과 집합의 총 결과 수입니다.|
|`pageInfo.resultsPerPage`|`integer`  <br>API 응답에 포함된 결과 수입니다.|
|`items[]`|`list`  <br>요청 기준과 일치하는 동영상 목록입니다.|

## 오류

다음 표에서는 이 메서드에 대한 호출에 대한 응답으로 API가 반환할 수 있는 오류 메시지를 확인합니다. 자세한 내용은 [오류 메시지](https://developers.google.com/youtube/v3/docs/errors?hl=ko) 설명서를 참조하세요.

|오류 유형|오류 세부정보|설명|
|---|---|---|
|`badRequest (400)`|`videoChartNotFound`|요청한 동영상 차트가 지원되지 않거나 동영상 차트를 사용할 수 없습니다.|
|`forbidden (403)`|`forbidden`|요청에 동영상 파일 액세스 또는 정보 처리 권한이 제대로 부여되지 않았습니다. `fileDetails`, `processingDetails`, `suggestions` 부분은 해당 동영상 소유자만 사용할 수 있습니다.|
|`forbidden (403)`|`forbidden`|요청이 사용자 평가 정보에 액세스할 수 없습니다. 이 오류는 요청에 `myRating` 매개변수를 사용하도록 제대로 승인되지 않았기 때문에 발생할 수 있습니다.|
|`notFound (404)`|`videoNotFound`|검색하려는 동영상을 찾을 수 없습니다. 요청의 `id` 매개변수 값이 올바른지 확인하세요.|


# Videos: update 

bookmark_border

이제 API에서 [채널](https://developers.google.com/youtube/v3/docs/channels?hl=ko) 또는 [동영상](https://developers.google.com/youtube/v3/docs/videos?hl=ko)을 '아동용'으로 표시하는 기능을 지원합니다. 또한 `channel` 및 `video` 리소스에도 이제 채널이나 동영상의 '아동용' 상태를 식별하는 속성이 포함됩니다. YouTube API 서비스 약관 및 개발자 정책도 2020년 1월 10일에 업데이트되었습니다. 자세한 내용은 [YouTube Data API 서비스](https://developers.google.com/youtube/v3/revision_history?hl=ko) 및 [YouTube API 서비스 약관](https://developers.google.com/youtube/terms/revision-history?hl=ko)의 업데이트 기록을 참고하세요.

동영상의 메타데이터를 업데이트합니다.

**할당량 영향:** 이 메서드를 호출하면 50단위의 [할당량 비용](https://developers.google.com/youtube/v3/getting-started?hl=ko#quota)이 적용됩니다.

## 일반적인 사용 사례

## 요청

### HTTP 요청

PUT https://www.googleapis.com/youtube/v3/videos

### 승인

이 요청에는 다음 범위 중 최소 하나를 사용하여 인증이 필요합니다. ([인증 및 승인에 대해 자세히 알아보기](https://developers.google.com/youtube/v3/guides/authentication?hl=ko))

|범위|
|---|
|`https://www.googleapis.com/auth/youtubepartner`|
|`https://www.googleapis.com/auth/youtube`|
|`https://www.googleapis.com/auth/youtube.force-ssl`|

### 매개변수

다음 표에는 이 쿼리가 지원하는 매개변수가 나와 있습니다. 나열된 모든 매개변수는 쿼리 매개변수입니다.

|매개변수|   |
|---|---|
|**필수 매개변수**|   |   |
|`part`|`string`  <br>이 연산에서 `**part**` 매개변수는 두 가지 용도로 사용됩니다. 쓰기 작업에서 설정하는 속성과 API 응답에 포함되는 속성을 식별합니다.  <br>  <br>이 메서드는 매개변수 값이 지정하는 부분에 포함된 모든 변경 가능한 속성의 기존 값을 재정의합니다. 예를 들어 동영상의 공개 범위 설정은 `status` 부분에 포함되어 있습니다. 따라서 요청이 비공개 동영상을 업데이트하고 요청의 `part` 매개변수 값에 `status` 부분이 포함된 경우 동영상의 공개 범위 설정이 요청 본문이 지정한 값으로 업데이트됩니다. 요청 본문에서 값을 지정하지 않으면 기존 공개 범위 설정이 삭제되고 동영상이 기본 공개 범위 설정으로 돌아갑니다.  <br>  <br>또한 일부 부분에는 동영상을 삽입하거나 업데이트할 때 설정할 수 있는 속성이 포함되어 있지 않습니다. 예를 들어 `statistics` 객체는 YouTube가 동영상에 관해 계산하는 통계를 캡슐화하며 설정하거나 수정할 수 있는 값을 포함하지 않습니다. 매개변수 값이 변경 가능한 값을 포함하지 않는 `part`를 지정하는 경우 해당 `part`는 API 응답에 계속 포함됩니다.  <br>  <br>다음 목록에는 매개변수 값에 포함할 수 있는 `part` 이름이 포함되어 있습니다.  <br><br>- `contentDetails`<br>- `fileDetails`<br>- `id`<br>- `liveStreamingDetails`<br>- `localizations`<br>- `player`<br>- `processingDetails`<br>- `recordingDetails`<br>- `snippet`<br>- `statistics`<br>- `status`<br>- `suggestions`<br>- `topicDetails`|
|**선택적 매개변수**|   |   |
|`onBehalfOfContentOwner`|`string`  <br>이 매개변수는 제대로 [승인된 요청](https://developers.google.com/youtube/v3/guides/authentication?hl=ko)에서만 사용할 수 있습니다. **참고:** 이 매개변수는 YouTube 콘텐츠 파트너 전용입니다.  <br>  <br>`**onBehalfOfContentOwner**` 매개변수는 요청의 승인 사용자 인증 정보가 매개변수 값에 지정된 콘텐츠 소유자를 대신하는 YouTube CMS 사용자를 식별함을 나타냅니다. 이 매개변수는 다양한 YouTube 채널을 소유하고 관리하는 YouTube 콘텐츠 파트너를 위한 것입니다. 콘텐츠 소유자가 각 채널에 사용자 인증 정보를 제공하지 않고도 한 번만 인증하면 모든 동영상 및 채널 데이터에 액세스할 수 있습니다. 사용자가 인증할 실제 CMS 계정은 지정된 YouTube 콘텐츠 소유자에게 연결되어야 합니다.|

### 요청 본문

요청 본문에 [video 리소스](https://developers.google.com/youtube/v3/docs/videos?hl=ko#resource)를 제공합니다. 해당 리소스의 경우:

- 다음 속성에 값을 지정해야 합니다.
    
    - `id`
    - `snippet.title` - 이 속성은 요청이 `video` 리소스의 `snippet`를 업데이트하는 경우에만 필요합니다.
    - `snippet.categoryId` - 이 속성은 요청이 `video` 리소스의 `snippet`를 업데이트하는 경우에만 필요합니다.
    
- 다음 속성에 값을 설정할 수 있습니다.
    
    - `snippet.categoryId`
    - `snippet.defaultLanguage`
    - `snippet.description`
    - `snippet.tags[]`
    - `snippet.title`
    - `status.embeddable`
    - `status.license`
    - `status.privacyStatus`
    - `status.publicStatsViewable`
    - `status.publishAt` – 이 속성의 값을 설정하는 경우 `status.privacyStatus` 속성도 `private`로 설정해야 합니다.
    - `status.selfDeclaredMadeForKids`
    - `recordingDetails.locationDescription` (지원 중단됨)
    - `recordingDetails.location.latitude` (지원 중단됨)
    - `recordingDetails.location.longitude` (지원 중단됨)
    - `recordingDetails.recordingDate`
    - `localizations.(key)`
    - `localizations.(key).title`
    - `localizations.(key).description`
    
    업데이트 요청을 제출하는데 값이 있는 속성에 요청이 값을 지정하지 않은 경우 속성의 기존 값은 삭제됩니다.


# Search: list

bookmark_border

검색 쿼리와 일치하는 리소스의 컬렉션을 반환합니다.

**할당량 영향:** 이 메서드를 호출하면 100단위의 [할당량 비용](https://developers.google.com/youtube/v3/getting-started?hl=ko#quota)이 적용됩니다.

## 요청

### HTTP 요청

GET https://www.googleapis.com/youtube/v3/search

### 매개변수

다음 표에는 이 쿼리가 지원하는 매개변수가 나와 있습니다. 나열된 모든 매개변수는 쿼리 매개변수입니다.

|매개변수|   |
|---|---|
|**필수 매개변수**|   |   |
|`part`|`string`  <br>`**part**` 매개변수는 API 응답에 포함될 하나 이상의 `search` 리소스 속성의 쉼표로 구분된 목록을 지정합니다.  <br>  <br>다음 목록에는 매개변수 값에 포함할 수 있는 `part` 이름이 나와 있습니다.  <br><br>- `snippet`|
|**선택적 매개변수**|   |   |
|`channelId`|`string`  <br>`**channelId**` 매개변수는 검색을 특정 채널로 제한합니다.|
|`channelType`|`string`  <br>`**channelType**` 매개변수를 사용하면 검색을 특정 유형의 채널로 제한할 수 있습니다.  <br>  <br>허용되는 값은 다음과 같습니다.<br><br>- `any` – 모든 채널 유형을 반환합니다.<br>- `show` – 쇼 유형의 채널만 반환합니다.|
|`eventType`|`string`  <br>`**eventType**` 매개변수는 방송 이벤트 유형으로 검색을 제한합니다. 이 매개변수는 `type` 매개변수의 값이 `video`인 경우에만 사용할 수 있습니다.  <br>  <br>허용되는 값은 다음과 같습니다.<br><br>- `completed` – 완료된 방송만 포함합니다.<br>- `live` – 활성 방송만 포함합니다.<br>- `upcoming` – 예정된 방송만 포함합니다.|
|`forContentOwner`|`boolean`  <br>`**forContentOwner**` 매개변수는 검색 결과를 요청을 인증하는 사용자와 연결된 채널에 속한 동영상으로 제한하도록 API에 지시합니다. |
|`forDeveloper`|`boolean`  <br>`**forDeveloper**` 매개변수는 검색 결과를 요청을 인증하는 사용자와 연결된 채널에 속한 동영상으로 제한하도록 API에 지시합니다. |
|`forMine`|`boolean`  <br>`**forMine**` 매개변수는 검색 결과를 요청을 인증하는 사용자와 연결된 채널에 속한 동영상으로 제한하도록 API에 지시합니다. |
|`location`|`string`  <br>`**location**` 매개변수는 위도와 경도 좌표로 지정된 지리적 영역과 연결된 동영상을 검색하도록 API에 지시합니다.|
|`locationRadius`|`string`  <br>`**locationRadius**` 매개변수는 지정된 좌표에서 검색할 원형 영역의 반경을 지정합니다. 이 매개변수는 `location` 매개변수와 함께 사용해야 합니다.|
|`maxResults`|`unsigned integer`  <br>`**maxResults**` 매개변수는 결과 집합에 반환해야 하는 최대 항목 수를 지정합니다. 사용 가능한 값: `0`~`50` 기본값은 `5`입니다.|
|`onBehalfOfContentOwner`|`string`  <br>이 매개변수는 제대로 [승인된 요청](https://developers.google.com/youtube/v3/guides/authentication?hl=ko)에서만 사용할 수 있습니다. **참고:** 이 매개변수는 YouTube 콘텐츠 파트너 전용입니다.|
|`order`|`string`  <br>`**order**` 매개변수는 API 응답에 리소스를 정렬하는 방법을 지정합니다.  <br>  <br>허용되는 값은 다음과 같습니다.<br><br>- `date` – 리소스를 생성 날짜별로 역순으로 정렬합니다.<br>- `rating` – 리소스를 평점별로 정렬합니다.<br>- `relevance` – 리소스를 검색 쿼리와의 관련성에 따라 정렬합니다. 기본값입니다.<br>- `title` – 리소스를 제목별로 정렬합니다.<br>- `videoCount` – 채널을 업로드한 동영상 수별로 정렬합니다.<br>- `viewCount` – 리소스를 조회수별로 정렬합니다.|
|`pageToken`|`string`  <br>`**pageToken**` 매개변수는 반환해야 하는 결과 집합의 특정 페이지를 식별합니다. API 응답에서 `nextPageToken` 및 `prevPageToken` 속성은 검색할 수 있는 다른 페이지를 식별합니다.|
|`publishedAfter`|`datetime`  <br>`**publishedAfter**` 매개변수는 지정된 시간 이후에 생성된 리소스만 포함하도록 API에 지시합니다.|
|`publishedBefore`|`datetime`  <br>`**publishedBefore**` 매개변수는 지정된 시간 이전에 생성된 리소스만 포함하도록 API에 지시합니다.|
|`q`|`string`  <br>`**q**` 매개변수는 검색할 검색어를 지정합니다.|
|`regionCode`|`string`  <br>`**regionCode**` 매개변수는 동영상을 검색할 국가를 지정하는 데 사용할 수 있습니다. 매개변수 값은 ISO 3166-1 alpha-2 국가 코드입니다.|
|`relevanceLanguage`|`string`  <br>`**relevanceLanguage**` 매개변수는 지정된 언어와 가장 관련성이 높은 검색 결과를 반환하도록 API에 지시합니다.|
|`safeSearch`|`string`  <br>`**safeSearch**` 매개변수는 검색 결과에 제한된 콘텐츠가 포함되어야 하는지 여부를 나타냅니다.  <br>  <br>허용되는 값은 다음과 같습니다.<br><br>- `moderate` – YouTube의 검색 기능에서 사용하는 것과 동일한 필터링 수준을 사용하여 제한된 콘텐츠를 제외합니다. 기본값입니다.<br>- `none` – 검색 결과에 제한된 콘텐츠가 포함될 수 있음을 나타냅니다.<br>- `strict` – 모든 제한된 콘텐츠를 제외합니다.|
|`type`|`string`  <br>`**type**` 매개변수는 API 응답에 포함할 리소스 유형을 제한합니다.  <br>  <br>허용되는 값은 다음과 같습니다.<br><br>- `channel`<br>- `playlist`<br>- `video`|
|`videoCaption`|`string`  <br>`**videoCaption**` 매개변수는 자막이 있는 동영상만 포함하도록 검색 결과를 제한하는 데 사용할 수 있습니다.  <br>  <br>허용되는 값은 다음과 같습니다.<br><br>- `any` – 자막 여부에 관계없이 모든 동영상을 포함합니다. 기본값입니다.<br>- `closedCaption` – 자막이 있는 동영상만 포함합니다.<br>- `none` – 자막이 없는 동영상만 포함합니다.|
|`videoCategoryId`|`string`  <br>`**videoCategoryId**` 매개변수는 특정 동영상 카테고리에 속한 동영상만 포함하도록 검색 결과를 제한합니다.|
|`videoDefinition`|`string`  <br>`**videoDefinition**` 매개변수를 사용하면 HD(고화질) 동영상만 포함하도록 검색 결과를 제한할 수 있습니다.  <br>  <br>허용되는 값은 다음과 같습니다.<br><br>- `any` – 화질에 관계없이 모든 동영상을 반환합니다. 기본값입니다.<br>- `high` – HD 동영상만 포함합니다.<br>- `standard` – 표준 화질 동영상만 포함합니다.|
|`videoDimension`|`string`  <br>`**videoDimension**` 매개변수를 사용하면 2D 또는 3D 동영상만 포함하도록 검색 결과를 제한할 수 있습니다.  <br>  <br>허용되는 값은 다음과 같습니다.<br><br>- `2d` – 2D 동영상만 검색합니다.<br>- `3d` – 3D 동영상만 검색합니다.<br>- `any` – 2D와 3D 동영상을 모두 포함합니다. 기본값입니다.|
|`videoDuration`|`string`  <br>`**videoDuration**` 매개변수는 특정 기간의 동영상만 포함하도록 검색 결과를 필터링합니다.  <br>  <br>허용되는 값은 다음과 같습니다.<br><br>- `any` – 기간에 관계없이 모든 동영상을 포함합니다. 기본값입니다.<br>- `long` – 20분보다 긴 동영상만 포함합니다.<br>- `medium` – 4분에서 20분 사이의 동영상만 포함합니다.<br>- `short` – 4분 미만의 동영상만 포함합니다.|
|`videoEmbeddable`|`string`  <br>`**videoEmbeddable**` 매개변수를 사용하면 삽입 가능한 동영상만 포함하도록 검색 결과를 제한할 수 있습니다.  <br>  <br>허용되는 값은 다음과 같습니다.<br><br>- `any` – 삽입 가능 여부에 관계없이 모든 동영상을 반환합니다. 기본값입니다.<br>- `true` – 삽입 가능한 동영상만 검색합니다.|
|`videoLicense`|`string`  <br>`**videoLicense**` 매개변수는 특정 라이선스를 가진 동영상만 포함하도록 검색 결과를 필터링합니다.  <br>  <br>허용되는 값은 다음과 같습니다.<br><br>- `any` – 라이선스 유형에 관계없이 모든 동영상을 반환합니다. 기본값입니다.<br>- `creativeCommon` – Creative Commons 라이선스가 있는 동영상만 포함합니다.<br>- `youtube` – 표준 YouTube 라이선스가 있는 동영상만 포함합니다.|
|`videoSyndicated`|`string`  <br>`**videoSyndicated**` 매개변수를 사용하면 YouTube.com 외부에서 재생할 수 있는 동영상만 포함하도록 검색 결과를 제한할 수 있습니다.  <br>  <br>허용되는 값은 다음과 같습니다.<br><br>- `any` – 배급 여부에 관계없이 모든 동영상을 반환합니다. 기본값입니다.<br>- `true` – 배급된 동영상만 포함합니다.|
|`videoType`|`string`  <br>`**videoType**` 매개변수를 사용하면 특정 유형의 동영상만 포함하도록 검색 결과를 제한할 수 있습니다.  <br>  <br>허용되는 값은 다음과 같습니다.<br><br>- `any` – 모든 동영상을 반환합니다. 기본값입니다.<br>- `episode` – 프로그램의 에피소드만 검색합니다.<br>- `movie` – 영화만 검색합니다.|

### 요청 본문

이 메소드를 호출할 때 요청 본문을 제공하지 마세요.

## 응답

요청에 성공할 경우 이 메소드는 다음과 같은 구조의 응답 본문을 반환합니다.

{  "kind": "youtube#searchListResponse",  "etag": etag,  "nextPageToken": string,  "prevPageToken": string,  "regionCode": string,  "pageInfo": {    "totalResults": integer,    "resultsPerPage": integer  },  "items": [    search Resource  ]  
}

### 속성

다음 표는 이 리소스에 표시되는 속성을 정의합니다.

|속성|   |
|---|---|
|`kind`|`string`  <br>API 리소스 유형을 식별합니다. 값은 `youtube#searchListResponse`입니다.|
|`etag`|`etag`  <br>이 리소스의 Etag입니다.|
|`nextPageToken`|`string`  <br>`pageToken` 매개변수의 값으로 사용하여 결과 집합의 다음 페이지를 검색할 수 있는 토큰입니다.|
|`prevPageToken`|`string`  <br>`pageToken` 매개변수의 값으로 사용하여 결과 집합의 이전 페이지를 검색할 수 있는 토큰입니다.|
|`regionCode`|`string`  <br>검색 결과를 필터링하는 데 사용된 지역 코드입니다.|
|`pageInfo`|`object`  <br>`pageInfo` 객체는 결과 집합의 페이지 정보를 요약합니다.|
|`pageInfo.totalResults`|`integer`  <br>결과 집합의 총 결과 수입니다.|
|`pageInfo.resultsPerPage`|`integer`  <br>API 응답에 포함된 결과 수입니다.|
|`items[]`|`list`  <br>요청 기준과 일치하는 검색 결과 목록입니다.|


# Subscriptions: list

bookmark_border

구독 리소스의 컬렉션을 반환합니다.

**할당량 영향:** 이 메서드를 호출하면 1단위의 [할당량 비용](https://developers.google.com/youtube/v3/getting-started?hl=ko#quota)이 적용됩니다.

## 요청

### HTTP 요청

GET https://www.googleapis.com/youtube/v3/subscriptions

### 매개변수

다음 표에는 이 쿼리가 지원하는 매개변수가 나와 있습니다. 나열된 모든 매개변수는 쿼리 매개변수입니다.

|매개변수|   |
|---|---|
|**필수 매개변수**|   |   |
|`part`|`string`  <br>`**part**` 매개변수는 API 응답에 포함될 하나 이상의 `subscription` 리소스 속성의 쉼표로 구분된 목록을 지정합니다.  <br>  <br>다음 목록에는 매개변수 값에 포함할 수 있는 `part` 이름이 나와 있습니다.  <br><br>- `contentDetails`<br>- `id`<br>- `snippet`<br>- `subscriberSnippet`|
|**필터(다음 매개변수 중 하나만 지정)**|   |   |
|`channelId`|`string`  <br>`**channelId**` 매개변수는 지정된 채널 ID와 연결된 구독을 검색하도록 API에 지시합니다.|
|`id`|`string`  <br>`**id**` 매개변수는 검색되는 리소스에 대한 YouTube 구독 ID의 쉼표로 구분된 목록을 지정합니다.|
|`mine`|`boolean`  <br>`**mine**` 매개변수는 요청을 인증하는 사용자의 구독을 검색하도록 API에 지시합니다.|
|`myRecentSubscribers`|`boolean`  <br>`**myRecentSubscribers**` 매개변수는 요청을 인증하는 채널의 가장 최근 구독자를 검색하도록 API에 지시합니다.|
|`mySubscribers`|`boolean`  <br>`**mySubscribers**` 매개변수는 요청을 인증하는 채널의 구독자를 검색하도록 API에 지시합니다.|
|**선택적 매개변수**|   |   |
|`forChannelId`|`string`  <br>`**forChannelId**` 매개변수는 지정된 채널에 대한 구독만 검색하도록 API에 지시합니다.|
|`maxResults`|`unsigned integer`  <br>`**maxResults**` 매개변수는 결과 집합에 반환해야 하는 최대 항목 수를 지정합니다. 사용 가능한 값: `0`~`50` 기본값은 `5`입니다.|
|`onBehalfOfContentOwner`|`string`  <br>이 매개변수는 제대로 [승인된 요청](https://developers.google.com/youtube/v3/guides/authentication?hl=ko)에서만 사용할 수 있습니다. **참고:** 이 매개변수는 YouTube 콘텐츠 파트너 전용입니다.|
|`onBehalfOfContentOwnerChannel`|`string`  <br>이 매개변수는 제대로 [승인된 요청](https://developers.google.com/youtube/v3/guides/authentication?hl=ko)에서만 사용할 수 있습니다. **참고:** 이 매개변수는 YouTube 콘텐츠 파트너 전용입니다.|
|`order`|`string`  <br>`**order**` 매개변수는 API 응답에 리소스를 정렬하는 방법을 지정합니다.  <br>  <br>허용되는 값은 다음과 같습니다.<br><br>- `alphabetical` – 리소스를 알파벳순으로 정렬합니다.<br>- `relevance` – 리소스를 관련성에 따라 정렬합니다. 기본값입니다.<br>- `unread` – 리소스를 읽지 않은 항목 수별로 정렬합니다.|
|`pageToken`|`string`  <br>`**pageToken**` 매개변수는 반환해야 하는 결과 집합의 특정 페이지를 식별합니다. API 응답에서 `nextPageToken` 및 `prevPageToken` 속성은 검색할 수 있는 다른 페이지를 식별합니다.|

### 요청 본문

이 메소드를 호출할 때 요청 본문을 제공하지 마세요.

## 응답

요청에 성공할 경우 이 메소드는 다음과 같은 구조의 응답 본문을 반환합니다.

{  "kind": "youtube#subscriptionListResponse",  "etag": etag,  "nextPageToken": string,  "prevPageToken": string,  "pageInfo": {    "totalResults": integer,    "resultsPerPage": integer  },  "items": [    subscription Resource  ]  
}

### 속성

다음 표는 이 리소스에 표시되는 속성을 정의합니다.

|속성|   |
|---|---|
|`kind`|`string`  <br>API 리소스 유형을 식별합니다. 값은 `youtube#subscriptionListResponse`입니다.|
|`etag`|`etag`  <br>이 리소스의 Etag입니다.|
|`nextPageToken`|`string`  <br>`pageToken` 매개변수의 값으로 사용하여 결과 집합의 다음 페이지를 검색할 수 있는 토큰입니다.|
|`prevPageToken`|`string`  <br>`pageToken` 매개변수의 값으로 사용하여 결과 집합의 이전 페이지를 검색할 수 있는 토큰입니다.|
|`pageInfo`|`object`  <br>`pageInfo` 객체는 결과 집합의 페이지 정보를 요약합니다.|
|`pageInfo.totalResults`|`integer`  <br>결과 집합의 총 결과 수입니다.|
|`pageInfo.resultsPerPage`|`integer`  <br>API 응답에 포함된 결과 수입니다.|
|`items[]`|`list`  <br>요청 기준과 일치하는 구독 목록입니다.|

