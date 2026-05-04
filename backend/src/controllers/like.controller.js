import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


//  TOGGLE VIDEO LIKE
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user._id,
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);

        return res
            .status(200)
            .json(
                new ApiResponse(200, { isLiked: false }, "Video unliked successfully")
            );
    }

    await Like.create({
        video: videoId,
        likedBy: req.user._id,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, { isLiked: true }, "Video liked successfully")
        );
});


//  TOGGLE COMMENT LIKE
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user._id,
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { isLiked: false },
                    "Comment unliked successfully"
                )
            );
    }

    await Like.create({
        comment: commentId,
        likedBy: req.user._id,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, { isLiked: true }, "Comment liked successfully")
        );
});


//  TOGGLE TWEET LIKE
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id,
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { isLiked: false },
                    "Tweet unliked successfully"
                )
            );
    }

    await Like.create({
        tweet: tweetId,
        likedBy: req.user._id,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, { isLiked: true }, "Tweet liked successfully")
        );
});


//  GET ALL LIKED VIDEOS  (of the logged-in user)
const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        //Match only video-likes by this user
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true, $ne: null },
            },
        },
        //Join full video details
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $match: { isPublished: true },
                    },
                    // Join video owner inside each video
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" },
                        },
                    },
                    {
                        $project: {
                            title: 1,
                            description: 1,
                            thumbnail: 1,
                            duration: 1,
                            views: 1,
                            owner: 1,
                            createdAt: 1,
                        },
                    },
                ],
            },
        },
        //Unwind: skip likes whose video was deleted / unpublished
        {
            $unwind: {
                path: "$video",
                preserveNullAndEmptyArrays: false,
            },
        },
        {
            $sort: { createdAt: -1 },
        },
        //Final shape
        {
            $project: {
                _id: 0,
                video: 1,
                likedAt: "$createdAt",
            },
        },
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalLikedVideos: likedVideos.length,
                likedVideos,
            },
            "Liked videos fetched successfully"
        )
    );
});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
};