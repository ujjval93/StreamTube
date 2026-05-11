import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiThumbsUp, FiEye } from "react-icons/fi";
import toast from "react-hot-toast";
import { getLikedVideos } from "../api/like.api.js";
import { toggleVideoLike } from "../api/like.api.js";

const formatViews = (views) => {
    if (!views) return "0";
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
    return views;
};

const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} days ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)} months ago`;
    return `${Math.floor(diff / 31536000)} years ago`;
};

const LikedVideos = () => {
    const [likedVideos, setLikedVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLikedVideos = async () => {
            try {
                setIsLoading(true);
                const response = await getLikedVideos();
                setLikedVideos(response.data.data.likedVideos);
            } catch {
                toast.error("Failed to load liked videos");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLikedVideos();
    }, []);

    // Unlike a video and remove from list
    const handleUnlike = async (videoId) => {
        try {
            await toggleVideoLike(videoId);
            setLikedVideos((prev) =>
                prev.filter((item) => item.video._id !== videoId)
            );
            toast.success("Video unliked");
        } catch {
            toast.error("Failed to unlike video");
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-white text-2xl font-bold flex items-center gap-2">
                    <FiThumbsUp className="text-white/60" />
                    Liked Videos
                </h1>
                <p className="text-white/40 text-sm mt-1">
                    {likedVideos.length} liked video{likedVideos.length !== 1 ? "s" : ""}
                </p>
            </div>

            {/* Loading */}
            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex gap-4 animate-pulse">
                            <div className="w-44 aspect-video bg-white/10 rounded-xl shrink-0" />
                            <div className="flex-1 space-y-2 py-2">
                                <div className="h-4 bg-white/10 rounded w-3/4" />
                                <div className="h-3 bg-white/10 rounded w-1/2" />
                                <div className="h-3 bg-white/10 rounded w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : likedVideos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                        <FiThumbsUp className="text-white/20 text-3xl" />
                    </div>
                    <p className="text-white/40 text-lg">No liked videos yet</p>
                    <Link
                        to="/"
                        className="text-blue-400 text-sm hover:underline"
                    >
                        Browse videos to like
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {likedVideos.map((item) => {
                        const video = item.video;
                        return (
                            <div
                                key={video._id}
                                className="flex gap-4 group hover:bg-white/5 rounded-xl p-2 transition-colors"
                            >
                                {/* Thumbnail */}
                                <Link
                                    to={`/video/${video._id}`}
                                    className="shrink-0"
                                >
                                    <div className="w-40 sm:w-48 aspect-video rounded-xl overflow-hidden bg-[#272727] relative">
                                        <img
                                            src={
                                                video.thumbnail?.url ||
                                                video.thumbnail
                                            }
                                            alt={video.title}
                                            className="w-full h-full object-cover hover:opacity-80 transition-opacity"
                                        />
                                        <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                                            {formatDuration(video.duration)}
                                        </span>
                                    </div>
                                </Link>

                                {/* Info */}
                                <div className="flex-1 min-w-0 py-1">
                                    <Link to={`/video/${video._id}`}>
                                        <h3 className="text-white font-medium text-sm sm:text-base line-clamp-2 hover:text-white/80 transition-colors">
                                            {video.title}
                                        </h3>
                                    </Link>

                                    {/* Channel */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <img
                                            src={video.owner?.avatar}
                                            alt={video.owner?.fullName}
                                            className="w-5 h-5 rounded-full object-cover"
                                        />
                                        <Link
                                            to={`/channel/${video.owner?.username}`}
                                            className="text-white/50 text-xs hover:text-white/80 transition-colors"
                                        >
                                            {video.owner?.fullName}
                                        </Link>
                                    </div>

                                    {/* Meta */}
                                    <div className="flex items-center gap-2 mt-1.5 text-white/30 text-xs">
                                        <FiEye className="text-xs" />
                                        <span>
                                            {formatViews(video.views)} views
                                        </span>
                                        <span>•</span>
                                        <span>
                                            {formatDate(video.createdAt)}
                                        </span>
                                    </div>

                                    {/* Unlike button */}
                                    <button
                                        onClick={() => handleUnlike(video._id)}
                                        className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-blue-600/20 text-blue-400 hover:bg-red-600/20 hover:text-red-400 text-xs font-medium transition-colors"
                                    >
                                        <FiThumbsUp className="text-xs" />
                                        Unlike
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LikedVideos;