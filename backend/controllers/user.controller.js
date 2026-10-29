import { User } from "../models/user.model.js";

//access and refresh tokens generation
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        //storing refresh token in the database
        user.refreshToken = refreshToken;
        //saving without validation
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw error;
    }
}

//register controller
const registerUser = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !password || !email) {
            return res.status(400).json({ message: "No field should be empty!" })
        }

        const existedUser = await User.findOne({email});

        if (existedUser) {
            return res.status(409).json({ message: "User with username or email already exists!" });
        }

        const user = await User.create({
            fullName,
            email,
            password
        })

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if (!createdUser) {
            return res.status(400).json({ message: "Something went wrong while registering the user" })
        }

        return res.status(201).json({
            message: "User Registered successfully!",
            user: { id: createdUser._id, name: createdUser.fullName, email: createdUser.email }
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Something went wrong!" });
    }
}

//login controller
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const user = await User.findOne({email});

        if (!user) {
            return res.status(404).json({ message: "user does not exist" });
        }

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password!" });
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json({
                message: "User logged in successfully",
                user: { id: loggedInUser._id, name: loggedInUser.fullName, email: loggedInUser.email }
            })

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Something went wrong" })
    }
}

//logout controller
const logoutUser = async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 
            }
        },
        {
            new: true
        }
    )

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/"
    };

    return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json({message:"user logged out successfully"})
}

export {
    registerUser,
    loginUser,
    logoutUser
}