import express, { Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";
import morgan from "morgan";

const app = express();

// Middleware para logging
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());
app.use(morgan("dev"));

// Middleware de logging mejorado
app.use((req, res, next) => {
  console.log("Request received:", {
    method: req.method,
    path: req.url,
    body: req.body,
    headers: req.headers,
  });
  next();
});

// Middleware para permitir CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Middleware de debug
app.use((req, res, next) => {
  console.log("Request interceptada:", {
    method: req.method,
    url: req.url,
    body: req.body,
    contentType: req.headers["content-type"],
  });
  next();
});

// Configuración actualizada del proxy para auth-service
app.use(
  "/auth",
  createProxyMiddleware({
    target: "http://auth-service:3001",
    changeOrigin: true,
    pathRewrite: {
      "^/auth": "",
    },
    onProxyReq: function (proxyReq, req, res) {
      console.log("Request interceptada:", {
        method: req.method,
        url: req.originalUrl,
        contentType: req.headers["content-type"],
      });
    },
    onProxyRes: function (proxyRes, req, res) {
      let responseBody = "";
      proxyRes.on("data", function (data) {
        responseBody += data;
      });
      proxyRes.on("end", function () {
        console.log("Respuesta completa del auth service:", {
          statusCode: proxyRes.statusCode,
          body: responseBody,
          headers: proxyRes.headers,
        });
      });
    },
    onError: (err: any, req, res) => {
      console.error("Error detallado:", {
        message: err.message,
        stack: err.stack,
        code: err.code,
      });
      res.status(500).json({
        error: "Proxy Error",
        details: err.message,
      });
    },
    logLevel: "debug",
  })
);

// Peticiones a /user/* → profile-service
app.use(
  "/user",
  createProxyMiddleware({
    target: "http://profile-service:3002",
    changeOrigin: true,
    pathRewrite: {
      "^/user": "", // Elimina /user del path antes de enviarlo al servicio
    },
    onProxyReq: (proxyReq, req) => {
      // Log para depuración
      console.log(
        `Proxy request to profile-service: ${req.method} ${req.path}`
      );
    },
  })
);

// Peticiones a /posts/* → posts-service
app.use(
  "/posts",
  createProxyMiddleware({
    target: "http://posts-service:3003",
    changeOrigin: true,
    onProxyReq: (proxyReq, req) => {
      // Log para depuración
      console.log(`Proxy request to posts-service: ${req.method} ${req.path}`);
    },
  })
);

// Ruta de salud para verificar que el API Gateway esté funcionando
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Middleware para manejar rutas no encontradas
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Not Found", path: req.path });
});

// Middleware para manejo de errores
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error details:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

// Iniciar el gateway en el puerto 3000
const PORT: number = parseInt(process.env.PORT || "3000");
app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
