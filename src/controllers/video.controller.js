import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
// import { uploadFileOnCloudinary } from "../utils/cloudinary.js"
import {uploadFileOnCloudinary} from "../utils/cloudinary.js"
import { Video } from "../models/video.model.js"
import { ApiRespone } from "../utils/ApiRespone.js"


const publishAVideo = asyncHandler(async(req , res) => {
    // get title and description from req.body
    // upload videofile and thumbnail locally throught multer 
    // validate for files and uplaod it to cloudinary
    // get url of files from cloudianry and store it on db
    // sent res

    console.log("NORMAL LOG");
    console.error("ERROR LOG");
    process.stdout.write("STDOUT LOG\n");

    try {
        const {title, description} = req.body
        // console.log(title, description)
    
        if (!(title && description)) {
            throw new ApiError(404, "Title and description both are required!!!")
        }
    
        const videoFileLocalPath =  req.files?.videoFile[0]?.path 
        const thumbnailLocalPath =  req.files?.thumbnail[0]?.path 

        // console.log( await uploadFileOnCloudinary(videoFileLocalPath),  await uploadFileOnCloudinary(thumbnailLocalPath))
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


export {
    publishAVideo,
    getVideoById
}