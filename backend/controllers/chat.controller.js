import mongoose from "mongoose";
import dotenv from "dotenv";
// import { detectEmotion } from "../services/emotionService.js";
import { Chat } from "../models/chat.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const chatWithGemini = async (req, res) => {
  try {
    const { message: userMessage } = req.body;
    const userId = req.user.id; // extracted from token

    // const emotionResult = await detectEmotion(userMessage);
    // const emotion = emotionResult[0]?.label || "neutral";

    const previousChats = await Chat.find({ userId })
      .sort({ timestamp: -1 })
      .limit(5)
      .lean();

    const history = previousChats
      .reverse()
      .map(
        (chat) => `${chat.role === "user" ? "User" : "Calmi"}: ${chat.message}`
      )
      .join("\n");

    const sensitiveWords = ["suicide", "die", "kill", "end my life"];
    let containsSensitiveWord = false;
    sensitiveWords.forEach((word) => {
      if (userMessage.toLowerCase().includes(word)) {
        containsSensitiveWord = true;
      }
    });

    if (containsSensitiveWord) {
      return res.status(200).json({ reply: "I'm really sorry that you're feeling like this right now. You don’t have to go through this alone — help is available and you deserve support💛.You can call AASRA Helpline (91-9820466726) to talk to someone who cares and can listen to you. If you’d like, I can stay here with you and we can talk about what’s been making things so hard lately. Would you like to tell me a bit about what’s been happening?" })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let prompt;

    if (previousChats.length > 0) {
      prompt = `
You are Calmi, a gentle and supportive mental health chatbot.
Your goal is to provide emotional support, comfort, and guidance for people feeling sad, anxious, lonely, or stressed.
You are not a medical professional and should never give medical or diagnostic advice.
If a user asks for ways to feel better, you may gently suggest healthy coping methods such as deep breathing, journaling, listening to soft music, or talking to a friend.
If a user asks unrelated questions (like about coding, celebrities, or random facts), politely say:
"I'm here to support you emotionally. Could we talk about how you’re feeling instead?"
Always keep your tone calm, kind, and empathetic.

Here’s what you and the user talked about before:
${history}

Now, the user says:
"${userMessage}"

Calmi:
`;
    } else {
      prompt = `
You are Calmi, a gentle and supportive mental health chatbot.
Your goal is to provide emotional support, comfort, and guidance for people feeling sad, anxious, lonely, or stressed.
You are not a medical professional and should never give medical or diagnostic advice.
If a user asks for ways to feel better, you may gently suggest healthy coping methods such as deep breathing, journaling, listening to soft music, or talking to a friend.
If a user asks unrelated questions (like about coding, celebrities, or random facts), politely say:
"I'm here to support you emotionally. Could we talk about how you’re feeling instead?"
Always keep your tone calm, kind, and empathetic.

User: "${userMessage}"
Calmi:
`;
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 200, // allows mid-length replies
        temperature: 0.9, // keeps it warm and human
      },
    });

    const botReply =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm here for you. It's okay to feel this way — we can take it one step at a time.";

    await Chat.create({ userId, role: "user", message: userMessage });
    await Chat.create({ userId, role: "bot", message: botReply });

    res.status(200).json({ reply: botReply });
  } catch (error) {
    console.error("Gemini API error:", error);
    res.status(500).json({
      message: error.message || "Something went wrong with Gemini API.",
    });
  }
};

// ----------------- New Clear Chat Function -----------------
export const clearChat = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id); // <-- fixed here

    const result = await Chat.deleteMany({ userId });

    console.log("Deleted count:", result.deletedCount);
    res.status(200).json({ message: "Chat cleared successfully" });
  } catch (error) {
    console.error("Error clearing chat:", error);
    res.status(500).json({ message: "Failed to clear chat" });
  }
};

