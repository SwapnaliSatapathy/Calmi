import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log(token);
        if (!token) {
            return res.status(401).json({ message: "Unauthorized request" });
        }
        
        console.log("Access token received:", req.cookies?.accessToken);

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            return res.status(401).json({ message: "Invalid access token" });
        }
        console.log("Decoded user:", decodedToken);
        console.log("Fetched user:", user);
        req.user = user;
        next()
    } catch (error) {
        return res.status(401).json({ message: error?.message || "Invalid access token" });
    }
    
}