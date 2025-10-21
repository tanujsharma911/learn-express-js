import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

const registerUser = asyncHandler(async (req, res, next) => {

    // Extract body data and file paths from req
    const newUser = {
        fullName: req.body.fullName,
        email: req.body.email,
        username: req.body.username.toLowerCase(),
        password: req.body.password
        // "avatar" and "coverImage" will be set after upload to Cloudinary
    };

    // Check data validation
    if (newUser.password.length < 6) {
        throw new ApiError(422, "Password must be at least 6 characters long");
    }
    if (!newUser.email.includes("@") || newUser.email.length < 6) {
        throw new ApiError(422, "Invalid email address");
    }
    if (newUser.username.length < 3) {
        throw new ApiError(422, "Username must be at least 3 characters long");
    }
    if (!newUser.fullName || newUser.fullName.trim() === "") {
        throw new ApiError(422, "Full name is required");
    }

    // Check if username or email already exists
    const existingUser = await User.findOne({
        $or: [{ email: newUser.email }, { username: newUser.username }]
    });
    if (existingUser) {
        throw new ApiError(409, "Username or email already exists");
    }

    // AVATAR
    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(422, "Avatar image is required");
    }

    // Upload avatar to Cloudinary
    const avatarUploadResult = await uploadToCloudinary(avatarLocalPath);

    // Check upload results
    if (!avatarUploadResult?.secure_url) {
        throw new ApiError(500, "Avatar upload to Cloudinary failed");
    }

    // Set Cloudinary URLs to newUser object
    newUser.avatar = avatarUploadResult.secure_url;


    // COVER IMAGE (optional)
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    if (coverImageLocalPath) {
        // Upload coverImage to Cloudinary
        const coverImageUploadResult = await uploadToCloudinary(coverImageLocalPath);

        // Check upload results
        if (!coverImageUploadResult?.secure_url) {
            throw new ApiError(500, "File upload to Cloudinary failed");
        }

        // Set Cloudinary URLs to newUser object
        newUser.coverImage = coverImageUploadResult.secure_url;
    }
    else {
        newUser.coverImage = "";
    }

    // Create new user in DB
    const user = await User.create(newUser);


    // Check if user created
    const createdUser = await User.findById(user._id).select("-password -refreshTokens");
    if (!createdUser) {
        throw new ApiError(500, "User creation failed");
    }

    res.status(201).json(
        new ApiResponse(201, "User registered successfully", createdUser)
    );

});

export { registerUser }