import axiosInstance from "./axiosInstance.js";

export const createPlaylist = (data) =>
    axiosInstance.post("/playlists", data);

export const getUserPlaylists = (userId) =>
    axiosInstance.get(`/playlists/user/${userId}`);

export const getPlaylistById = (playlistId) =>
    axiosInstance.get(`/playlists/${playlistId}`);

export const addVideoToPlaylist = (videoId, playlistId) =>
    axiosInstance.patch(`/playlists/add/${videoId}/${playlistId}`);

export const removeVideoFromPlaylist = (videoId, playlistId) =>
    axiosInstance.patch(`/playlists/remove/${videoId}/${playlistId}`);

export const deletePlaylist = (playlistId) =>
    axiosInstance.delete(`/playlists/${playlistId}`);

export const updatePlaylist = (playlistId, data) =>
    axiosInstance.patch(`/playlists/${playlistId}`, data);