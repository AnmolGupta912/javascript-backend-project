import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiRespone} from "../utils/ApiRespone.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const comments = await Comment.aggregate([
        {
            $match: {
                video: videoId
            }
        },
        {
            $limit: limit*page
        }
    ])

    if (!comments) {
        throw new ApiError(400, "problem while fetching comments!!!")
    }

    return res
    .status(200)
    .json(new ApiRespone(200, comments, "Successfully fetched the comments!!!"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {userId} = req.user?._id
    const {content} = req.body

    const comment = await Comment.create({
        owner: userId,
        content
    })

    if(!comment) {
        throw new ApiError(400, "problem while creating!!!")
    }

    return res
    .status(200)
    .json(new ApiRespone(200, comment, "Successfully created the comment!!!"))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params 
    const {content} = req.body
    
    const comment = await Comment.findByIdAndUpdate(commentId, {content}, {new: true})

    if(!comment) {
        throw new ApiError(400, "problem while updating comment!!!")
    }

    return res
    .status(200)
    .json(new ApiRespone(200, comment, "Successfully updated the comment!!!"))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    const comment = await Comment.findByIdAndDelete(commentId)

    if(!comment) {
        throw new ApiError(400, "problem while deleting comment!!!")
    }

    return res
    .status(200)
    .json(new ApiRespone(200, comment, "Successfully deleted the comment!!!"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
