import app, { startServer } from "./api/index";

// Only start standalone HTTP server when not running in serverless environments (like Vercel)
if (!process.env.VERCEL) {
  startServer();
}

export default app;
