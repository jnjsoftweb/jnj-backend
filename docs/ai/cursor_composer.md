네, Notion API 토큰이 유효하지 않다는 오류 메시지가 나오고 있습니다. Notion API 토큰을 새로 생성하려면 다음 단계를 따라주세요:
Notion 웹사이트(https://www.notion.so/)에 로그인합니다.
오른쪽 상단의 설정 및 멤버 (Settings & Members) 메뉴로 이동합니다.
왼쪽 사이드바에서 '내 연동(My connections)' 또는 'Integrations'를 선택합니다.
4. 'Develop or manage integrations'를 클릭합니다.
기존 integration이 있다면 해당 integration을 선택하고, 없다면 'Create new integration'을 클릭합니다.
6. integration의 이름과 관련 정보를 입력하고 'Submit'을 클릭합니다.
새로운 'Internal Integration Token'이 생성됩니다. 이 토큰을 복사합니다.
프로젝트의 .env 파일에서 NOTION_API_KEY 값을 새로 생성한 토큰으로 업데이트합니다:



```prompt
notion 웹페이지에서 block id는 어떻게 확인하나요
```

Notion 웹페이지에서 블록 ID를 확인하는 방법은 다음과 같습니다:
1. 블록 ID를 확인하고 싶은 블록에 마우스를 올립니다.
2. 블록의 왼쪽에 나타나는 여섯 개의 점(::) 아이콘을 클릭합니다.
3. 드롭다운 메뉴에서 "Copy link to block"을 선택합니다.
4.클립보드에 복사된 링크는 다음과 같은 형식을 가집니다:
https://www.notion.so/workspace/Page-Name-123456abcdef#789abcdef0123
5. URL의 마지막 부분 (# 뒤의 부분)이 블록 ID입니다. 이 경우 789abcdef0123가 블록 ID입니다.

또는, 개발자 도구를 사용하여 확인할 수 있습니다:
브라우저에서 개발자 도구를 엽니다 (보통 F12 키).
네트워크 탭을 선택합니다.
페이지를 새로고침합니다.
4. 요청 중 loadPageChunk를 찾습니다.
5. 이 요청의 응답을 확인하면 각 블록의 ID를 볼 수 있습니다.
주의: 블록 ID는 32자의 16진수로 구성되어 있으며, 대시(-)로 구분된 형식일 수 있습니다 (예: 1234abcd-5678-efgh-9012-ijklmnopqrst).
이 블록 ID를 사용하여 Notion API를 통해 특정 블록의 정보를 조회하거나 수정할 수 있습니다.