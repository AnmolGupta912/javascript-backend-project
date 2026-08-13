import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiRespone} from "../utils/ApiRespone.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {userId} = req.userId
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
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
