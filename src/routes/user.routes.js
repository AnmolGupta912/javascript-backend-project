import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory, changeCurrentPassword } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middle.js";

const router = Router()

router.route("/register").post(
    // upload is a middleware which comes b4 the server res
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)
router.route("/login").post( loginUser)

// secure routes
router.route("/logout").post(verifyJWT ,logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").patch(verifyJWT, changeCurrentPassword)

router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
router.route("/get-user-channel-profile/:username").get(verifyJWT, getUserChannelProfile) // this is a get route
router.route("/watch-history").get(verifyJWT, getWatchHistory) // this is also a get route


export default router