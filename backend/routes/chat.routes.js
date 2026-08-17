import { Router } from "express";
import { chatWithGemini } from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { clearChat } from "../controllers/chat.controller.js";

const router=Router()

router.route("/chat").post(verifyJWT,chatWithGemini);
router.post("/clear-chat", verifyJWT, clearChat);

export default router;