import {Router} from 'express';
import { verifyJWT } from '../middleware/auth.middle.js';

const router = Router()
router.use(verifyJWT)

import { createTweet, getUserTweets, updateTweet, deleteTweet } from '../controllers/tweet.controller.js';
// tweet routes
router.route("/create-tweet").post(createTweet)
router.route("/get-user-tweets/:userId").get(getUserTweets)
router.route("/update-tweet/:tweetId").patch(updateTweet)
router.route("/delete-tweet/:tweetId").post(deleteTweet)

export default router