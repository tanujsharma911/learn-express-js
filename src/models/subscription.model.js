import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
{
    subscriber: {
        type: mongoose.Schema.Types.ObjectId,  // subscribed by
        ref: "User",
        required: true,
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,  // channel being subscribed to
        ref: "User",
        required: true,
    }
},
{
    timestamps: true,
});

export const Subscription = mongoose.model("Subscription", subscriptionSchema);