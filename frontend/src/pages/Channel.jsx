import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    FiVideo, FiTwitter, FiInfo, FiEdit2,
    FiBell, FiBellOff, FiCheck, FiGrid,
    FiList, FiHeart, FiShare2
} from "react-icons/fi";
import toast from "react-hot-toast";
import { getUserChannelProfile } from "../api/user.api.js";
import { toggleSubscription } from "../api/subscription.api.js";
import { getAllVideos } from "../api/video.api.js";
import { getUserTweets } from "../api/tweet.api.js";
import VideoCard from "../components/ui/VideoCard.jsx";
import VideoCardSkeleton from "../components/ui/VideoCardSkeleton.jsx";

// Helpers
const formatViews = (num) => {
    if (!num) return "0";
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return String(num);
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return `${Math.floor(diff / 2592000)}mo ago`;
};

const TABS = [
    { id: "Videos", icon: FiVideo, label: "Videos" },
    { id: "Tweets", icon: FiTwitter, label: "Posts" },
    { id: "About", icon: FiInfo, label: "About" },
];

// Channel Header Skeleton
const ChannelSkeleton = () => (
    <div className="animate-pulse">
        <div className="w-full h-48 bg-white/5 rounded-2xl mb-4" />
        <div className="flex items-end gap-4 px-2 -mt-12 mb-6">
            <div className="w-28 h-28 rounded-full bg-white/10 border-4 border-[#0f0f0f] shrink-0" />
            <div className="flex-1 space-y-2 pb-2">
                <div className="h-6 bg-white/10 rounded-lg w-48" />
                <div className="h-4 bg-white/5 rounded-lg w-32" />
                <div className="h-3 bg-white/5 rounded-lg w-56" />
            </div>
            <div className="h-10 w-28 bg-white/10 rounded-full" />
        </div>
    </div>
);

// Stat Card
const StatCard = ({ value, label }) => (
    <div className="bg-white/5 hover:bg-white/8 border border-white/5 rounded-2xl p-5 text-center transition-all duration-300 hover:border-white/10 hover:-translate-y-0.5">
        <p className="text-white text-3xl font-bold tracking-tight">{value}</p>
        <p className="text-white/40 text-xs mt-1 uppercase tracking-wider">{label}</p>
    </div>
);

