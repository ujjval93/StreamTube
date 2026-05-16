import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiClock, FiEye, FiPlay } from "react-icons/fi";
import toast from "react-hot-toast";
import { getWatchHistory } from "../api/user.api.js";

const formatViews = (v) => {
    if (!v) return "0";
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
    return String(v);
};

const formatDuration = (s) => {
    if (!s) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
};

const formatDate = (d) => {
    const diff = Math.floor((Date.now() - new Date(d)) / 1000);
    if (diff < 60)       return "just now";
    if (diff < 3600)     return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)    return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000)  return `${Math.floor(diff / 86400)}d ago`;
    if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
    return `${Math.floor(diff / 31536000)}y ago`;
};

const WatchHistory = () => {
    const [history,   setHistory]   = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                setIsLoading(true);
                const res = await getWatchHistory();
                setHistory(res.data.data);
            } catch {
                toast.error("Failed to load watch history");
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, []);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-white text-2xl font-bold tracking-tight flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: "rgba(255,61,61,0.1)" }}
                    >
                        <FiClock style={{ color: "#ff3d3d" }} />
                    </div>
                    Watch History
                </h1>
                <p className="text-[#555] text-sm mt-2 ml-12">
                    {history.length} video{history.length !== 1 ? "s" : ""} watched
                </p>
            </div>

            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex gap-4 p-2 animate-pulse">
                            <div className="w-44 aspect-video shimmer rounded-xl shrink-0" />
                            <div className="flex-1 space-y-2.5 py-1">
                                <div className="h-4 shimmer rounded-lg w-3/4" />
                                <div className="h-3 shimmer rounded-lg w-1/2" />
                                <div className="h-3 shimmer rounded-lg w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <div
                        className="w-20 h-20 rounded-2xl flex items-center justify-center"
                        style={{ background: "rgba(255,61,61,0.08)" }}
                    >
                        <FiClock className="text-3xl" style={{ color: "#ff3d3d" }} />
                    </div>
                    <div className="text-center">
                        <p className="text-white font-semibold">No watch history</p>
                        <p className="text-[#555] text-sm mt-1">
                            Videos you watch will appear here
                        </p>
                    </div>
                    <Link
                        to="/"
                        className="text-sm font-medium transition-colors"
                        style={{ color: "#ff3d3d" }}
                    >
                        Browse videos
                    </Link>
                </div>
            ) : (
                <div className="space-y-2">
                    {history.map((video, i) => (
                        <motion.div
                            key={video._id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex gap-4 group rounded-xl p-2 transition-colors hover:bg-white/3"
                        >
                            <Link to={`/video/${video._id}`} className="shrink-0">
                                <div
                                    className="w-40 sm:w-48 aspect-video rounded-xl overflow-hidden relative"
                                    style={{ background: "#1a1a1a" }}
                                >
                                    <img
                                        src={video.thumbnail?.url || video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:opacity-80"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center"
                                            style={{ background: "rgba(255,61,61,0.9)" }}
                                        >
                                            <FiPlay className="text-white text-sm ml-0.5" />
                                        </div>
                                    </div>
                                    <span
                                        className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-xs font-medium text-white"
                                        style={{ background: "rgba(0,0,0,0.85)" }}
                                    >
                                        {formatDuration(video.duration)}
                                    </span>
                                </div>
                            </Link>

                            <div className="flex-1 min-w-0 py-1">
                                <Link to={`/video/${video._id}`}>
                                    <h3 className="text-white text-sm font-medium line-clamp-2 leading-snug hover:text-[#ff3d3d] transition-colors duration-150">
                                        {video.title}
                                    </h3>
                                </Link>

                                <div className="flex items-center gap-2 mt-2">
                                    <img
                                        src={video.owner?.avatar}
                                        alt={video.owner?.fullName}
                                        className="w-5 h-5 rounded-full object-cover"
                                    />
                                    <Link
                                        to={`/channel/${video.owner?.username}`}
                                        className="text-[#555] text-xs hover:text-[#888] transition-colors"
                                    >
                                        {video.owner?.fullName}
                                    </Link>
                                </div>

                                <div className="flex items-center gap-2 mt-1.5 text-[#444] text-xs">
                                    <FiEye className="text-xs" />
                                    <span>{formatViews(video.views)} views</span>
                                    <span>·</span>
                                    <span>{formatDate(video.createdAt)}</span>
                                </div>

                                <p className="text-[#444] text-xs mt-2 line-clamp-2 hidden sm:block leading-relaxed">
                                    {video.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WatchHistory;