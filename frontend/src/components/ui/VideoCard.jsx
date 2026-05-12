import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiEye, FiClock } from "react-icons/fi";

const formatViews = (views) => {
    if (!views) return "0";
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
    return String(views);
};

const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
};

const formatDate = (dateString) => {
    const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
    if (diff < 60)      return "just now";
    if (diff < 3600)    return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)   return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    if (diff < 31536000)return `${Math.floor(diff / 2592000)}mo ago`;
    return `${Math.floor(diff / 31536000)}y ago`;
};

const VideoCard = ({ video, layout = "grid" }) => {
    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgError, setImgError]   = useState(false);

    const thumbnailSrc = video?.thumbnail?.url || video?.thumbnail;
    const avatarSrc    = video?.owner?.avatar;

    if (layout === "list") {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 group p-2 rounded-2xl hover:bg-white/4 transition-all duration-200"
            >
                <Link to={`/video/${video._id}`} className="shrink-0">
                    <div className="relative w-44 sm:w-52 aspect-video rounded-xl overflow-hidden bg-[#212121]">
                        {!imgLoaded && <div className="absolute inset-0 shimmer" />}
                        <img
                            src={thumbnailSrc}
                            alt={video.title}
                            onLoad={() => setImgLoaded(true)}
                            onError={() => setImgError(true)}
                            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                                imgLoaded ? "opacity-100" : "opacity-0"
                            }`}
                        />
                        <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-xs font-semibold text-white"
                            style={{ background: "rgba(0,0,0,0.85)" }}>
                            {formatDuration(video.duration)}
                        </div>
                    </div>
                </Link>

                <div className="flex-1 min-w-0 py-1">
                    <Link to={`/video/${video._id}`}>
                        <h3 className="text-white text-sm font-medium line-clamp-2 leading-snug hover:text-[#ff3d3d] transition-colors duration-150">
                            {video.title}
                        </h3>
                    </Link>
                    <Link
                        to={`/channel/${video.owner?.username}`}
                        className="text-[#888] text-xs mt-1.5 hover:text-white transition-colors duration-150 block"
                    >
                        {video.owner?.fullName}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 text-[#555] text-xs">
                        <FiEye className="text-xs" />
                        <span>{formatViews(video.views)} views</span>
                        <span>·</span>
                        <span>{formatDate(video.createdAt)}</span>
                    </div>
                    <p className="text-[#555] text-xs mt-2 line-clamp-2 hidden sm:block leading-relaxed">
                        {video.description}
                    </p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="group cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
        >
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#101010]">
                <Link to={`/video/${video._id}`} className="block">
                    <div className="relative w-full aspect-video bg-[#212121]">
                        {!imgLoaded && <div className="absolute inset-0 shimmer rounded-[28px]" />}
                        <img
                            src={thumbnailSrc}
                            alt={video.title}
                            loading="lazy"
                            onLoad={() => setImgLoaded(true)}
                            onError={() => setImgError(true)}
                            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
                                imgLoaded ? "opacity-100" : "opacity-0"
                            }`}
                        />
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }}
                        />
                        <div
                            className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-md text-xs font-semibold text-white"
                            style={{ background: "rgba(0,0,0,0.85)" }}
                        >
                            {formatDuration(video.duration)}
                        </div>
                    </div>
                </Link>

                <div className="flex gap-3 p-4">
                    <Link to={`/channel/${video.owner?.username}`} className="shrink-0 mt-0.5">
                        <div className="relative">
                            <img
                                src={avatarSrc}
                                alt={video.owner?.fullName}
                                className="w-8 h-8 rounded-full object-cover transition-transform duration-200 hover:scale-110"
                            />
                        </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                        <Link to={`/video/${video._id}`}>
                            <h3 className="text-white text-sm font-medium line-clamp-2 leading-snug hover:text-[#ff3d3d] transition-colors duration-150">
                                {video.title}
                            </h3>
                        </Link>
                        <Link
                            to={`/channel/${video.owner?.username}`}
                            className="text-[#888] text-xs mt-1 hover:text-white transition-colors duration-150 block"
                        >
                            {video.owner?.fullName}
                        </Link>
                        <div className="flex items-center gap-1.5 text-[#555] text-xs mt-0.5">
                            <span>{formatViews(video.views)} views</span>
                            <span>·</span>
                            <span>{formatDate(video.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default VideoCard;