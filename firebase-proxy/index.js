const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// X-Forwarded-Forなどのヘッダーを正しく扱うために必要
app.set('trust proxy', true);

const FIREBASE_HOSTING_URL = 'https://imagemate-m.web.app';

// プロキシ設定
const proxyOptions = {
  target: FIREBASE_HOSTING_URL,
  changeOrigin: true,
  secure: true,
  logLevel: 'info',

  onError: (err, req, res) => {
    console.error('Proxy Error:', err);
    if (!res.headersSent) {
      res.status(502).send('Bad Gateway');
    }
  }
};

// 全てのリクエストをFirebase Hostingへ転送
app.use('*', createProxyMiddleware(proxyOptions));

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', (err) => {
  if (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
  console.log(`Proxy server listening on port ${port}`);
});