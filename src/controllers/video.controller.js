import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import {uploadFileOnCloudinary} from "../utils/cloudinary.js"
import { Video } from "../models/video.model.js"
import { ApiRespone } from "../utils/ApiRespone.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})


const publishAVideo = asyncHandler(async(req , res) => {
    // get title and description from req.body
    // upload videofile and thumbnail locally throught multer 
    // validate for files and uplaod it to cloudinary
    // get url of files from cloudianry and store it on db
    // sent res

    try {
        const {title, description} = req.body
    
        if (!(title && description)) {
            throw new ApiError(404, "Title and description both are required!!!")
        }
    
        const videoFileLocalPath =  req.files?.videoFile[0]?.path 
        const thumbnailLocalPath =  req.files?.thumbnail[0]?.path 

        const videoFile = await uploadFileOnCloudinary(videoFileLocalPath)
        const thumbnail = await uploadFileOnCloudinary(thumbnailLocalPath)

        console.log(videoFile, thumbnail)

        if (!(videoFile.url && thumbnail.url)) {
            throw new ApiError(500, "Can't get the video or thumbnail url!!!")
        }


        const video = await Video.create({
            videoFile: videoFile?.url,
            thumbnail: thumbnail?.url,
            title,
            description,
            duration: videoFile?.duration
        })

        if (!video) {
            throw new ApiError(500, "cant save video while storing it to db!!!")
        }
        
        return res
        .status(200)
        .json( new ApiRespone(200, video, "Published video successfully!!!"))


    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong while publishing a video!!!")
    }

})

const getVideoById = asyncHandler( async(req, res) => {
    // get videoId from params 
    // search in the video models
    // send res

    const { videoId } = req.params

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "Can't get the video!!!")
    }
    
    return res
    .status(200)
    .json(new ApiRespone(200, video, "Video fetched successfully!!!"))

})

const updateVideo = asyncHandler(async(req, res) => {
    //TODO: update video details like title, description, thumbnail
    // videoId <= req.params
    // upload thumbnail from local to cloudinay as well check 
    // get title and description <= req.body
    // findbyidAndUpdate then send res

    const { videoId } = req.params

    const thumbnailLocalPath = req.file?.thumbnail?.path

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail is missing!!!")
    }

    const thumbnail = await uploadFileOnCloudinary(thumbnailLocalPath)
     if (!thumbnail.url) {
            throw new ApiError(500, "Can't get the thumbnail url!!!")
        }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            title,
            description,
            thumbnail: thumbnail?.url
        },
        {
            new: true
        })

    if (!video) {
        throw new ApiError(400, "Can't update the video!!!");
    }

    return res
    .status(200)
    .json(new ApiRespone(200, video, "Video updated successfully!!!"))

})

const deleteVideo = asyncHandler(async(req, res) => {
    //TODO: delete video
    // videoId <= req.params
    // findbyidAndDelete then send res

    const { videoId } = req.params

    const video = await Video.findByIdAndDelete(videoId)
    if (!video) {
        throw new ApiError(400, "Can't delete the video!!!");
    }

    return res
    .status(200)
    .json(new ApiRespone(200, video, "Video deleted successfully!!!"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400, "Can't find the video!!!");
    }

    video.isPublished = !video.isPublished
    await video.save({ validateBeforeSave: false })

    return res
    .status(200)
    .json(new ApiRespone(200, video, "Video publish status updated successfully!!!"))

})


export {
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    
}