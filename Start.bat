@echo off
pushd %~dp0

:: 下面这两行是新增的代理设置，请确保 7890 是你代理软件的真实端口
set HTTP_PROXY=http://127.0.0.1:16023
set HTTPS_PROXY=http://127.0.0.1:16023

set NODE_ENV=production
call npm install --no-save --no-audit --no-fund --loglevel=error --no-progress --omit=dev
node server.js %*
pause
popd