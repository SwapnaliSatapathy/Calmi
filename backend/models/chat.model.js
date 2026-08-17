import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        role: {
            type: String,
            enum: ['bot', 'user'],
            required: true
        },
        message: {
            type: String,
            required: true
        },
        // emotion: String,
        timestamp: {
            type: Date,
            default: Date.now,
        },
    });

export const Chat=mongoose.model("Chat",chatSchema)