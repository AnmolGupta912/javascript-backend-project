import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist
    // take name and description from req.body and owner from req.user._id
    // create a new playlist and save it to the database


    const {name, description} = req.body
    const owner = req.user._id

    const playlist = await Playlist.create({
        name,
        description,
        owner
    })
    // video is refference we will do push id to array then \
    // .save() 
    // where is videos? It should be an empty array by default, so we don't need to set it explicitly.

    if (!playlist) {
        throw new ApiError(500, "Failed to create playlist")
    }

    return res.status(201).json(new ApiResponse(201, playlist, "Playlist created successfully"))

})


const getUserPlaylists = asyncHandler(async (req, res) => {
    //TODO: get user playlists
    // get userId form param
    // search in playlist model by userId
    // and return res with playlist of that user
    

    const {userId} = req.params

    const playlist = await Playlist.find({owner: userId})

    if (!playlist){
        throw new ApiError(400, "Cant get the playlist!!!")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, playlist, "Successfully fetched playlist!!!"))
})


const getPlaylistById = asyncHandler(async (req, res) => {
    //TODO: get playlist by id
    // Get Playlist id form params
    // Do model.findById to get the document 


    const {playlistId} = req.params

    const playlist = await Playlist.findById(playlistId)

    if (!playlist){
        throw new ApiError(400, "Cant get the playlist!!!")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, playlist, "Successfully fetched playlist By Id!!!"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    // Get playlist id from params
    // get the document as above
    // push videoId and save 
    // return res

    const {playlistId, videoId} = req.params

    let playlist = await Playlist.findById(playlistId)

    if (!playlist){
        throw new ApiError(400, "Cant get the playlist!!!")
    }

    await playlist.videos?.push(videoId)
    playlist = await playlist.save({validateBeforeSave: true})

    return res
    .status(200)
    .json( new ApiResponse(200, playlist, "Successfully added video to playlist!!!"))    
})


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // TODO: remove video from playlist


    const {playlistId, videoId} = req.params

    const playlist = await Playlist.findByIdAndUpdate(
        playlist,
        {
            $pull: {
                video: videoId
            }
        },
        {new: true} // this will give me new document
    )

    if (!playlist){
        throw new ApiError(400, "Cant get the playlist!!!")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, playlist, "Successfully remove video from playlist!!!"))  
})

const deletePlaylist = asyncHandler(async (req, res) => {
    // TODO: delete playlist
    const {playlistId} = req.params
    
    const playlist = await Playlist.findByIdAndDelete(playlistId)
    
    if (!playlist){
        throw new ApiError(400, "Cant get the playlist!!!")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, playlist, "Successfully deleted the Playlist!!!"))  

})

const updatePlaylist = asyncHandler(async(req,res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name,
            description
        },
        {new: true}
    )

    if (!playlist){
        throw new ApiError(400, "Cant get the playlist!!!")
    }

    return res
    .status(200)
    .json( new ApiResponse(200, playlist, "Successfully update the Playlist!!!")) 
})


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}