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

// Routes Declaration
app.use("/api/users", userRoutes);

export default app;