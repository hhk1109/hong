/**
 * stardew-login-page 前端静态服务器（零依赖，Node.js 原生实现）
 *
 * 职责：
 *  1. 托管本目录下的静态资源（index.html / assets/*，Vue 打包产物）
 *  2. 将 /api/** 请求反向代理到后端 Spring Boot 服务（默认 http://127.0.0.1:8081）
 *     —— 前端代码使用相对路径 "/api" 作为接口基址，代理后前后端即为同源，
 *        彻底规避浏览器跨域问题（后端 CorsConfig 仍保留作为兜底）。
 *
 * 环境变量：
 *  FRONTEND_PORT  前端监听端口（默认 5173）
 *  API_TARGET     后端地址（默认 http://127.0.0.1:8081）
 *
 * 启动：node server.js
 */
"use strict";

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = parseInt(process.env.FRONTEND_PORT || "5173", 10);
const API_TARGET = process.env.API_TARGET || "http://127.0.0.1:8081";
const API_PREFIX = "/api/";
const ROOT = __dirname;
// 项目根目录（托管 home.html 登录后首页）
const PROJECT_ROOT = path.resolve(ROOT, "..", "..");

const target = new URL(API_TARGET);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json"
};

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";

  // 登录后首页：/home 与 /home.html 均指向项目根目录的 home.html
  if (urlPath === "/home" || urlPath === "/home.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
    fs.createReadStream(path.join(PROJECT_ROOT, "home.html")).pipe(res);
    return;
  }

  // 后台管理系统：/admin（登录页）与 /admin/dashboard（管理面板）
  if (urlPath === "/admin" || urlPath === "/admin-login.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
    fs.createReadStream(path.join(PROJECT_ROOT, "admin-login.html")).pipe(res);
    return;
  }
  if (urlPath === "/admin/dashboard" || urlPath === "/admin.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
    fs.createReadStream(path.join(PROJECT_ROOT, "admin.html")).pipe(res);
    return;
  }

  // SPA 兜底：未知路径一律回 index.html（vue-router history 模式）
  let filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(ROOT, "index.html");
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600"
  });
  fs.createReadStream(filePath).pipe(res);
}

function proxyApi(req, res) {
  const options = {
    protocol: target.protocol,
    hostname: target.hostname,
    port: target.port || (target.protocol === "https:" ? 443 : 80),
    method: req.method,
    path: req.url,
    headers: { ...req.headers, host: target.host }
  };

  const upstream = http.request(options, (upRes) => {
    res.writeHead(upRes.statusCode, upRes.headers);
    upRes.pipe(res);
  });

  upstream.on("error", (err) => {
    res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ code: 502, message: "无法连接后端服务: " + err.message }));
  });

  req.pipe(upstream);
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith(API_PREFIX)) {
    proxyApi(req, res);
  } else {
    serveStatic(req, res);
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[frontend] 静态服务已启动: http://localhost:${PORT}`);
  console.log(`[frontend] /api 代理到后端: ${API_TARGET}`);
  console.log(`[frontend] 登录后首页: http://localhost:${PORT}/home`);
  console.log(`[frontend] 后台管理登录: http://localhost:${PORT}/admin`);
  console.log(`[frontend] 后台管理面板: http://localhost:${PORT}/admin/dashboard`);
});
