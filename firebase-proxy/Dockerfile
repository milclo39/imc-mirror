# Node.jsの公式イメージを使用
FROM node:18-slim

# 作業ディレクトリを設定
WORKDIR /usr/src/app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install --only=production

# アプリケーションのソースコードをコピー
COPY . .

# アプリケーションを実行
CMD [ "npm", "start" ]