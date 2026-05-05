import axiosInstance from "./axiosInstance.js";

export const toggleVideoLike = (videoId) =>
    axiosInstance.post(`/likes/toggle/v/${videoId}`);

export const toggleCommentLike = (commentId) =>
    axiosInstance.post(`/likes/toggle/c/${commentId}`);

export const toggleTweetLike = (tweetId) =>
    axiosInstance.post(`/likes/toggle/t/${tweetId}`);

export const getLikedVideos = () =>
    axiosInstance.get("/likes/videos");