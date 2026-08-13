import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video
    // get videoId from req.params
    // check if videoId is a valid ObjectId
    // get userid from req.user
    // check if the user has already liked the video
    // if yes, remove the like
    // if no, add the like
    // return the response with the updated like count

    const {videoId} = req.params
    const {userId} = req.userId

    if (!isValidObjectId(videoId)){
        throw new ApiError(400, "Cant get the videoId!!!")
    }

    const like = await Like.findOne({likedBy: userId, video: videoId}, async (err, like) => {
        if (err) {
            throw new ApiError(500, "Error finding like")
        }
        if (like) {
            // User has already liked the video, so remove the like
            await Like.deleteOne({likedBy: userId, video: videoId})
        } else {
            // User has not liked the video, so add the like
            await Like.create({
                video: videoId,
                likedBy: userId
            })
        }
    })

    return res.status(200).json(new ApiResponse(200, "Video like toggled successfully", null))

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}