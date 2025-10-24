import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
            min: [3, "Username must be at least 3 characters long"],
            max: [30, "Username must be at most 30 characters long"]
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            min: [5, "Email must be at least 5 characters long"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            min: [6, "Password must be at least 6 characters long"],
            max: [64, "Password must be at most 64 characters long"]
        },
        fullName: {
            type: String,
            required: [true, "Full name is required"],
            trim: true,
            index: true
        },
        avatar: {
            type: String,    /// cloudinary URL
            required: [true, "Avatar is required"],
        },
        coverImage: {
            type: String,    /// cloudinary URL
            required: false,
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        refreshTokens: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// mongoose middleware to hash password before saving
userSchema.pre("save", async function (next) {

    if (this.isModified("password")) {  // checks whether the password field was changed or set for the first time.
        
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);  // It takes the plain password and hashes it with the generated salt $2b$10$xC3...
    }

    next(); // Calls the next middleware or completes the save process.
});

// instance method to check if password is correct
userSchema.methods.isPasswordCorrect = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);  // true or false
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            userId: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            userId: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
}

export const User = mongoose.model("User", userSchema);