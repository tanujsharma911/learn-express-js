import mongoose, { mongo } from "mongoose";

const interactionSchema = new mongoose.Schema(
    {
        video: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            required: true
        },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        action: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Interaction = mongoose.model("Interaction", interactionSchema);