import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middle.js";
import { upload } from "../middleware/multer.middleware.js";
import { publishAVideo, getVideoById, updateVideo, deleteVideo, togglePublishStatus } from "../controllers/video.controller.js";

const router = Router()

router.route("/publish-video").post(
    verifyJWT,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishAVideo
)

router.route("/c/get-video/:videoId").get(getVideoById)
router.route("/c/update-video/:videoId").patch(updateVideo)
router.route("/c/delete-video/:videoId").post(deleteVideo)
router.route("/c/toggle-publish-status/:videoId").post(togglePublishStatus)


export default router