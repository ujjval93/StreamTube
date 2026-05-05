import axiosInstance from "./axiosInstance.js";

export const getCurrentUser = () =>
    axiosInstance.get("/users/current-user");

export const getUserChannelProfile = (username) =>
    axiosInstance.get(`/users/c/${username}`);

export const getWatchHistory = () =>
    axiosInstance.get("/users/history");

export const updateAccountDetails = (data) =>
    axiosInstance.patch("/users/update-account", data);

export const updateAvatar = (formData) =>
    axiosInstance.patch("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

export const updateCoverImage = (formData) =>
    axiosInstance.patch("/users/cover-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

export const changePassword = (data) =>
    axiosInstance.post("/users/change-password", data);