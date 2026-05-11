import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiTrash2, FiList, FiX, FiCheck, FiPlay } from "react-icons/fi";
import toast from "react-hot-toast";
import { getUserPlaylists, createPlaylist, deletePlaylist } from "../api/playlist.api.js";

const Playlists = () => {
    const { user } = useSelector((s) => s.auth);

    const [playlists,    setPlaylists]    = useState([]);
    const [isLoading,    setIsLoading]    = useState(true);
    const [deleteId,     setDeleteId]     = useState(null);
    const [showCreate,   setShowCreate]   = useState(false);
    const [name,         setName]         = useState("");
    const [desc,         setDesc]         = useState("");
    const [isCreating,   setIsCreating]   = useState(false);

    useEffect(() => {
        if (!user?._id) return;
        const fetch = async () => {
            try {
                setIsLoading(true);
                const res = await getUserPlaylists(user._id);
                setPlaylists(res.data.data);
            } catch {
                toast.error("Failed to load playlists");
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, [user?._id]);

    const handleCreate = async () => {
        if (!name.trim()) { toast.error("Name is required"); return; }
        if (!desc.trim()) { toast.error("Description is required"); return; }
        try {
            setIsCreating(true);
            const res = await createPlaylist({ name: name.trim(), description: desc.trim() });
            setPlaylists((p) => [res.data.data, ...p]);
            setShowCreate(false);
            setName(""); setDesc("");
            toast.success("Playlist created!");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to create");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deletePlaylist(id);
            setPlaylists((p) => p.filter((pl) => pl._id !== id));
            setDeleteId(null);
            toast.success("Playlist deleted");
        } catch {
            toast.error("Failed to delete");
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-white text-2xl font-bold tracking-tight">Playlists</h1>
                    <p className="text-[#555] text-sm mt-1">
                        {playlists.length} playlist{playlists.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
                    style={{ background: "#ff3d3d", boxShadow: "0 4px 16px rgba(255,61,61,0.25)" }}
                >
                    <FiPlus />New Playlist
                </motion.button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}>
                            <div className="aspect-video shimmer" />
                            <div className="p-4 space-y-2">
                                <div className="h-4 shimmer rounded-lg w-3/4" />
                                <div className="h-3 shimmer rounded-lg w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : playlists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,61,61,0.08)" }}>
                        <FiList className="text-3xl" style={{ color: "#ff3d3d" }} />
                    </div>
                    <div className="text-center">
                        <p className="text-white font-semibold">No playlists yet</p>
                        <p className="text-[#555] text-sm mt-1">Create your first playlist to organize videos</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="text-sm font-medium transition-colors"
                        style={{ color: "#ff3d3d" }}
                    >
                        Create playlist
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {playlists.map((pl) => (
                        <motion.div
                            key={pl._id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                            style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
                        >
                            <Link to={`/playlist/${pl._id}`}>
                                <div className="aspect-video relative overflow-hidden" style={{ background: "#1a1a1a" }}>
                                    {pl.videos?.length > 0 ? (
                                        <div className="grid grid-cols-2 h-full">
                                            {pl.videos.slice(0, 4).map((v, i) => (
                                                <img
                                                    key={i}
                                                    src={v.thumbnail?.url || v.thumbnail}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <FiList className="text-4xl text-[#222]" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#ff3d3d" }}>
                                            <FiPlay className="text-white text-lg ml-0.5" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md text-xs font-medium text-white" style={{ background: "rgba(0,0,0,0.8)" }}>
                                        {pl.totalVideos || 0} videos
                                    </div>
                                </div>
                            </Link>
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <Link to={`/playlist/${pl._id}`} className="min-w-0">
                                        <h3 className="text-white font-medium text-sm line-clamp-1 hover:text-[#ff3d3d] transition-colors">{pl.name}</h3>
                                        <p className="text-[#555] text-xs mt-1 line-clamp-2">{pl.description}</p>
                                    </Link>
                                    <button
                                        onClick={() => setDeleteId(pl._id)}
                                        className="p-1.5 rounded-lg text-[#333] hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                                    >
                                        <FiTrash2 className="text-sm" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
                        onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md rounded-2xl p-6"
                            style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-white font-bold text-lg">New Playlist</h3>
                                <button onClick={() => setShowCreate(false)} className="text-[#555] hover:text-white transition-colors">
                                    <FiX />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[#666] text-xs uppercase tracking-wider mb-2 block">Name *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="My Playlist"
                                        autoFocus
                                        className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder:text-[#333] focus:outline-none transition-colors"
                                        style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }}
                                    />
                                </div>
                                <div>
                                    <label className="text-[#666] text-xs uppercase tracking-wider mb-2 block">Description *</label>
                                    <textarea
                                        value={desc}
                                        onChange={(e) => setDesc(e.target.value)}
                                        placeholder="What's this playlist about?"
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl text-white text-sm placeholder:text-[#333] focus:outline-none resize-none transition-colors"
                                        style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => { setShowCreate(false); setName(""); setDesc(""); }}
                                    className="flex-1 py-2.5 rounded-xl text-[#666] hover:text-white text-sm font-medium transition-all"
                                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleCreate}
                                    disabled={isCreating}
                                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                                    style={{ background: "#ff3d3d" }}
                                >
                                    {isCreating ? (
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                        </svg>
                                    ) : <FiCheck />}
                                    {isCreating ? "Creating..." : "Create"}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deleteId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-sm rounded-2xl p-6"
                            style={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                                <FiTrash2 className="text-red-400 text-lg" />
                            </div>
                            <h3 className="text-white font-bold text-lg text-center mb-2">Delete Playlist?</h3>
                            <p className="text-[#555] text-sm text-center mb-6">This will permanently delete the playlist and all its video references.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl text-[#666] hover:text-white text-sm font-medium transition-all" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>Cancel</button>
                                <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors">Delete</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Playlists;