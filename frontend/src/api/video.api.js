import axiosInstance from "./axiosInstance.js";

export const getAllVideos = (params) =>
    axiosInstance.get("/videos", { params });
// params: { page, limit, query, sortBy, sortType, userId }

export const getVideoById = (videoId) =>
    axiosInstance.get(`/videos/${videoId}`);

export const publishVideo = (formData) =>
    axiosInstance.post("/videos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

export const updateVideo = (videoId, formData) =>
    axiosInstance.patch(`/videos/${videoId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

export const deleteVideo = (videoId) =>
    axiosInstance.delete(`/videos/${videoId}`);

export const togglePublishStatus = (videoId) =>
    axiosInstance.patch(`/videos/toggle/publish/${videoId}`);