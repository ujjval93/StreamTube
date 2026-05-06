import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  if (pageNumber < 1 || limitNumber < 1) {
    throw new ApiError(400, "Page and limit must be positive integers");
  }

  // Build the match stage
  const matchStage = {
    isPublished: true,
  };

  if (query?.trim()) {
    matchStage.$or = [
      { title: { $regex: query.trim(), $options: "i" } },
      { description: { $regex: query.trim(), $options: "i" } },
    ];
  }

  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid userId");
    }
    matchStage.owner = new mongoose.Types.ObjectId(userId);
  }

  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "views",
    "duration",
    "title",
  ];
  if (!allowedSortFields.includes(sortBy)) {
    throw new ApiError(
      400,
      `sortBy must be one of: ${allowedSortFields.join(", ")}`
    );
  }

  const sortOrder = sortType === "asc" ? 1 : -1;

  const videoAggregate = Video.aggregate([
    {
      $match: matchStage,
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
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
        owner: { $first: "$ownerDetails" },
      },
    },
    {
      $project: {
        ownerDetails: 0,
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

  const result = await Video.aggregatePaginate(videoAggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const title = req.body?.title;
  const description = req.body?.description;

  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  // Upload both to Cloudinary concurrently
  const [videoFile, thumbnail] = await Promise.all([
    uploadOnCloudinary(videoFileLocalPath),
    uploadOnCloudinary(thumbnailLocalPath),
  ]);

  if (!videoFile?.secure_url) {
    throw new ApiError(500, "Error uploading video to Cloudinary");
  }

  if (!thumbnail?.secure_url) {
    throw new ApiError(500, "Error uploading thumbnail to Cloudinary");
  }

  const video = await Video.create({
    videoFile: {
      url: videoFile.secure_url,
      public_id: videoFile.public_id,
    },
    thumbnail: {
      url: thumbnail.secure_url,
      public_id: thumbnail.public_id,
    },
    title: title.trim(),
    description: description.trim(),
    duration: videoFile.duration,
    owner: req.user._id,
    isPublished: true,
  });

  const createdVideo = await Video.findById(video._id).populate(
    "owner",
    "fullName username avatar"
  );

  if (!createdVideo) {
    throw new ApiError(500, "Something went wrong while publishing the video");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdVideo, "Video published successfully"));
});

//  GET VIDEO BY ID  (also increments view count)
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
        isPublished: true,
      },
    },
    //Likes
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    // Owner details
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            $addFields: {
              subscribersCount: { $size: "$subscribers" },
              isSubscribed: {
                $cond: {
                  if: {
                    $in: [req.user?._id, "$subscribers.subscriber"],
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
            },
          },
        ],
      },
    },
    //  Computed fields
    {
      $addFields: {
        likesCount: { $size: "$likes" },
        owner: { $first: "$owner" },
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
  ]);

  if (!video?.length) {
    throw new ApiError(404, "Video not found");
  }

  // Increment view count
  await Video.findByIdAndUpdate(videoId, {
    $inc: { views: 1 },
  });

  // Push to user watch history
  if (req.user?._id) {
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { watchHistory: videoId },
    });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successfully"));
});

//  UPDATE VIDEO  (title, description, thumbnail)
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  if (!title?.trim() && !description?.trim() && !req.file?.path) {
    throw new ApiError(
      400,
      "At least one field (title, description, thumbnail) is required to update"
    );
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  const updateFields = {};

  if (title?.trim()) updateFields.title = title.trim();
  if (description?.trim()) updateFields.description = description.trim();

  // Handle thumbnail update
  if (req.file?.path) {
    const thumbnailLocalPath = req.file.path;

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail?.url) {
      throw new ApiError(500, "Error uploading thumbnail to Cloudinary");
    }

    // Delete old thumbnail from Cloudinary
    if (video.thumbnail?.public_id) {
      await deleteFromCloudinary(video.thumbnail.public_id);
    }

    updateFields.thumbnail = {
      url: thumbnail.url,
      public_id: thumbnail.public_id,
    };
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: updateFields },
    { new: true }
  ).populate("owner", "fullName username avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

//  DELETE VIDEO
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  // Delete video file and thumbnail from Cloudinary concurrently
  const cloudinaryDeletions = [];

  if (video.videoFile?.public_id) {
    cloudinaryDeletions.push(
      deleteFromCloudinary(video.videoFile.public_id, "video")
    );
  }

  if (video.thumbnail?.public_id) {
    cloudinaryDeletions.push(deleteFromCloudinary(video.thumbnail.public_id));
  }

  await Promise.all(cloudinaryDeletions);

  // Delete the video document
  await Video.findByIdAndDelete(videoId);

  // Clean up related data (likes, comments) — cascade delete
  await Promise.all([
    mongoose.model("Like").deleteMany({ video: videoId }),
    mongoose.model("Comment").deleteMany({ video: videoId }),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

//  TOGGLE PUBLISH STATUS
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to toggle publish status of this video"
    );
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: { isPublished: !video.isPublished } },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isPublished: updatedVideo.isPublished },
        `Video is now ${updatedVideo.isPublished ? "published" : "unpublished"}`
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