// Tweet Card
const TweetCard = ({ tweet, channel }) => (
    <div className="group bg-white/3 hover:bg-white/6 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all duration-300">
        <div className="flex items-center gap-3 mb-3">
            <img
                src={channel.avatar}
                alt={channel.fullName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white/10"
            />
            <div>
                <p className="text-white text-sm font-semibold">{channel.fullName}</p>
                <p className="text-white/30 text-xs">{formatDate(tweet.createdAt)}</p>
            </div>
        </div>
        <p className="text-white/80 text-sm leading-relaxed">{tweet.content}</p>
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
            <button className="flex items-center gap-1.5 text-white/30 hover:text-red-400 text-xs transition-colors group/btn">
                <FiHeart className="group-hover/btn:scale-110 transition-transform" />
                <span>{tweet.likesCount || 0}</span>
            </button>
            <button className="flex items-center gap-1.5 text-white/30 hover:text-blue-400 text-xs transition-colors">
                <FiShare2 />
                <span>Share</span>
            </button>
        </div>
    </div>
);

const Channel = () => {
    const { username } = useParams();
    const { user: currentUser, isAuthenticated } = useSelector((state) => state.auth);

    const [channel, setChannel] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscribersCount, setSubscribersCount] = useState(0);
    const [activeTab, setActiveTab] = useState("Videos");
    const [videoLayout, setVideoLayout] = useState("grid");

    const [videos, setVideos] = useState([]);
    const [videosLoading, setVideosLoading] = useState(false);

    const [tweets, setTweets] = useState([]);
    const [tweetsLoading, setTweetsLoading] = useState(false);

    useEffect(() => {
        const fetchChannel = async () => {
            try {
                setIsLoading(true);
                const response = await getUserChannelProfile(username);
                const data = response.data.data;
                setChannel(data);
                setIsSubscribed(data.isSubscribed);
                setSubscribersCount(data.subscribersCount);
            } catch {
                toast.error("Channel not found");
            } finally {
                setIsLoading(false);
            }
        };
        fetchChannel();
    }, [username]);

    useEffect(() => {
        if (activeTab !== "Videos" || !channel) return;
        const fetchVideos = async () => {
            try {
                setVideosLoading(true);
                const response = await getAllVideos({ userId: channel._id, limit: 20, page: 1 });
                setVideos(response.data.data.videos);
            } catch {
                toast.error("Failed to load videos");
            } finally {
                setVideosLoading(false);
            }
        };
        fetchVideos();
    }, [activeTab, channel]);

    useEffect(() => {
        if (activeTab !== "Tweets" || !channel) return;
        const fetchTweets = async () => {
            try {
                setTweetsLoading(true);
                const response = await getUserTweets(channel._id, { page: 1, limit: 20 });
                setTweets(response.data.data.tweets);
            } catch {
                toast.error("Failed to load posts");
            } finally {
                setTweetsLoading(false);
            }
        };
        fetchTweets();
    }, [activeTab, channel]);

    const handleSubscribe = async () => {
        if (!isAuthenticated) {
            toast.error("Please login to subscribe");
            return;
        }
        try {
            setIsSubscribed((prev) => !prev);
            setSubscribersCount((prev) => isSubscribed ? prev - 1 : prev + 1);
            await toggleSubscription(channel._id);
        } catch {
            setIsSubscribed((prev) => !prev);
            setSubscribersCount((prev) => isSubscribed ? prev + 1 : prev - 1);
            toast.error("Failed to update subscription");
        }
    };

    if (isLoading) return <ChannelSkeleton />;

    if (!channel) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <FiVideo className="text-white/20 text-2xl" />
                </div>
                <p className="text-white/40 text-lg">Channel not found</p>
            </div>
        );
    }

    const isOwnChannel = currentUser?.username === channel.username;

    return (
        <div className="max-w-7xl mx-auto">
            {/* Cover Image */}
            <div className="w-full h-40 sm:h-56 rounded-2xl overflow-hidden bg-linear-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] relative">
                {channel.coverImage ? (
                    <img src={channel.coverImage} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-linear-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
                        {/* Decorative pattern */}
                        <div className="absolute inset-0 opacity-10">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute rounded-full border border-white/30"
                                    style={{
                                        width: `${(i + 1) * 80}px`,
                                        height: `${(i + 1) * 80}px`,
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-[#0f0f0f]/60 to-transparent" />
            </div>

            {/* Channel Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2 -mt-14 mb-8 relative z-10">
                <div className="flex items-end gap-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <img
                            src={channel.avatar}
                            alt={channel.fullName}
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#0f0f0f] shadow-2xl"
                        />
                        {isSubscribed && (
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center border-2 border-[#0f0f0f]">
                                <FiCheck className="text-white text-xs" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="pb-1">
                        <h1 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
                            {channel.fullName}
                        </h1>
                        <p className="text-white/50 text-sm mt-0.5">@{channel.username}</p>
                        <div className="flex items-center gap-3 mt-2 text-white/40 text-xs">
                            <span className="font-medium text-white/60">
                                {formatViews(subscribersCount)} subscribers
                            </span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span>{formatViews(channel.channelsSubscribedToCount)} subscriptions</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pb-1">
                    {isOwnChannel ? (
                        <Link
                            to="/settings"
                            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-all duration-200 border border-white/10 hover:border-white/20"
                        >
                            <FiEdit2 className="text-sm" />
                            Customize channel
                        </Link>
                    ) : (
                        <div className="flex items-center gap-2">
                            {isSubscribed && (
                                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center text-white transition-all border border-white/10">
                                    <FiBell className="text-sm" />
                                </button>
                            )}
                            <button
                                onClick={handleSubscribe}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                                    isSubscribed
                                        ? "bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400 border border-white/10 hover:border-red-500/30"
                                        : "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10"
                                }`}
                            >
                                {isSubscribed ? (
                                    <>
                                        <FiCheck className="text-sm" />
                                        Subscribed
                                    </>
                                ) : (
                                    "Subscribe"
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/8 mb-6 gap-1">
                {TABS.map(({ id, icon: Icon, label }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200 relative ${
                            activeTab === id
                                ? "text-white"
                                : "text-white/40 hover:text-white/70"
                        }`}
                    >
                        <Icon className="text-sm" />
                        {label}
                        {activeTab === id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
                        )}
                    </button>
                ))}

                {/* Layout toggle for videos */}
                {activeTab === "Videos" && videos.length > 0 && (
                    <div className="ml-auto flex items-center gap-1 pb-2">
                        <button
                            onClick={() => setVideoLayout("grid")}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                videoLayout === "grid" ? "bg-white/15 text-white" : "text-white/30 hover:text-white/60"
                            }`}
                        >
                            <FiGrid className="text-sm" />
                        </button>
                        <button
                            onClick={() => setVideoLayout("list")}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                videoLayout === "list" ? "bg-white/15 text-white" : "text-white/30 hover:text-white/60"
                            }`}
                        >
                            <FiList className="text-sm" />
                        </button>
                    </div>
                )}
            </div>

            {/* Videos Tab */}
            {activeTab === "Videos" && (
                <div>
                    {videosLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <VideoCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                <FiVideo className="text-white/20 text-3xl" />
                            </div>
                            <div className="text-center">
                                <p className="text-white/60 font-medium">No videos yet</p>
                                <p className="text-white/30 text-sm mt-1">
                                    {isOwnChannel ? "Share your first video with the world" : "This channel hasn't uploaded any videos"}
                                </p>
                            </div>
                            {isOwnChannel && (
                                <Link
                                    to="/upload"
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
                                >
                                    <FiVideo className="text-sm" />
                                    Upload your first video
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className={
                            videoLayout === "grid"
                                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                                : "flex flex-col gap-3"
                        }>
                            {videos.map((video) => (
                                <VideoCard
                                    key={video._id}
                                    video={video}
                                    layout={videoLayout === "list" ? "list" : "grid"}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Tweets Tab */}
            {activeTab === "Tweets" && (
                <div className="max-w-2xl space-y-3">
                    {tweetsLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="bg-white/5 rounded-2xl p-5 animate-pulse space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-white/10" />
                                    <div className="space-y-1.5">
                                        <div className="h-3 bg-white/10 rounded w-24" />
                                        <div className="h-2 bg-white/5 rounded w-16" />
                                    </div>
                                </div>
                                <div className="h-3 bg-white/10 rounded w-full" />
                                <div className="h-3 bg-white/10 rounded w-2/3" />
                            </div>
                        ))
                    ) : tweets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                <FiTwitter className="text-white/20 text-3xl" />
                            </div>
                            <div className="text-center">
                                <p className="text-white/60 font-medium">No posts yet</p>
                                <p className="text-white/30 text-sm mt-1">Posts from this channel will appear here</p>
                            </div>
                        </div>
                    ) : (
                        tweets.map((tweet) => (
                            <TweetCard key={tweet._id} tweet={tweet} channel={channel} />
                        ))
                    )}
                </div>
            )}

            {/* About Tab */}
            {activeTab === "About" && (
                <div className="max-w-2xl space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard value={formatViews(subscribersCount)} label="Subscribers" />
                        <StatCard value={formatViews(channel.channelsSubscribedToCount)} label="Subscriptions" />
                    </div>

                    {/* Info */}
                    <div className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-5">
                        <div>
                            <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Channel</p>
                            <p className="text-white font-semibold text-lg">{channel.fullName}</p>
                            <p className="text-white/50 text-sm mt-0.5">@{channel.username}</p>
                        </div>
                        <div className="border-t border-white/5 pt-5">
                            <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Contact</p>
                            <p className="text-white/70 text-sm">{channel.email}</p>
                        </div>
                        {isOwnChannel && (
                            <div className="border-t border-white/5 pt-5">
                                <Link
                                    to="/settings"
                                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                                >
                                    <FiEdit2 className="text-sm" />
                                    Edit channel info
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Channel;