import { Link } from "react-router-dom";
import { FiEye } from "react-icons/fi";

const formatViews = (views) => {
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

const VideoCard = ({ video }) => {
    return (
        <Link to={`/video/${video._id}`} className="group block">
            {/* Thumbnail */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#272727]">
                <img
                    src={video.thumbnail?.url || video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />
                {/* Duration badge */}
                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
                    {formatDuration(video.duration)}
                </span>
            </div>

            {/* Info */}
            <div className="flex gap-3 mt-3">
                {/* Channel avatar */}
                <Link
                    to={`/channel/${video.owner?.username}`}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0"
                >
                    <img
                        src={video.owner?.avatar}
                        alt={video.owner?.fullName}
                        className="w-9 h-9 rounded-full object-cover hover:opacity-80 transition-opacity"
                    />
                </Link>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm font-medium line-clamp-2 leading-snug group-hover:text-white/80 transition-colors">
                        {video.title}
                    </h3>
                    <Link
                        to={`/channel/${video.owner?.username}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-white/50 text-xs mt-1 hover:text-white/80 transition-colors block"
                    >
                        {video.owner?.fullName}
                    </Link>
                    <div className="flex items-center gap-1.5 text-white/40 text-xs mt-0.5">
                        <FiEye className="text-xs" />
                        <span>{formatViews(video.views)} views</span>
                        <span>•</span>
                        <span>{formatDate(video.createdAt)}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default VideoCard;