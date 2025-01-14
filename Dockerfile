# 編譯階段
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

# 設置環境變量來忽略一些警告
ENV NPM_CONFIG_LOGLEVEL=error
ENV NODE_OPTIONS=--max-old-space-size=4096

# 合併RUN命令，更新依賴，設置鏡像源，安裝依賴，然後清理
RUN apk add --no-cache --virtual .build-deps git && \
  npm config set registry https://registry.npmjs.org && \
  npm install -g npm@latest && \
  npm install --production --no-optional --legacy-peer-deps && \
  npm cache clean --force && \
  apk del .build-deps && \
  rm -rf /var/cache/apk/* /tmp/*

# 運行階段
FROM node:18-alpine AS runner

ENV TZ="Asia/Shanghai" \
  NODE_ENV=production

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY . .

EXPOSE 9520

CMD ["node", "--max-old-space-size=4096", "./dist/main.js"]
