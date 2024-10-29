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
