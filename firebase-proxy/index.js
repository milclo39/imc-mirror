const express = require('express');
const axios = require('axios');
const app = express();

// Firebase HostingのURLをここに設定
const FIREBASE_HOSTING_URL = 'https://imagemate-m.web.app';
const firebaseHostname = new URL(FIREBASE_HOSTING_URL).hostname;

// 転送すべきでないヘッダーのリスト
const HEADERS_TO_SKIP = [
  'host',
  'connection',
  'keep-alive',
  'transfer-encoding',
  'upgrade',
  'proxy-connection',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'content-length' // streamで転送する場合は元のcontent-lengthは使わない
];

// 生のボディストリームを取得するため、expressのパーサーを使わない
app.use('*', async (req, res) => {
  try {
    const url = FIREBASE_HOSTING_URL + req.originalUrl;
    
    // 転送するヘッダーを作成
    const proxyHeaders = {};
    Object.keys(req.headers).forEach(key => {
      if (!HEADERS_TO_SKIP.includes(key.toLowerCase())) {
        proxyHeaders[key] = req.headers[key];
      }
    });
    
    // HostヘッダーをFirebase Hostingのものに設定
    proxyHeaders.host = firebaseHostname;
    
    // X-Forwarded-* ヘッダーの設定（Cloud Armor/LBからの情報を保持）
    if (!proxyHeaders['x-forwarded-for']) {
      proxyHeaders['x-forwarded-for'] = req.ip;
    }
    if (!proxyHeaders['x-forwarded-proto']) {
      proxyHeaders['x-forwarded-proto'] = req.protocol;
    }
    if (!proxyHeaders['x-forwarded-host']) {
      proxyHeaders['x-forwarded-host'] = req.hostname;
    }

    const response = await axios({
      method: req.method,
      url: url,
      headers: proxyHeaders,
      data: req, // reqオブジェクト自体をストリームとして転送
      responseType: 'stream',
      timeout: 30000, // 30秒のタイムアウト
      maxRedirects: 0, // リダイレクトはクライアントに任せる
      validateStatus: () => true // すべてのステータスコードを許可
    });

    // 転送すべきでないレスポンスヘッダーを除外
    Object.keys(response.headers).forEach(key => {
      if (!HEADERS_TO_SKIP.includes(key.toLowerCase())) {
        res.set(key, response.headers[key]);
      }
    });

    res.status(response.status);
    
    // ストリームをパイプ
    response.data.pipe(res);
    
    // エラーハンドリング
    response.data.on('error', (err) => {
      console.error('Stream error:', err.message);
      if (!res.headersSent) {
        res.status(502).send('Bad Gateway');
      }
    });

  } catch (error) {
    console.error('Proxy error:', error.message);
    
    if (error.response) {
      // Firebase Hostingからのエラーレスポンス
      if (!res.headersSent) {
        res.status(error.response.status);
        error.response.data.pipe(res);
      }
    } else if (error.code === 'ECONNABORTED') {
      // タイムアウト
      if (!res.headersSent) {
        res.status(504).send('Gateway Timeout');
      }
    } else {
      // その他のエラー
      if (!res.headersSent) {
        res.status(502).send('Bad Gateway');
      }
    }
  }
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`Proxy server listening on port ${port}`);
});