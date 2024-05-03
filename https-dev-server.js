const fs = require('fs');
const https = require('https');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// 证书文件路径
const key = fs.readFileSync('./localhost-key.pem', 'utf8');
const cert = fs.readFileSync('./localhost.pem', 'utf8');

// esbuild服务的配置
const esbuildHost = 'localhost';
const esbuildPort = 3002;

// 创建代理到esbuild开发服务器
app.use(createProxyMiddleware({
  target: `http://${esbuildHost}:${esbuildPort}`,
  changeOrigin: true,
}));

// 创建HTTPS服务器
https.createServer({ key, cert }, app).listen(3003, () => {
  console.log('HTTPS dev server running on https://localhost:3003');
});
