import connectToDB from "./db/index.js";
import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

connectToDB()
    .then(() => {

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log('\x1b[32m%s\x1b[0m', `⚙️  Server is running on port http://localhost:${PORT} ...`);
        });
    })




















/*  Approach 1: Using IIFE (Immediately Invoked Function Expression)

import dotenv from "dotenv";

dotenv.config();

import express from "express";

const app = express();

(async () => {
    try {
        await mongoose.connect(process.env.MONOGODB_URL + `/${DB_NAME}`);
        console.log("\n✅ Connected to MongoDB");

        app.on("error", (error) => {
            console.error("💔 Error in Express app:", error);
        });

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`✅ Server is running on port http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❤️‍🩹 Error connecting to MongoDB:", error);
    }
})();

*/