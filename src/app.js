import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

// Initialize Express App
const app = express();

// Middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
}));



// Body Parsers
app.use(express.json({ limit: '100kb' }));
app.use(urlencoded({ extended: true, limit: '100kb' }));
app.use(express.static('public'));

app.use(cookieParser());

// Routes
import userRoutes from "./routes/user.route.js";
import healthChecker from "./routes/health.route.js";
import videoRouter from "./routes/video.route.js";
import commentRouter from "./routes/comment.route.js";
import interactionRouter from "./routes/interaction.route.js";

// Routes Declaration
app.use("/api/health", healthChecker);
app.use("/api/users", userRoutes);
app.use("/api/videos", videoRouter);
app.use("/api/comments", commentRouter);
app.use("/api/interaction", interactionRouter);

export default app;