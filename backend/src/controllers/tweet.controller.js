import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

//  CREATE TWEET
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content?.trim()) {
        throw new ApiError(400, "Tweet content is required");
    }

    if (content.trim().length > 280) {
        throw new ApiError(400, "Tweet content cannot exceed 280 characters");
    }

    const tweet = await Tweet.create({
        content: content.trim(),
        owner: req.user._id,
    });

    if (!tweet) {
        throw new ApiError(500, "Something went wrong while creating the tweet");
    }

    const createdTweet = await Tweet.aggregate([
        {
            $match: {
                _id: tweet._id,
            },
        },
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
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes",
            },
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
                likesCount: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user._id, "$likes.likedBy"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                likes: 0,
            },
        },
    ]);

    return res
        .status(201)
        .json(new ApiResponse(201, createdTweet[0], "Tweet created successfully"));
});

//  GET USER TWEETS  (with pagination)
const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (pageNumber < 1 || limitNumber < 1) {
        throw new ApiError(400, "Page and limit must be positive integers");
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const tweetsAggregate = Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
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
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likes",
            },
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
                likesCount: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                likes: 0,
            },
        },
        {
            $sort: { createdAt: -1 },
        },
    ]);

    const options = {
        page: pageNumber,
        limit: limitNumber,
        customLabels: {
            totalDocs: "totalTweets",
            docs: "tweets",
        },
    };

    const result = await Tweet.aggregatePaginate(tweetsAggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "User tweets fetched successfully"));
});

//  UPDATE TWEET
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Tweet content is required");
    }

    if (content.trim().length > 280) {
        throw new ApiError(400, "Tweet content cannot exceed 280 characters");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content: content.trim(),
            },
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

//  DELETE TWEET
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }

    await Tweet.findByIdAndDelete(tweetId);

    // Cascade delete all likes associated with this tweet
    await mongoose.model("Like").deleteMany({ tweet: tweetId });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
};