import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    // get all videos(thumbnail url, title, duration) based on query, sort, pagination

    res.status(200).json(new ApiResponse(200, "OK"));
})

const uploadVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // verify user
    // get video from multer
    // check it is video
    // upload video to cloudinary
    // get video info - duration
    // create video document
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // Get video url from document
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    // Verify user
    // Match user with video owner
    // delete video document from DB
    // delete video from cloudinary
})

export {
    getAllVideos,
    uploadVideo,
    getVideoById,
    deleteVideo,
}