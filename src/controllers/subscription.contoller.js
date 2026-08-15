import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import mongoose, {isValidObjectId} from "mongoose"
import { Subscription } from "../models/subscription.model.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    
    // TODO: toggle subscription
    // what is the use of this controller? This controller is used to toggle the subscription of a user to a channel. If the user is already subscribed to the channel, then unsubscribe the user from the channel. If the user is not subscribed to the channel, then subscribe the user to the channel.

    
    const {channelId} = req.params
    const userId = req.user._id

    if(!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId")
    }
    
    const subscription = await Subscription.findOne({subscibers: userId, channel: channelId})

    if(subscription) { 
        await Subscription.deleteOne({subscibers: userId, channel: channelId})
        return res.status(200).json(new ApiResponse(200, {subscribed: false}, "Unsubscribed successfully"))
    } else {
        await Subscription.create({subscibers: userId, channel: channelId})
        return res.status(200).json(new ApiResponse(200, {subscribed: true}, "Subscribed successfully"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}