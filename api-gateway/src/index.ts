const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();

// Todas las peticiones a /auth se envían al servicio auth-service
app.use(
  "/auth",
  createProxyMiddleware({
    target: "http://auth-service:3001",
    changeOrigin: true,
  })
);

// Peticiones a /profile → profile-service
app.use(
  "/profile",
  createProxyMiddleware({
    target: "http://profile-service:3002",
    changeOrigin: true,
  })
);

// Peticiones a /posts → posts-service
app.use(
  "/posts",
  createProxyMiddleware({
    target: "http://posts-service:3003",
    changeOrigin: true,
  })
);

// Iniciar el gateway en el puerto 3000
app.listen(3000, () => {
  console.log("API Gateway listening on port 3000");
});
