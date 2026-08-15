import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.


    const {username} = req.params
    const {userId} = req.params
    if (!username.trim()) {
            throw new ApiError(400, "username is missing!!!")
    }

    const totalVideos = await Video.countDocuments({owner: userId})
    const totalViews = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }
            }
        }
    ])
    const totalLikes = await Like.countDocuments({likedBy: userId})
    const totalSubscribers = await Subscription.countDocuments({channel: userId})

    if (!totalVideos && !totalViews && !totalLikes && !totalSubscribers) {
        throw new ApiError(404, "No stats found for this channel!!!")
    }

    return res.status(200).json(new ApiResponse(200, {totalVideos, totalViews, totalLikes, totalSubscribers}, "Channel stats fetched successfully!!!"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    // get owner(userId) from req.params
    // aggregate the Video collection by owner and return match owner
    // return these videos in the response
    
    const {userId} = req.params
    
    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
    ])
    
    if(!videos) {
        throw new ApiError(404, "No videos found for this channel")
    }

    return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"))
})


export {
    getChannelStats, 
    getChannelVideos
}