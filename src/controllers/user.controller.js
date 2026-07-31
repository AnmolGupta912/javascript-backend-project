import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadFileOnCloudinary } from "../utils/cloudinary.js"
import { ApiRespone } from '../utils/ApiRespone.js'
import { Router } from "express"
import jwt from "jsonwebtoken"

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false }) // by doing validation false we r tell mongoDB to ignore its custom validation like check requied field
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating the tokens!!!")
    }
}


// register user route 
const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    // req.body is for form/direct json data
    const {fullName, email, username, password} = req.body
    console.log("Email:", email);
    

    // here we can also do it one by one checking
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        // The some() method of Array instances returns true if it finds an element in the array that satisfies the provided testing function. Otherwise, it returns false.

        throw new ApiError(400, "all field are required !!!")
    }

    // User.findOne({email}) this is good if only checking by one field 
    const existedUser = await User.findOne({
        $or: [ { username }, { email } ]
    })
    
    if (existedUser) {
        throw new ApiError(409, "User with same email or username already exists !!!")
    }

    // req.files it is extra methods provided by multer
    const avatarLocalPath = req.files?.avatar[0]?.path
    console.log(avatarLocalPath );
    
    // const coverImageLocalPath = req.files?.coverImage[0]?.path this is not required field so it can be undefined and unable to store in db
    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImage =  req.files.coverImage.path
    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadFileOnCloudinary(avatarLocalPath)
    const coverImage = await uploadFileOnCloudinary(coverImageLocalPath)


    if (!avatar) {
        // checking avater is uploaded in cloudinary as it is required field
        throw new ApiError(400, "Avatar is required")
    }


    // we dont have to apply try-catch
    // creating a user object and entry in db 
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refershToken"
    )
    console.log(createdUser)

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user!!!")
    }

    return res.status(201).json(
        new ApiRespone(200, createdUser, "User registered successfully!!! ")
    )
})

// loginUser Route
const loginUser = asyncHandler( async (req, res) => {
    // req.body <= data
    // username || email
    // find user
    // password valid
    // generate & send token
    // send cookies

    const { username, email, password } = req.body

    if (!(username || email)) {
        throw new ApiError(401, "username or email are required!!!")
    }
    
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "user not found!!!")
    }

    const isPassowrdValid = await user.isPasswordCorrect(password)

    if (!isPassowrdValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)
    // console.log(accessToken,refreshToken);
    

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    console.log(loggedInUser);
    
    
    // now client cant mody thier cookies

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiRespone(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

    

})

// logout route 
const logoutUser = asyncHandler( async( req, res) => {
    await User.findByIdAndDelete(
        req.user?._id,
        {
            $unset: {
                refershToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiRespone(200, {}, "User loggedout successfully!!!"))
})

const refreshAccessToken = asyncHandler( async(req, res) => {
    const incomingRefreshToken = req.cookies?.refershToken || req.body.refershToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request!!!")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
         
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token!!!")
        }
    
        if (incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401, "Invalid refresh token!!!")
        }
    
        const {accessToken, newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id)
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json( new ApiRespone(200, {
            accessToken, refreshToken: newRefreshToken
        }, "Access token refreshed!!!"))

    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid refresh token!!!")
    }

}) 


export {
    registerUser, 
    loginUser ,
    logoutUser,
    refreshAccessToken
}