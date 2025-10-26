import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
    {
        videoFile: {
            type: String,    /// cloudinary URL
            required: [true, "Video file is required"],
        },
        thumbnail: {
            type: String,    /// cloudinary URL
            required: [true, "Thumbnail is required"],
        },
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
            max: [100, "Title must be at most 100 characters long"]
        },
        description: {
            type: String,
            required: false,
            trim: true,
            max: [500, "Description must be at most 500 characters long"]
        },
        duration: {
            type: Number,   // duration in seconds
            required: [true, "Duration is required"],
        },
        views: {
            type: Number,
            default: 0
        },
        visibility: {
            type: Boolean,
            default: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Owner is required"]
        },
    },
    {
        timestamps: true
    }
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);