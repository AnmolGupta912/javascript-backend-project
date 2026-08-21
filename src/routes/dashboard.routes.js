import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middle.js";
import {
    getChannelStats, 
    getChannelVideos
} from "../controllers/dashboard.controller.js"

const router = Router()
router.use(verifyJWT)

// routes
router.route("/get-channel-stats/:username/:userId").get(getChannelStats)
router.route("/get-channel-videos/:userId").get(getChannelVideos)

export default router
