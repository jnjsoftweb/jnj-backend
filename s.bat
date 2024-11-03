@REM # Start Servers(svelte https, json-server, python-https)
@echo off
@REM 한글 명령어 에러 제거
chcp 65001

:: .env 파일 위치 설정
set ENV_FILE=./.env

:: 불러올 환경 변수 목록 설정
set "VARIABLES=APP_ROOT NEXT_PUBLIC_POCKETBASE_PORT "

:: .env 파일에서 유효한 설정만 읽어 환경 변수로 설정
for /f "tokens=1* delims==" %%i in (%ENV_FILE%) do (
    for %%v in (%VARIABLES%) do (
        if "%%i"=="%%v" (
            set "%%i=%%~j"
        )
    )
)

@REM echo %APP_ROOT%/db/pocketbase/sqlite
@REM echo "cd %APP_ROOT%/nodejs/src/graphql && nodemon ."

REM Start PocketBase server in a new window
start cmd /k "pocketbase.exe serve --dir=%APP_ROOT%/db/pocketbase/sqlite --http=0.0.0.0:8090"

REM Start GraphQL server in a new window
start cmd /k "cd %APP_ROOT%/nodejs/src/graphql && nodemon ."