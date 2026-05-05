import axiosInstance from "./axiosInstance.js";

export const getChannelStats = () =>
    axiosInstance.get("/dashboard/stats");

export const getChannelVideos = (params) =>
    axiosInstance.get("/dashboard/videos", { params });
// params: { page, limit, sortBy, sortType, query }