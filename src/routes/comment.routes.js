import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middle.js";
import {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
} from '../controllers/comment.controller.js'


const router = Router()
router.use(verifyJWT)

// route
router.route("/get-video-comment/:videoId").get(getVideoComments)
router.route("/add-comment/:videoId").post(addComment)
router.route("/update-comment/:commentId").patch(updateComment)
router.route("/delete-comment/:commentId").delete(deleteComment)


export default router