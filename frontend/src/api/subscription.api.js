import axiosInstance from "./axiosInstance.js";

export const toggleSubscription = (channelId) =>
    axiosInstance.post(`/subscriptions/c/${channelId}`);

export const getChannelSubscribers = (channelId) =>
    axiosInstance.get(`/subscriptions/c/${channelId}`);

export const getSubscribedChannels = (subscriberId) =>
    axiosInstance.get(`/subscriptions/u/${subscriberId}`);