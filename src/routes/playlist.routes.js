import { Router } from "express";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middleware/auth.middle.js";

const router = Router();
router.use(verifyJWT); // Apply verifyToken middleware to all routes in this router

// routes
router.route("/create-playlist").post(createPlaylist);
router.route("/get-user-playlists/:userId").get(getUserPlaylists);
router.route("/get-playlist-by-id/:playlistId").get(getPlaylistById);
router.route("/add-video-to-playlist/:playlistId").post(addVideoToPlaylist);
router.route("/remove-video-from-playlist/:playlistId").post(removeVideoFromPlaylist);
router.route("/delete-playlist/:playlistId").delete(deletePlaylist);
router.route("/update-playlist/:playlistId").patch(updatePlaylist);


export default router;
