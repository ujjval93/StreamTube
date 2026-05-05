import axiosInstance from "./axiosInstance.js";

// ── AUTH API ─────────────────────────────────────────────────────────────────

export const registerUser = (formData) =>
    axiosInstance.post("/users/register", formData);

export const loginUser = (data) =>
    axiosInstance.post("/users/login", data);

export const logoutUser = () =>
    axiosInstance.post("/users/logout");

export const refreshToken = () =>
    axiosInstance.post("/users/refresh-token");