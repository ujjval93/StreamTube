import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiThumbsUp,
    FiShare2,
    FiSend,
    FiTrash2,
    FiChevronDown,
    FiChevronUp,
    FiBell,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { getVideoById, getAllVideos } from "../api/video.api.js";
import { toggleVideoLike, toggleCommentLike } from "../api/like.api.js";
import { toggleSubscription } from "../api/subscription.api.js";
import { getVideoComments, addComment, deleteComment } from "../api/comment.api.js";
import VideoCard from "../components/ui/VideoCard.jsx";
import VideoCardSkeleton from "../components/ui/VideoCardSkeleton.jsx";

const formatViews = (v) => {
    if (!v) return "0";
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
    return String(v);
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

const formatFullDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

const CommentItem = ({ comment, currentUser, onDelete, onLike }) => {
    const isOwner = currentUser?._id === comment.owner?._id ||
                    currentUser?._id === comment.owner?._id?.toString();
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 group"
        >
            <Link to={`/channel/${comment.owner?.username}`} className="shrink-0">
                <img
                    src={comment.owner?.avatar}
                    alt={comment.owner?.fullName}
                    className="w-8 h-8 rounded-full object-cover mt-0.5"
                />
            </Link>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <Link
                        to={`/channel/${comment.owner?.username}`}
                        className="text-white text-sm font-medium hover:text-[#ff3d3d] transition-colors duration-150"
                    >
                        @{comment.owner?.username}
                    </Link>
                    <span className="text-[#444] text-xs">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-[#ccc] text-sm leading-relaxed">{comment.content}</p>
                <div className="flex items-center gap-3 mt-2">
                    <button
                        onClick={() => onLike(comment._id)}
                        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-all duration-150 ${
                            comment.isLiked
                                ? "bg-[#ff3d3d]/15 text-[#ff3d3d]"
                                : "text-[#555] hover:text-white hover:bg-white/6"
                        }`}
                    >
                        <FiThumbsUp className="text-xs" />
                        <span>{comment.likesCount || 0}</span>
                    </button>
                    {isOwner && (
                        <button
                            onClick={() => onDelete(comment._id)}
                            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full text-[#444] hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 opacity-0 group-hover:opacity-100"
                        >
                            <FiTrash2 className="text-xs" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const VideoPlayer = () => {
    const { videoId }                    = useParams();
    const { user, isAuthenticated }      = useSelector((s) => s.auth);

    const [video,             setVideo]             = useState(null);
    const [isVideoLoading,    setIsVideoLoading]    = useState(true);
    const [isLiked,           setIsLiked]           = useState(false);
    const [likesCount,        setLikesCount]        = useState(0);
    const [isSubscribed,      setIsSubscribed]      = useState(false);
    const [subscribersCount,  setSubscribersCount]  = useState(0);
    const [showFullDesc,      setShowFullDesc]      = useState(false);

    const [comments,          setComments]          = useState([]);
    const [commentsLoading,   setCommentsLoading]   = useState(true);
    const [commentText,       setCommentText]       = useState("");
    const [isSubmitting,      setIsSubmitting]      = useState(false);

    const [relatedVideos,     setRelatedVideos]     = useState([]);
    const [relatedLoading,    setRelatedLoading]    = useState(true);

    const commentInputRef = useRef(null);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                setIsVideoLoading(true);
                const res  = await getVideoById(videoId);
                const data = res.data.data;
                setVideo(data);
                setIsLiked(data.isLiked);
                setLikesCount(data.likesCount);
                setIsSubscribed(data.owner?.isSubscribed);
                setSubscribersCount(data.owner?.subscribersCount);
            } catch {
                toast.error("Failed to load video");
            } finally {
                setIsVideoLoading(false);
            }
        };
        fetchVideo();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [videoId]);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                setCommentsLoading(true);
                const res = await getVideoComments(videoId, { page: 1, limit: 20 });
                setComments(res.data.data.comments);
            } catch {
            } finally {
                setCommentsLoading(false);
            }
        };
        fetchComments();
    }, [videoId]);

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                setRelatedLoading(true);
                const res      = await getAllVideos({ limit: 12, page: 1 });
                const filtered = res.data.data.videos.filter((v) => v._id !== videoId);
                setRelatedVideos(filtered);
            } catch {
            } finally {
                setRelatedLoading(false);
            }
        };
        fetchRelated();
    }, [videoId]);

    const handleLike = async () => {
        if (!isAuthenticated) return toast.error("Sign in to like videos");
        const prev = { isLiked, likesCount };
        setIsLiked((p) => !p);
        setLikesCount((p) => isLiked ? p - 1 : p + 1);
        try {
            await toggleVideoLike(videoId);
        } catch {
            setIsLiked(prev.isLiked);
            setLikesCount(prev.likesCount);
        }
    };

    const handleSubscribe = async () => {
        if (!isAuthenticated) return toast.error("Sign in to subscribe");
        const prev = { isSubscribed, subscribersCount };
        setIsSubscribed((p) => !p);
        setSubscribersCount((p) => isSubscribed ? p - 1 : p + 1);
        try {
            await toggleSubscription(video.owner?._id);
        } catch {
            setIsSubscribed(prev.isSubscribed);
            setSubscribersCount(prev.subscribersCount);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) return toast.error("Sign in to comment");
        if (!commentText.trim()) return;
        try {
            setIsSubmitting(true);
            const res        = await addComment(videoId, { content: commentText.trim() });
            setComments((p) => [res.data.data, ...p]);
            setCommentText("");
        } catch {
            toast.error("Failed to add comment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await deleteComment(commentId);
            setComments((p) => p.filter((c) => c._id !== commentId));
            toast.success("Comment deleted");
        } catch {
            toast.error("Failed to delete comment");
        }
    };

    const handleCommentLike = async (commentId) => {
        if (!isAuthenticated) return toast.error("Sign in to like comments");
        setComments((p) =>
            p.map((c) =>
                c._id === commentId
                    ? { ...c, isLiked: !c.isLiked, likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1 }
                    : c
            )
        );
        try {
            await toggleCommentLike(commentId);
        } catch {}
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied!");
    };

    if (isVideoLoading) {
        return (
            <div className="flex gap-6 flex-col lg:flex-row">
                <div className="flex-1">
                    <div className="w-full aspect-video rounded-2xl shimmer mb-5" />
                    <div className="h-6 shimmer rounded-xl w-3/4 mb-3" />
                    <div className="h-4 shimmer rounded-xl w-1/2 mb-6" />
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full shimmer" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 shimmer rounded-xl w-1/3" />
                            <div className="h-3 shimmer rounded-xl w-1/4" />
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-80 xl:w-96 space-y-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <VideoCardSkeleton key={i} layout="list" />
                    ))}
                </div>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-white font-semibold text-lg">Video not found</p>
                    <p className="text-[#666] text-sm mt-1">This video may have been removed</p>
                </div>
            </div>
        );
    }

    const isOwnVideo = user?._id === video.owner?._id?.toString() ||
                       user?._id?.toString() === video.owner?._id?.toString();

    return (
        <div className="flex gap-6 flex-col lg:flex-row">
            <div className="flex-1 min-w-0">
                <div
                    className="w-full aspect-video rounded-2xl overflow-hidden mb-4"
                    style={{ background: "#000" }}
                >
                    <video
                        src={video.videoFile?.url}
                        controls
                        autoPlay
                        className="w-full h-full"
                        poster={video.thumbnail?.url}
                    />
                </div>

                <h1 className="text-white text-xl font-bold leading-snug mb-4">
                    {video.title}
                </h1>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <Link to={`/channel/${video.owner?.username}`}>
                            <img
                                src={video.owner?.avatar}
                                alt={video.owner?.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        </Link>
                        <div>
                            <Link
                                to={`/channel/${video.owner?.username}`}
                                className="text-white font-semibold text-sm hover:text-[#ff3d3d] transition-colors duration-150"
                            >
                                {video.owner?.fullName}
                            </Link>
                            <p className="text-[#666] text-xs">
                                {formatViews(subscribersCount)} subscribers
                            </p>
                        </div>
                        {!isOwnVideo && (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSubscribe}
                                className="ml-1 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                                style={{
                                    background: isSubscribed ? "rgba(255,255,255,0.1)" : "#ff3d3d",
                                    color:      "#fff",
                                    border:     isSubscribed ? "1px solid rgba(255,255,255,0.15)" : "none",
                                }}
                            >
                                {!isSubscribed && <FiBell className="text-xs" />}
                                {isSubscribed ? "Subscribed" : "Subscribe"}
                            </motion.button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLike}
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150"
                            style={{
                                background: isLiked ? "rgba(255,61,61,0.15)" : "rgba(255,255,255,0.07)",
                                color:      isLiked ? "#ff3d3d" : "#aaa",
                                border:     isLiked ? "1px solid rgba(255,61,61,0.3)" : "1px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            <FiThumbsUp className={isLiked ? "fill-[#ff3d3d]" : ""} />
                            <span>{formatViews(likesCount)}</span>
                        </motion.button>

                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-[#aaa] hover:text-white transition-all duration-150"
                            style={{
                                background: "rgba(255,255,255,0.07)",
                                border:     "1px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            <FiShare2 />
                            <span>Share</span>
                        </button>
                    </div>
                </div>

                <div
                    className="rounded-2xl p-4 mb-6 cursor-pointer"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                    onClick={() => video.description?.length > 150 && setShowFullDesc((p) => !p)}
                >
                    <div className="flex items-center gap-3 text-[#666] text-xs mb-2">
                        <span>{formatViews(video.views)} views</span>
                        <span>·</span>
                        <span>{formatFullDate(video.createdAt)}</span>
                    </div>
                    <p
                        className={`text-[#ccc] text-sm leading-relaxed whitespace-pre-wrap ${
                            !showFullDesc ? "line-clamp-3" : ""
                        }`}
                    >
                        {video.description}
                    </p>
                    {video.description?.length > 150 && (
                        <button className="flex items-center gap-1 text-white text-xs font-semibold mt-2 hover:text-[#ff3d3d] transition-colors duration-150">
                            {showFullDesc ? (
                                <><FiChevronUp className="text-sm" /> Show less</>
                            ) : (
                                <><FiChevronDown className="text-sm" /> Show more</>
                            )}
                        </button>
                    )}
                </div>

                <div>
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-white font-bold text-base">
                            {comments.length} Comments
                        </h3>
                    </div>

                    {isAuthenticated && (
                        <form onSubmit={handleAddComment} className="flex gap-3 mb-6">
                            <img
                                src={user?.avatar}
                                alt={user?.fullName}
                                className="w-9 h-9 rounded-full object-cover shrink-0"
                            />
                            <div className="flex-1 flex items-center gap-2 rounded-xl px-4 py-2.5"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                            >
                                <input
                                    ref={commentInputRef}
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-transparent text-white text-sm placeholder:text-[#444] focus:outline-none"
                                />
                                <AnimatePresence>
                                    {commentText.trim() && (
                                        <motion.button
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="text-[#ff3d3d] hover:text-white transition-colors duration-150 disabled:opacity-50 shrink-0"
                                        >
                                            <FiSend className="text-base" />
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>
                        </form>
                    )}

                    <div className="space-y-5">
                        {commentsLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex gap-3 animate-pulse">
                                    <div className="w-8 h-8 rounded-full shimmer shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 shimmer rounded-lg w-1/4" />
                                        <div className="h-3 shimmer rounded-lg w-3/4" />
                                    </div>
                                </div>
                            ))
                        ) : comments.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-[#555] text-sm">
                                    No comments yet. Be the first!
                                </p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <CommentItem
                                    key={comment._id}
                                    comment={comment}
                                    currentUser={user}
                                    onDelete={handleDeleteComment}
                                    onLike={handleCommentLike}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-80 xl:w-96 shrink-0">
                <h3 className="text-white font-bold text-base mb-4 hidden lg:block">
                    Up Next
                </h3>
                <div className="space-y-3">
                    {relatedLoading
                        ? Array.from({ length: 6 }).map((_, i) => (
                              <VideoCardSkeleton key={i} layout="list" />
                          ))
                        : relatedVideos.map((v) => (
                              <VideoCard key={v._id} video={v} layout="list" />
                          ))}
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;