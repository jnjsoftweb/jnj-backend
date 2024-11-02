@echo off

REM Start PocketBase server in a new window
start cmd /k "pocketbase.exe serve --dir=\"C:/JnJ-soft/Projects/internal/jnj-backend/db/pocketbase/sqlite\" --http=\"0.0.0.0:8090\""

REM Start GraphQL server in a new window
REM C:\JnJ-soft\Projects\internal\jnj-backend\nodejs\src\graphql>nodemon . | tee server.log
start cmd /k "cd C:\JnJ-soft\Projects\internal\jnj-backend\nodejs\src\graphql && node ."