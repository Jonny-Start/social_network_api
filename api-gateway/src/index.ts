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

// Peticiones a /posts/* → posts-service
app.use(
  "/posts",
  createProxyMiddleware({
    target: "http://posts-service:3002",
    pathRewrite: {
      "^/posts": "",
    },
    changeOrigin: true,
    timeout: 30000,
    proxyTimeout: 30000,
    ws: true, // Soporte para WebSockets
    // Remove buffer option as it's not compatible
    onProxyReq: function (proxyReq, req, res) {
      // Si hay un body, asegurarse de que se maneje correctamente
      if (req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }

      console.log("Request al servicio de posts:", {
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        headers: proxyReq.getHeaders(),
      });
    },
    onProxyRes: function (proxyRes, req, res) {
      let responseBody = "";
      proxyRes.on("data", function (data) {
        responseBody += data.toString("utf8");
      });
      proxyRes.on("end", function () {
        try {
          const parsedBody = responseBody ? JSON.parse(responseBody) : "";
          console.log("Respuesta del servicio de posts:", {
            statusCode: proxyRes.statusCode,
            body: parsedBody,
            headers: proxyRes.headers,
          });
        } catch (e) {
          console.error("Error parsing response:", e);
        }
      });
    },
    onError: (err: Error & { code?: string }, req, res) => {
      console.error("Error en proxy de posts:", {
        message: err.message,
        stack: err.stack,
        code: err.code || "UNKNOWN_ERROR",
        path: req.path,
      });

      res.status(502).json({
        error: "Error de comunicación con el servicio de posts",
        message: err.message,
        code: err.code || "UNKNOWN_ERROR",
      });
    },
  })
);

// Peticiones a /user/* → profile-service
app.use(
  "/user",
  createProxyMiddleware({
    target: "http://profile-service:3003",
    pathRewrite: {
      "^/user": "",
    },
    changeOrigin: true,
    timeout: 30000,
    proxyTimeout: 30000,
    ws: true, // Soporte para WebSockets
    // Remove buffer option as it's not compatible
    onProxyReq: function (proxyReq, req, res) {
      // Si hay un body, asegurarse de que se maneje correctamente
      if (req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }

      console.log("Request al servicio de user:", {
        method: req.method,
        url: req.originalUrl,
        body: req.body,
        headers: proxyReq.getHeaders(),
      });
    },
    onProxyRes: function (proxyRes, req, res) {
      let responseBody = "";
      proxyRes.on("data", function (data) {
        responseBody += data.toString("utf8");
      });
      proxyRes.on("end", function () {
        try {
          const parsedBody = responseBody ? JSON.parse(responseBody) : "";
          console.log("Respuesta del servicio de user:", {
            statusCode: proxyRes.statusCode,
            body: parsedBody,
            headers: proxyRes.headers,
          });
        } catch (e) {
          console.error("Error parsing response:", e);
        }
      });
    },
    onError: (err: Error & { code?: string }, req, res) => {
      console.error("Error en proxy de user:", {
        message: err.message,
        stack: err.stack,
        code: err.code || "UNKNOWN_ERROR",
        path: req.path,
      });

      res.status(502).json({
        error: "Error de comunicación con el servicio de user",
        message: err.message,
        code: err.code || "UNKNOWN_ERROR",
      });
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

app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(504).json({
      error: "Gateway Timeout",
      message: "La solicitud ha excedido el tiempo máximo permitido",
    });
  });
  next();
});

// Middleware mejorado para manejo de errores
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error en API Gateway:", {
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = (err as any).statusCode || 500;

  res.status(statusCode).json({
    error: err.name || "Error Interno",
    message: err.message,
    path: req.path,
    timestamp: new Date().toISOString(),
    requestId: req.headers["x-request-id"],
  });
});

// Iniciar el gateway en el puerto 3000
const PORT: number = parseInt(process.env.PORT || "3000");
app.listen(PORT, () => {
  console.log(`API Gateway listening on port ${PORT}`);
});
