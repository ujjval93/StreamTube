import axiosInstance from "./axiosInstance.js";

export const createTweet = (data) =>
    axiosInstance.post("/tweets", data);

export const getUserTweets = (userId, params) =>
    axiosInstance.get(`/tweets/user/${userId}`, { params });

export const updateTweet = (tweetId, data) =>
    axiosInstance.patch(`/tweets/${tweetId}`, data);

export const deleteTweet = (tweetId) =>
    axiosInstance.delete(`/tweets/${tweetId}`);