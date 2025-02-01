import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/clodinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    //validation - not enpty
    // cheak if user alredy exists : username, email
    // cheak for images , cheak for avatar
    // upload them to clodinary
    // create user object - create entry in db
    // remove password and refresh token from response
    // cheak for user creation
    // return res
    const { fullName, email, username, password } = req.body
    // console.log("email", email);

    if (
        [fullName, email, username, password].some((field) => {
            field?.trim() === ""
        })
    ) {
        throw new ApiError(400, "fullname required")
    }
    const existUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if (existUser) {
        throw new ApiError(409, "user or email already exists")
    }
    const avatarLocalPath = req.files?.avatar[0].path;
    const coveImageLocalPath = req.files?.avatar[0].path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coveImageLocalPath)
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500, "server error while registering the user")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

export { registerUser }