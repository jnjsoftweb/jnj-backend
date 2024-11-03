### backend setup

```sh
# cd C:\JnJ-soft\Projects\internal\jnj-backend\nodejs
cd /Users/youchan/Dev/Jnj-soft/Projects/internal/jnj-backend/nodejs/src

# basic, youtube
npm i dotenv axios express cors youtube-captions-scraper

# jnjsoft
npm i jnj-lib-base jnj-lib-google

# graphql
npm install -D @apollo/server apollo-server-express
```

### express server

```js
# server 시작
// cd C:\JnJ-soft\Projects\internal\jnj-backend\nodejs\src\express

cd /Users/youchan/Dev/Jnj-soft/Projects/internal/jnj-backend/nodejs/src/express
node .
```

### graphql server

```js
# server 시작
// cd C:\JnJ-soft\Projects\internal\jnj-backend\nodejs\src\graphql

cd /Users/youchan/Dev/Jnj-soft/Projects/internal/jnj-backend/nodejs/src/graphql
node .
```

### github

```sh
cd C:\JnJ-soft\Projects\internal\jnj-backend
# cd /Users/youchan/Dev/Jnj-soft/Projects/internal/jnj-backend

github -e pushRepo -n jnj-backend -u jnjsoftweb -d "backend in nodejs, python by jnjsoft"
```


## pocketbase

### 설치
- C:\JnJ-soft\Developments\Database\sqlite\pocketbase.exe
- 시스템 환경변수 편집 >path 추가 : C:\JnJ-soft\Developments\Database\sqlite

### data.db
- C:\JnJ-soft\Developments\_Templates\pocketbase\smtp\db\sqlite\data.db
- 복사 : C:/JnJ-soft/Projects/internal/jnj-backend/db/pocketbase/sqlite/data.db

### server start

```sh
pocketbase.exe serve --dir="C:/JnJ-soft/Projects/internal/jnj-backend/db/pocketbase/sqlite" --http="0.0.0.0:8090"
```

http://localhost:8090/_/

moondevnode@gmail.com

## sqlite

C:\Program Files\DB Browser for SQLite\




## ilmac

```sh
cd C:\JnJ-soft\Projects\internal\jnj-backend\nodejs
npm i mysql2
```
