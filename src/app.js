import express, { urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
}));

app.use(express.json({ limit: '100kb' }));
app.use(urlencoded({ extended: true, limit: '100kb' }));
app.use(express.static('public'));

app.use(cookieParser());

export default app;