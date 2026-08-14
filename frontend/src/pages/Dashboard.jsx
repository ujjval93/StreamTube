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
    <div className={`relative overflow-hidden rounded-2xl border border-white/5 p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/10 group sm:p-5 ${bgColor}`}>
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
        <div className="mx-auto max-w-7xl px-2 py-3 sm:px-3 sm:py-4 lg:p-5">
            {/* Header */}
            <div className="mb-6 flex flex-col items-stretch gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="min-w-0">
                    <h1 className="text-white text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="mt-1 text-sm text-white/40">
                        Welcome back, <span className="font-medium text-white/70">{user?.fullName}</span> 👋
                    </p>
                </div>
                <Link
                    to="/upload"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-black shadow-lg shadow-white/10 transition-all duration-200 hover:bg-orange-500/90 hover:shadow-white/20 sm:w-auto"
                >
                    <FiUploadCloud className="text-base" />
                    Upload Video
                </Link>
            </div>

            {/* Stats Grid */}
            {statsLoading ? (
                <StatsSkeleton />
            ) : (
                <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-4">
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
            <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#111111]">
                {/* Table Header */}
                <div className="flex flex-col gap-3 border-b border-white/8 p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
                    <div className="flex min-w-0 items-center gap-2">
                        <FiBarChart2 className="shrink-0 text-white/40" />
                        <h2 className="text-white font-semibold">Your Videos</h2>
                        {!videosLoading && (
                            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/30">
                                {videos.length}
                            </span>
                        )}
                    </div>

                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:flex-wrap">
                        {/* Search */}
                        <div className="relative w-full sm:w-48">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/30" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                                placeholder="Search videos..."
                                className="w-full min-w-0 rounded-xl border border-white/8 bg-white/5 py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/20 transition-all focus:border-white/20 focus:outline-none"
                            />
                        </div>

                        {/* Sort */}
                        <select
                            value={`${sortBy}-${sortType}`}
                            onChange={(e) => {
                                const [sb, st] = e.target.value.split("-");
                                setSortBy(sb); setSortType(st); setPage(1);
                            }}
                            className="w-full cursor-pointer rounded-xl border border-white/8 bg-gray-800 px-3 py-2 text-sm text-black transition-all focus:border-white/20 focus:outline-none sm:w-auto"
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
                                className="group flex flex-col gap-3 p-3 transition-colors hover:bg-white/2 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
                            >
                                {/* Thumbnail */}
                                <Link to={`/video/${video._id}`} className="w-full shrink-0 sm:w-32">
                                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-[#1a1a1a] sm:w-32">
                                        <img
                                            src={video.thumbnail?.url || video.thumbnail}
                                            alt={video.title}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        {!video.isPublished && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                <span className="text-xs font-medium text-white/60">Draft</span>
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Info */}
                                <div className="w-full min-w-0 flex-1">
                                    <Link to={`/video/${video._id}`}>
                                        <h3 className="line-clamp-1 text-sm font-medium text-white transition-colors hover:text-white/80">
                                            {video.title}
                                        </h3>
                                    </Link>
                                    <p className="mt-0.5 line-clamp-1 text-xs text-white/30">{video.description}</p>
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                        <span className="flex items-center gap-1 text-xs text-white/30">
                                            <FiEye className="text-xs" />
                                            {formatViews(video.views)}
                                        </span>
                                        <span className="h-1 w-1 rounded-full bg-white/15" />
                                        <span className="flex items-center gap-1 text-xs text-white/30">
                                            <FiThumbsUp className="text-xs" />
                                            {video.likesCount || 0}
                                        </span>
                                        <span className="h-1 w-1 rounded-full bg-white/15" />
                                        <span className="text-xs text-white/30">{formatDate(video.createdAt)}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:flex-nowrap sm:justify-start">
                                    {/* Publish Toggle */}
                                    <button
                                        onClick={() => handleTogglePublish(video._id, video.isPublished)}
                                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                                            video.isPublished
                                                ? "border border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                                : "border border-white/5 bg-white/5 text-white/40 hover:bg-white/10"
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
                                        className="rounded-lg border border-white/5 bg-white/5 p-2 text-white/40 transition-all hover:bg-white/10 hover:text-white"
                                        title="View"
                                    >
                                        <FiExternalLink className="text-sm" />
                                    </Link>

                                    {/* Delete */}
                                    <button
                                        onClick={() => setDeleteConfirm(video._id)}
                                        className="rounded-lg border border-white/5 bg-white/5 p-2 text-white/40 transition-all hover:border-red-500/20 hover:bg-red-500/20 hover:text-red-400"
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
                    <div className="flex flex-wrap items-center justify-center gap-2 border-t border-white/8 p-3 sm:p-4">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="rounded-xl border border-white/5 bg-white/5 px-2.5 py-1.5 text-xs text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 sm:px-3 sm:py-2 sm:text-sm"
                        >
                            Previous
                        </button>
                        <div className="flex flex-wrap items-center justify-center gap-1">
                            {Array.from({ length: totalPages }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`h-8 w-8 rounded-lg text-sm transition-colors ${
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
                            className="rounded-xl border border-white/5 bg-white/5 px-2.5 py-1.5 text-xs text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 sm:px-3 sm:py-2 sm:text-sm"
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