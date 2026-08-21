import {Router} from 'express';
import { verifyJWT } from '../middleware/auth.middle.js';
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from '../controllers/subscription.contoller.js';

const router = Router()
router.use(verifyJWT)

console.log("SUBSCRIPTION ROUTER LOADED");
// routes for subscription
router.route("/toggle-subscription/:channelId").post(toggleSubscription)
router.route("/get-channel-subscribers/:channelId").get(getUserChannelSubscribers)
router.route("/get-subscribed-channels/:subscriberId").get(getSubscribedChannels)


export default router