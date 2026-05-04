import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


//  GET CHANNEL STATS
//  Total videos, total views, total subscribers, total likes
const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = new mongoose.Types.ObjectId(req.user._id);

    const videoStats = await Video.aggregate([
        // All videos owned by this channel
        {
            $match: {
                owner: channelId,
            },
        },
        // Join likes for each video
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "videoLikes",
            },
        },
        // Group all videos into one stats document
        {
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: { $size: "$videoLikes" } },
                publishedVideos: {
                    $sum: {
                        $cond: [{ $eq: ["$isPublished", true] }, 1, 0],
                    },
                },
                unpublishedVideos: {
                    $sum: {
                        $cond: [{ $eq: ["$isPublished", false] }, 1, 0],
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                totalVideos: 1,
                totalViews: 1,
                totalLikes: 1,
                publishedVideos: 1,
                unpublishedVideos: 1,
            },
        },
    ]);

    const subscriberStats = await Subscription.aggregate([
        {
            $match: {
                channel: channelId,
            },
        },
        {
            $group: {
                _id: null,
                totalSubscribers: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                totalSubscribers: 1,
            },
        },
    ]);

    // Merge both aggregation results with safe fallback defaults
    const stats = {
        totalSubscribers: subscriberStats[0]?.totalSubscribers ?? 0,
        totalVideos: videoStats[0]?.totalVideos ?? 0,
        totalViews: videoStats[0]?.totalViews ?? 0,
        totalLikes: videoStats[0]?.totalLikes ?? 0,
        publishedVideos: videoStats[0]?.publishedVideos ?? 0,
        unpublishedVideos: videoStats[0]?.unpublishedVideos ?? 0,
    };

    return res
        .status(200)
        .json(
            new ApiResponse(200, stats, "Channel stats fetched successfully")
        );
});


//  GET CHANNEL VIDEOS
//  → All videos uploaded by the logged-in channel (with likes & pagination)
const getChannelVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortType = "desc",
        query,
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (pageNumber < 1 || limitNumber < 1) {
        throw new ApiError(400, "Page and limit must be positive integers");
    }

    const allowedSortFields = ["createdAt", "updatedAt", "views", "duration", "title"];
    if (!allowedSortFields.includes(sortBy)) {
        throw new ApiError(
            400,
            `sortBy must be one of: ${allowedSortFields.join(", ")}`
        );
    }

    const sortOrder = sortType === "asc" ? 1 : -1;

    const matchStage = {
        owner: new mongoose.Types.ObjectId(req.user._id),
    };

    // Optional search within own videos
    if (query?.trim()) {
        matchStage.$or = [
            { title: { $regex: query.trim(), $options: "i" } },
            { description: { $regex: query.trim(), $options: "i" } },
        ];
    }

    const videosAggregate = Video.aggregate([
        {
            $match: matchStage,
        },
        // Join likes on each video 
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes",
            },
        },
        //  Join comments count on each video
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "video",
                as: "comments",
            },
        },
        {
            $addFields: {
                likesCount: { $size: "$likes" },
                commentsCount: { $size: "$comments" },
            },
        },
        {
            $project: {
                likes: 0,
                comments: 0,
            },
        },
        {
            $sort: { [sortBy]: sortOrder },
        },
    ]);

    const options = {
        page: pageNumber,
        limit: limitNumber,
        customLabels: {
            totalDocs: "totalVideos",
            docs: "videos",
        },
    };

    const result = await Video.aggregatePaginate(videosAggregate, options);

    return res
        .status(200)
        .json(
            new ApiResponse(200, result, "Channel videos fetched successfully")
        );
});


export {
    getChannelStats,
    getChannelVideos,
};