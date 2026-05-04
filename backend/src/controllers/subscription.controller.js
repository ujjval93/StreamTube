import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


//  TOGGLE SUBSCRIPTION
//  If already subscribed: unsubscribe (delete the document)
//  If not subscribed: subscribe   (create the document)
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    if (channelId.toString() === req.user._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const channel = await User.findById(channelId);

    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId,
    });

    if (existingSubscription) {
        // Already subscribed- unsubscribe
        await Subscription.findByIdAndDelete(existingSubscription._id);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { isSubscribed: false },
                    "Unsubscribed successfully"
                )
            );
    }

    // Not subscribed- subscribe
    await Subscription.create({
        subscriber: req.user._id,
        channel: channelId,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isSubscribed: true },
                "Subscribed successfully"
            )
        );
});


const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    const channel = await User.findById(channelId);

    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId),
            },
        },
        //Join subscriber user details
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    // Check if the subscriber is also subscribed back (mutual)
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribedToSubscriber",
                        },
                    },
                    {
                        $addFields: {
                            isSubscribedToChannel: {
                                $cond: {
                                    if: {
                                        $in: [
                                            new mongoose.Types.ObjectId(channelId),
                                            "$subscribedToSubscriber.subscriber",
                                        ],
                                    },
                                    then: true,
                                    else: false,
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                            isSubscribedToChannel: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                subscriber: { $first: "$subscriber" },
            },
        },
        {
            $project: {
                _id: 0,
                subscriber: 1,
                createdAt: 1,
            },
        },
        {
            $sort: { createdAt: -1 },
        },
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                subscribersCount: subscribers.length,
                subscribers,
            },
            "Subscribers fetched successfully"
        )
    );
});


const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriberId");
    }

    const subscriber = await User.findById(subscriberId);

    if (!subscriber) {
        throw new ApiError(404, "Subscriber not found");
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId),
            },
        },
        //Join channel details
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    // Get the latest video of each channel
                    {
                        $lookup: {
                            from: "videos",
                            localField: "_id",
                            foreignField: "owner",
                            as: "videos",
                            pipeline: [
                                {
                                    $match: { isPublished: true },
                                },
                                {
                                    $sort: { createdAt: -1 },
                                },
                                {
                                    $limit: 1,
                                },
                                {
                                    $project: {
                                        thumbnail: 1,
                                        title: 1,
                                        createdAt: 1,
                                    },
                                },
                            ],
                        },
                    },
                    // Get subscriber count of each channel
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "channelSubscribers",
                        },
                    },
                    {
                        $addFields: {
                            subscribersCount: { $size: "$channelSubscribers" },
                            latestVideo: { $first: "$videos" },
                            // Is the requesting user subscribed to this channel?
                            isSubscribed: {
                                $cond: {
                                    if: {
                                        $in: [
                                            new mongoose.Types.ObjectId(subscriberId),
                                            "$channelSubscribers.subscriber",
                                        ],
                                    },
                                    then: true,
                                    else: false,
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                            subscribersCount: 1,
                            isSubscribed: 1,
                            latestVideo: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                channel: { $first: "$channel" },
            },
        },
        {
            $project: {
                _id: 0,
                channel: 1,
                createdAt: 1,
            },
        },
        {
            $sort: { createdAt: -1 },
        },
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                subscribedChannelsCount: subscribedChannels.length,
                subscribedChannels,
            },
            "Subscribed channels fetched successfully"
        )
    );
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
};