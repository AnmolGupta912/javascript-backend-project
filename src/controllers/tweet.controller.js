import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {userId} = req.userId
    const {content} = req.body

    const tweet = await Tweet.create({
        owner: userId,
        content
    })

    if(!tweet){
        throw new ApiError(400, "Can't the tweet!!!")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Scuccessfully created tweet!!!"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }

    const tweets = await Tweet.find({owner: userId})

    if(!tweets){
        throw new ApiError(404, "No tweets found for this user")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Successfully fetched user tweets"))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )

    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId)

    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, null, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
