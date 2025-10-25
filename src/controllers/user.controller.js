import jwt from "jsonwebtoken";

import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const generateAccessAndRefreshTokens = (user) => {
    try {
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating tokens:", error);
        throw new ApiError(500, "Internal server error :: token generation failed");
    }
}

const registerUser = asyncHandler(async (req, res, _) => {

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
    const avatarUploadResult = await uploadOnCloudinary(avatarLocalPath);

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
    // password will be hashed via pre-save hook
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

const loginUser = asyncHandler(async (req, res, _) => {
    // get username/email and password from req body
    const { identifier, password } = req.body; // identifier can be username or email

    if (!identifier || !password) {
        throw new ApiError(422, "Identifier and password are required");
    }

    // find user is in DB
    const user = await User.findOne({
        $or: [
            { username: identifier },
            { email: identifier }
        ]
    });

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    // compare password using method created in model
    const isPasswordValid = await user?.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Password is incorrect");
    }

    // if all ok, generate access and refresh tokens
    const { accessToken, refreshToken } = generateAccessAndRefreshTokens(user);


    // save refresh token in DB
    user.refreshTokens = refreshToken;
    await user.save({ validateBeforeSave: false }); // skip validation

    // Remove password and refreshTokens from user object before sending response
    delete user._doc.password;
    delete user._doc.refreshTokens;

    // send response with user data (without password) and tokens in cookies
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "Strict"
    }
    res.cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .status(200).json(new ApiResponse(200, "Login successful", { user, accessToken, refreshToken }));

});

const logoutUser = asyncHandler(async (req, res, _) => {
    // Clear refresh token from DB
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshTokens: "" }
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "Strict"
    };

    // removes a cookie from the user's browser
    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, "Logout successful"));
});

const refreshAccessToken = asyncHandler(async (req, res, _) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token is required");
    }

    try {
        const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Find user by ID
        const user = await User.findById(decoded?.userId).select("-password -refreshTokens");

        if (!user) {
            throw new ApiError(401, "Unauthorized: User not found");
        }

        if (user.refreshTokens !== incomingRefreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }

        // Generate new access token
        const { accessToken, refreshToken } = generateAccessAndRefreshTokens(user);

        // res.status(200).json(new ApiResponse(200, "Access token refreshed successfully", { accessToken }));
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict"
        })
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "Strict"
            })
            .status(200).json(new ApiResponse(200, "Access token refreshed successfully", { accessToken, refreshToken }));
    } catch (error) {
        throw new ApiError(401, `Unauthorized: Invalid token - ${error?.message}`);
    }
});

const changePassword = asyncHandler(async (req, res, _) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new ApiError(422, "Current password and new password are required");
    }

    if (newPassword.length < 6) {
        throw new ApiError(422, "New password must be at least 6 characters long");
    }

    // Find user in DB
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check if current password is correct
    const isPasswordValid = await user.isPasswordCorrect(currentPassword);
    if (!isPasswordValid) {
        throw new ApiError(401, "Current password is incorrect");
    }

    // Update password
    user.password = newPassword;
    await user.save({
        validateBeforeSave: false // skip other validations
    });

    res.status(200).json(new ApiResponse(200, "Password changed successfully"));
});

const getUser = asyncHandler(async (req, res, _) => {
    return res.status(200).json(
        new ApiResponse(200, "User fetched successfully", req.user)
    );
});

const updateUserDetails = asyncHandler(async (req, res, _) => {
    // get update data from req body
    const { username, email, fullName } = req.body;

    if (!username && !email && !fullName) {
        throw new ApiError(422, "At least one field (username, email, fullName) is required to update");
    }

    // get userId from req.user set by verifyJWT middleware
    const userId = req.user?._id;

    if (!userId) {
        throw new ApiError(404, "User not found");
    }

    // find user in DB and update
    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // update fields if provided
    if (username) user.username = username;
    if (email) user.email = email;
    if (fullName) user.fullName = fullName;

    await user.save({
        validateBeforeSave: false // skip other validations
    });

    // return updated user data
    res.status(200).json(new ApiResponse(200, "User details updated successfully", user));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(422, "Avatar image is required");
    }

    const avatarUrl = uploadOnCloudinary(avatarLocalPath).url;

    if (!avatarUrl) {
        throw new ApiError(500, "Avatar was not uploaded on cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatarUrl
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    res.status(200).json(new ApiResponse(200, "Updated susscessfully", user));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const imageLocalPath = req.file?.path;

    if (!imageLocalPath) {
        throw new ApiError(422, "Cover image is required");
    }

    const coverUrl = uploadOnCloudinary(imageLocalPath).url;

    if (!coverUrl) {
        throw new ApiError(500, "Cover image was not uploaded on cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: coverUrl
            }
        },
        {
            new: true
        }
    ).select("-password -refreshToken");

    res.status(200).json(new ApiResponse(200, "Updated susscessfully", user));
});

const getChannalDetails = asyncHandler(async (req, res) => {
    let userId = req.params;

    if (userId || !userId?.trim()) {
        throw new ApiError(422, "User id is not submitted");
    }

    await User.aggregate([
        {
            $match: {
                username: username
            }
        }, 
        {
            $lookup: {
                frome: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        }
    ])
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getUser,
    updateUserDetails,
    updateUserAvatar,
    updateUserCoverImage
};

/*
req.user = {
  _id: new ObjectId('68f9b250ea99784c8a5a2771'),
  username: 'tanuj911',
  email: 'hello@gmail.com',
  fullName: 'Tanuj sharma',
  avatar: 'https://res.cloudinary.com/djtncylvn/image/upload/v1761194575/jrf0nsztotfkzf89d9h4.png',
  coverImage: '',
  watchHistory: [],
  createdAt: 2025-10-23T04:42:56.256Z,
  updatedAt: 2025-10-24T06:30:16.422Z,
  __v: 0
}
*/