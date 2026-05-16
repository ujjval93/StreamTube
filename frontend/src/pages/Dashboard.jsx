import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    FiEye, FiThumbsUp, FiUsers, FiVideo,
    FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight,
    FiUploadCloud, FiSearch, FiTrendingUp,
    FiMoreVertical, FiExternalLink, FiBarChart2,
    FiAlertTriangle
} from "react-icons/fi";
import toast from "react-hot-toast";
import { getChannelStats, getChannelVideos } from "../api/dashboard.api.js";
import { deleteVideo, togglePublishStatus } from "../api/video.api.js";

// Helpers
const formatViews = (num) => {
    if (!num) return "0";
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return String(num);
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

// Stat Card
const StatCard = ({ icon: Icon, label, value, color, bgColor, trend }) => (
    <div className={`relative overflow-hidden rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-0.5 group ${bgColor}`}>
        {/* Background glow */}
        <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-xl ${color}`} />

        <div className="relative">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-opacity-20`}>
                    <Icon className="text-white text-lg" />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded-full">
                        <FiTrendingUp className="text-xs" />
                        {trend}
                    </div>
                )}
            </div>
            <p className="text-white text-2xl font-bold tracking-tight">{value}</p>
            <p className="text-white/40 text-xs mt-1 uppercase tracking-wider">{label}</p>
        </div>
    </div>
);

// Stats Skeleton
const StatsSkeleton = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-5 h-28 animate-pulse" />
        ))}
    </div>
);

// Video Row Skeleton
const VideoRowSkeleton = () => (
    <div className="flex items-center gap-4 p-4 animate-pulse">
        <div className="w-32 aspect-video rounded-xl bg-white/10 shrink-0" />
        <div className="flex-1 space-y-2">
            <div className="h-4 bg-white/10 rounded-lg w-3/4" />
            <div className="h-3 bg-white/5 rounded-lg w-1/2" />
            <div className="h-3 bg-white/5 rounded-lg w-1/3" />
        </div>
        <div className="flex gap-2 shrink-0">
            <div className="w-20 h-8 bg-white/10 rounded-lg" />
            <div className="w-8 h-8 bg-white/10 rounded-lg" />
            <div className="w-8 h-8 bg-white/10 rounded-lg" />
        </div>
    </div>
);

