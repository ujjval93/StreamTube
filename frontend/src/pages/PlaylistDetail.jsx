import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { FiTrash2, FiPlay, FiMinus, FiArrowLeft, FiList } from "react-icons/fi";
import toast from "react-hot-toast";
import { getPlaylistById, removeVideoFromPlaylist, deletePlaylist } from "../api/playlist.api.js";

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

const PlaylistDetail = () => {
    const { playlistId }            = useParams();
    const { user }                  = useSelector((s) => s.auth);
    const navigate                  = useNavigate();

    const [playlist,      setPlaylist]      = useState(null);
    const [isLoading,     setIsLoading]     = useState(true);
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                setIsLoading(true);
                const res = await getPlaylistById(playlistId);
                setPlaylist(res.data.data);
            } catch {
                toast.error("Playlist not found");
                navigate("/playlists");
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, [playlistId]);

    const handleRemove = async (videoId) => {
        try {
            await removeVideoFromPlaylist(videoId, playlistId);
            setPlaylist((p) => ({ ...p, videos: p.videos.filter((v) => v._id !== videoId), totalVideos: p.totalVideos - 1 }));
            toast.success("Removed from playlist");
        } catch {
            toast.error("Failed to remove");
        }
    };

    const handleDelete = async () => {
        try {
            await deletePlaylist(playlistId);
            toast.success("Playlist deleted");
            navigate("/playlists");
        } catch {
            toast.error("Failed to delete");
        }
    };

    const isOwner = user?._id === playlist?.owner?._id;

    if (isLoading) {
        return (
            <div className="flex gap-6 flex-col lg:flex-row animate-pulse">
                <div className="lg:w-72 shrink-0">
                    <div className="rounded-2xl overflow-hidden" style={{ background: "#111" }}>
                        <div className="aspect-video shimmer" />
                        <div className="p-5 space-y-3">
                            <div className="h-5 shimmer rounded-lg w-3/4" />
                            <div className="h-3 shimmer rounded-lg w-full" />
                            <div className="h-3 shimmer rounded-lg w-2/3" />
                        </div>
                    </div>
                </div>
                <div className="flex-1 space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="w-40 aspect-video shimmer rounded-xl shrink-0" />
                            <div className="flex-1 space-y-2 py-1">
                                <div className="h-4 shimmer rounded-lg w-3/4" />
                                <div className="h-3 shimmer rounded-lg w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!playlist) return null;

    return (
        <div className="flex gap-6 flex-col lg:flex-row">
            <div className="lg:w-72 xl:w-80 shrink-0">
                <button
                    onClick={() => navigate("/playlists")}
                    className="flex items-center gap-2 text-[#555] hover:text-white text-sm mb-5 transition-colors"
                >
                    <FiArrowLeft className="text-sm" />Back
                </button>
                <div className="rounded-2xl overflow-hidden sticky top-20" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="aspect-video relative" style={{ background: "#1a1a1a" }}>
                        {playlist.videos?.length > 0 ? (
                            <img src={playlist.videos[0]?.thumbnail?.url || playlist.videos[0]?.thumbnail} alt={playlist.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full"><FiList className="text-4xl text-[#222]" /></div>
                        )}
                        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)" }} />
                        <div className="absolute bottom-3 left-3 right-3">
                            <p className="text-white/60 text-xs">{playlist.totalVideos || 0} videos</p>
                        </div>
                    </div>
                    <div className="p-5">
                        <h1 className="text-white font-bold text-lg mb-1">{playlist.name}</h1>
                        <p className="text-[#555] text-sm mb-4 line-clamp-3">{playlist.description}</p>
                        <div className="flex items-center gap-2 mb-5">
                            <img src={playlist.owner?.avatar} alt={playlist.owner?.fullName} className="w-6 h-6 rounded-full object-cover" />
                            <span className="text-[#555] text-xs">{playlist.owner?.fullName}</span>
                        </div>
                        {playlist.videos?.length > 0 && (
                            <Link
                                to={`/video/${playlist.videos[0]._id}`}
                                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-sm font-semibold mb-3 transition-all"
                                style={{ background: "#ff3d3d", boxShadow: "0 4px 16px rgba(255,61,61,0.2)" }}
                            >
                                <FiPlay className="text-sm" />Play All
                            </Link>
                        )}
                        {isOwner && (
                            <button
                                onClick={() => setDeleteConfirm(true)}
                                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
                            >
                                <FiTrash2 className="text-sm" />Delete Playlist
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <h2 className="text-white font-bold text-lg mb-5">Videos</h2>
                {playlist.videos?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)" }}>
                            <FiList className="text-[#333] text-2xl" />
                        </div>
                        <p className="text-[#555]">No videos in this playlist</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {playlist.videos.map((video, i) => (
                            <div key={video._id} className="flex gap-3 group rounded-xl p-2 transition-colors hover:bg-white/3">
                                <div className="w-6 flex items-center justify-center text-[#333] text-sm shrink-0">{i + 1}</div>
                                <Link to={`/video/${video._id}`} className="shrink-0">
                                    <div className="w-36 sm:w-44 aspect-video rounded-xl overflow-hidden relative" style={{ background: "#1a1a1a" }}>
                                        <img src={video.thumbnail?.url || video.thumbnail} alt={video.title} className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
                                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-xs font-medium text-white" style={{ background: "rgba(0,0,0,0.85)" }}>
                                            {formatDuration(video.duration)}
                                        </span>
                                    </div>
                                </Link>
                                <div className="flex-1 min-w-0 py-1">
                                    <Link to={`/video/${video._id}`}>
                                        <h3 className="text-white text-sm font-medium line-clamp-2 hover:text-[#ff3d3d] transition-colors">{video.title}</h3>
                                    </Link>
                                    <Link to={`/channel/${video.owner?.username}`} className="text-[#555] text-xs mt-1 hover:text-[#888] block transition-colors">{video.owner?.fullName}</Link>
                                    <p className="text-[#444] text-xs mt-0.5">{formatViews(video.views)} views</p>
                                </div>
                                {isOwner && (
                                    <button onClick={() => handleRemove(video._id)} className="p-2 rounded-lg text-[#333] hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100 self-start mt-1">
                                        <FiMinus className="text-sm" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
                    <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <h3 className="text-white font-bold text-lg text-center mb-2">Delete Playlist?</h3>
                        <p className="text-[#555] text-sm text-center mb-6">"{playlist.name}" will be permanently deleted.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(false)} className="flex-1 py-2.5 rounded-xl text-[#666] text-sm font-medium transition-all" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>Cancel</button>
                            <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlaylistDetail;