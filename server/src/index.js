import "dotenv/config";

import http from "node:http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { Server as SocketIOServer } from "socket.io";

import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/error.js";
import authRouter from "./modules/auth/auth.routes.js";
import chatRouter from "./modules/chat/chat.routes.js";
import adminRouter from "./modules/admin/admin.routes.js";
import { attachSocket } from "./socket/index.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN.split(",").map((s) => s.trim()),
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
if (env.NODE_ENV !== "test") app.use(morgan("tiny"));

app.get("/health", (_req, res) => res.json({ ok: true, service: "baatkarte" }));
app.use("/api/auth", authRouter);
app.use("/api/chat", chatRouter);
app.use("/api/admin", adminRouter);

app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: env.CLIENT_ORIGIN.split(",").map((s) => s.trim()), credentials: true },
});

// Make io accessible to controllers via req.app.get("io")
app.set("io", io);

attachSocket(io);

await connectDb();
server.listen(env.PORT, () => {
  console.log(`[baatkarte] listening on :${env.PORT}`);
});