// Delete Modal
const DeleteModal = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <FiAlertTriangle className="text-red-400 text-xl" />
            </div>
            <h3 className="text-white font-bold text-lg text-center mb-2">Delete Video?</h3>
            <p className="text-white/40 text-sm text-center mb-6">
                This action cannot be undone. The video will be permanently removed from Cloudinary and our database.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={onCancel}
                    className="flex-1 py-2.5 rounded-xl bg-white/8 text-white text-sm font-medium hover:bg-white/15 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                >
                    Delete
                </button>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);

    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    const [videos, setVideos] = useState([]);
    const [videosLoading, setVideosLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortType, setSortType] = useState("desc");
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [activeMenu, setActiveMenu] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setStatsLoading(true);
                const response = await getChannelStats();
                setStats(response.data.data);
            } catch {
                toast.error("Failed to load stats");
            } finally {
                setStatsLoading(false);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setVideosLoading(true);
                const response = await getChannelVideos({
                    page, limit: 10, sortBy, sortType, query: searchQuery,
                });
                const { videos: fetchedVideos, totalPages: tp } = response.data.data;
                setVideos(fetchedVideos);
                setTotalPages(tp);
            } catch {
                toast.error("Failed to load videos");
            } finally {
                setVideosLoading(false);
            }
        };
        const timeout = setTimeout(fetchVideos, 400);
        return () => clearTimeout(timeout);
    }, [page, sortBy, sortType, searchQuery]);

    const handleTogglePublish = async (videoId, currentStatus) => {
        try {
            setVideos((prev) =>
                prev.map((v) => v._id === videoId ? { ...v, isPublished: !currentStatus } : v)
            );
            await togglePublishStatus(videoId);
            toast.success(currentStatus ? "Video unpublished" : "Video published");
        } catch {
            setVideos((prev) =>
                prev.map((v) => v._id === videoId ? { ...v, isPublished: currentStatus } : v)
            );
            toast.error("Failed to update publish status");
        }
    };

    const handleDelete = async (videoId) => {
        try {
            await deleteVideo(videoId);
            setVideos((prev) => prev.filter((v) => v._id !== videoId));
            setDeleteConfirm(null);
            toast.success("Video deleted successfully");
            setStats((prev) => prev ? { ...prev, totalVideos: prev.totalVideos - 1 } : prev);
        } catch {
            toast.error("Failed to delete video");
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-white text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-white/40 text-sm mt-1">
                        Welcome back, <span className="text-white/70 font-medium">{user?.fullName}</span> 👋
                    </p>
                </div>
                <Link
                    to="/upload"
                    className="flex items-center gap-2 bg-white hover:bg-white/90 text-black px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-white/10 hover:shadow-white/20"
                >
                    <FiUploadCloud className="text-base" />
                    Upload Video
                </Link>
            </div>

            {/* Stats Grid */}
            {statsLoading ? (
                <StatsSkeleton />
            ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        icon={FiEye}
                        label="Total Views"
                        value={formatViews(stats?.totalViews)}
                        color="bg-blue-500"
                        bgColor="bg-blue-500/5"
                    />
                    <StatCard
                        icon={FiUsers}
                        label="Subscribers"
                        value={formatViews(stats?.totalSubscribers)}
                        color="bg-purple-500"
                        bgColor="bg-purple-500/5"
                    />
                    <StatCard
                        icon={FiThumbsUp}
                        label="Total Likes"
                        value={formatViews(stats?.totalLikes)}
                        color="bg-red-500"
                        bgColor="bg-red-500/5"
                    />
                    <StatCard
                        icon={FiVideo}
                        label="Total Videos"
                        value={stats?.totalVideos || 0}
                        color="bg-green-500"
                        bgColor="bg-green-500/5"
                    />
                </div>
            )}

            {/* Videos Table */}
            <div className="bg-[#111111] border border-white/8 rounded-2xl overflow-hidden">
                {/* Table Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/8 gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <FiBarChart2 className="text-white/40" />
                        <h2 className="text-white font-semibold">Your Videos</h2>
                        {!videosLoading && (
                            <span className="text-white/30 text-xs bg-white/5 px-2 py-0.5 rounded-full">
                                {videos.length}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Search */}
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                                placeholder="Search videos..."
                                className="bg-white/5 border border-white/8 rounded-xl pl-9 pr-4 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/20 w-48 transition-all"
                            />
                        </div>

                        {/* Sort */}
                        <select
                            value={`${sortBy}-${sortType}`}
                            onChange={(e) => {
                                const [sb, st] = e.target.value.split("-");
                                setSortBy(sb); setSortType(st); setPage(1);
                            }}
                            className="bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-white/20 transition-all cursor-pointer"
                        >
                            <option value="createdAt-desc">Newest First</option>
                            <option value="createdAt-asc">Oldest First</option>
                            <option value="views-desc">Most Viewed</option>
                            <option value="title-asc">A → Z</option>
                        </select>
                    </div>
                </div>

                {/* Table Content */}
                {videosLoading ? (
                    <div className="divide-y divide-white/5">
                        {Array.from({ length: 5 }).map((_, i) => <VideoRowSkeleton key={i} />)}
                    </div>
                ) : videos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            <FiVideo className="text-white/20 text-3xl" />
                        </div>
                        <div className="text-center">
                            <p className="text-white/60 font-medium">
                                {searchQuery ? "No videos match your search" : "No videos yet"}
                            </p>
                            <p className="text-white/30 text-sm mt-1">
                                {searchQuery ? "Try a different search term" : "Upload your first video to get started"}
                            </p>
                        </div>
                        {!searchQuery && (
                            <Link
                                to="/upload"
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
                            >
                                <FiUploadCloud />
                                Upload Video
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {videos.map((video) => (
                            <div
                                key={video._id}
                                className="flex items-center gap-4 p-4 hover:bg-white/2 transition-colors group"
                            >
                                {/* Thumbnail */}
                                <Link to={`/video/${video._id}`} className="shrink-0">
                                    <div className="w-32 aspect-video rounded-xl overflow-hidden bg-[#1a1a1a] relative">
                                        <img
                                            src={video.thumbnail?.url || video.thumbnail}
                                            alt={video.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {!video.isPublished && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <span className="text-white/60 text-xs font-medium">Draft</span>
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <Link to={`/video/${video._id}`}>
                                        <h3 className="text-white text-sm font-medium line-clamp-1 hover:text-white/80 transition-colors">
                                            {video.title}
                                        </h3>
                                    </Link>
                                    <p className="text-white/30 text-xs mt-0.5 line-clamp-1">{video.description}</p>
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <span className="flex items-center gap-1 text-white/30 text-xs">
                                            <FiEye className="text-xs" />
                                            {formatViews(video.views)}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-white/15" />
                                        <span className="flex items-center gap-1 text-white/30 text-xs">
                                            <FiThumbsUp className="text-xs" />
                                            {video.likesCount || 0}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-white/15" />
                                        <span className="text-white/30 text-xs">{formatDate(video.createdAt)}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {/* Publish Toggle */}
                                    <button
                                        onClick={() => handleTogglePublish(video._id, video.isPublished)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                                            video.isPublished
                                                ? "bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20"
                                                : "bg-white/5 text-white/40 hover:bg-white/10 border border-white/5"
                                        }`}
                                    >
                                        {video.isPublished
                                            ? <><FiToggleRight className="text-base" /><span className="hidden sm:inline">Published</span></>
                                            : <><FiToggleLeft className="text-base" /><span className="hidden sm:inline">Draft</span></>
                                        }
                                    </button>

                                    {/* View */}
                                    <Link
                                        to={`/video/${video._id}`}
                                        className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-white/10 hover:text-white transition-all border border-white/5"
                                        title="View"
                                    >
                                        <FiExternalLink className="text-sm" />
                                    </Link>

                                    {/* Delete */}
                                    <button
                                        onClick={() => setDeleteConfirm(video._id)}
                                        className="p-2 rounded-lg bg-white/5 text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-all border border-white/5 hover:border-red-500/20"
                                        title="Delete"
                                    >
                                        <FiTrash2 className="text-sm" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 p-4 border-t border-white/8">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-xl bg-white/5 text-white text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors border border-white/5"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                                        page === i + 1
                                            ? "bg-white text-black font-medium"
                                            : "text-white/40 hover:text-white hover:bg-white/10"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded-xl bg-white/5 text-white text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors border border-white/5"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            {deleteConfirm && (
                <DeleteModal
                    onConfirm={() => handleDelete(deleteConfirm)}
                    onCancel={() => setDeleteConfirm(null)}
                />
            )}
        </div>
    );
};

export default Dashboard;