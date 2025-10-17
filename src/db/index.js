import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from "dotenv";

dotenv.config();

const connectToDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONOGODB_URL + `/${DB_NAME}`);
        console.log("\n✅ Connected to MongoDB :: Database:", connectionInstance.connection.host);
    } catch (error) {
        console.log("❤️‍🩹 Error connecting to MongoDB:", error);
        process.exit(1);
    }
};

export default connectToDB;
