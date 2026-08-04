import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadFileOnCloudinary } from "../utils/cloudinary.js"
import { ApiRespone } from '../utils/ApiRespone.js'
import { Router } from "express"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

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
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                refershToken: ""
            }
        },
        {
            returnDocument:  "after"
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
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken
    // console.log(incomingRefreshToken)
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request!!!")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
         
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token for user !!!")
        }
    
        console.log(user.refreshToken)
        console.log(incomingRefreshToken)
        if (incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401, "Invalid refresh token!!!")
        }
    
        const {accessToken, newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id)
    
        // console.log(accessToken, refreshToken)
        const options = {
            httpOnly: true,
            secure: true
        }

    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json( new ApiRespone(200, {
            accessToken, refreshToken: newRefreshToken
        }, "Access token refreshed!!!"))

    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid refresh token!!!")
    }

}) 

// change current password route
const changeCurrentPassword = asyncHandler( async(req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid Password!!!")
    }
    
    user.password = newPassword
    await user.save({validateBeforeSave: true})

    return res
    .status(200)
    .json(new ApiRespone(200, {}, "Password change successfully!!!"))
})

// get current user route
const getCurrentUser = asyncHandler( async(req, res) => {
    try {
        return res
        .status(200)
        .json(new ApiRespone(
            200,
            {
                ...req.user
            },
            "!!!"
        ))

        // const user = await User.findById(req.user?._id)
        // return res
        // .status(200)
        // .json(new ApiRespone(
        //     200,
        //     req.user,
        //     "current user fetched successfully!!!"
        // ))

    } catch (error) {
        throw new ApiError(400, error.message || "Can't get the current user!!!")
    }
})

// updateAccountDetail route
const updateAccountDetail = asyncHandler( async( req, res ) => {
    // get/check {fullName, email} to be change from req.body
    // findAndUpdate user from DB  
    // return the res

    const { fullName, email } = req.body

    if (!(fullName && email)) {
        throw new ApiError(200 , "All field are requied!!!")
    }

    const user =  await User.findByIdAndUpdate(
        req.user?._id,
        {
            fullName,
            email
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiRespone(200, user, "Account details updated successfully!!!"))

})

// updateUserAvatar route
const updateUserAvatar = asyncHandler(async(req, res) => {
    // by multer we storge avatar file to local storage   
    // store the file to cloudinary (if can, delete the old file from cloudinary)
    // get the cloud url of upload
    // findAndUpdate user 

    const avatarLocalPath = req.file

    // console.log(avatarLocalPath)
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is missing!!!")
    }

    const avatar = await uploadFileOnCloudinary(avatarLocalPath?.path)
    
    console.log(avatar?.url)
    if (!avatar.url) {
        throw new ApiError(500, "Something went wrong while uploading file on cloudinary!!!")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            avatar: avatar.url
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiRespone(200, {user}, "Avatar updated successfully!!!"))

})

// updateUserCoverImage route
const updateUserCoverImage = asyncHandler(async(req, res) => {
    // by multer we storge avatar file to local storage   
    // store the file to cloudinary (if can, delete the old file from cloudinary)
    // get the cloud url of upload
    // findAndUpdate user 

    const coverImageLocalPath = req.file

    if (!coverImageLocalPath) {
        throw new ApiError(400, "coverImage is missing!!!")
    }
    
    const coverImage = await uploadFileOnCloudinary(coverImageLocalPath.path)
    
    if (!coverImage.url) {
        throw new ApiError(500, "Something went wrong while uploading file on cloudinary!!!")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            coverImage: coverImage.url
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiRespone(200, {user}, "coverImage updated successfully!!!"))

})

// /c/:username route
const getUserChannelProfile = asyncHandler(async(req, res) => {


    const {username} = req.params // this means that username comeing from url

    if (!username.trim()) {
        throw new ApiError(400, "username is missing!!!")
    }


    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
            // this will select those documents where usename = username
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscriber"
            }
            // returns the documents with a new array field of channel(from video collection) added to each document called as subscriber.
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
            // returns the documents with a new array field of subscriber(from video collection) added to each document.
        },
        {
            $addFields:{
                subscribersCount: {
                    $size: "$subcribers"
                },
                channelsSubscriberToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed:{
                    $cond: {
                        if : {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
            // adds new fields add to document 
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscriberToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
            // decide the output
        }
    ])


    if (!channel?.length) {
        throw new ApiError(404, "Channel doesn't exist!!!")
    }

    return res
    .status(200)
    .json(
        new ApiRespone(200, channel[0], "User channel fetched successfully!!!")
    )

})

// /watch-history route
const getWatchHistory = asyncHandler( async(req, res) => {
    // console.log(new mongoose.Types.ObjectId(req.user._id));
    

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "user",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    console.log(user[0]);
    
    return res
    .status(200)
    .json( 
        new ApiRespone(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully!!!"
        )
    )
})

export {
    registerUser, 
    loginUser ,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetail,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}