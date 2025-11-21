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
  'trailers'
  // content-length, content-encodingは転送する
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

    // クライアントのAccept-Encodingをそのまま転送
    const response = await axios({
      method: req.method,
      url: url,
      headers: proxyHeaders,
      data: req,
      responseType: 'stream',
      timeout: 30000,
      maxRedirects: 0,
      validateStatus: () => true,
      decompress: false // 自動展開を無効化
    });

    // すべてのレスポンスヘッダーをそのまま転送（content-encodingも含む）
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
app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
  console.log(`Proxy server listening on port ${port}`);
});