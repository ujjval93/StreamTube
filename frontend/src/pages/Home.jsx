import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiTrendingUp,
    FiClock,
    FiZap,
    FiFilm,
    FiMusic,
    FiCode,
    FiTv as FiGamepad,
    FiRefreshCw,
    FiSearch,
} from "react-icons/fi";
import { getAllVideos } from "../api/video.api.js";
import VideoCard from "../components/ui/VideoCard.jsx";
import VideoCardSkeleton from "../components/ui/VideoCardSkeleton.jsx";
import toast from "react-hot-toast";

const SORT_OPTIONS = [
    { label: "Latest",   sortBy: "createdAt", sortType: "desc", icon: FiClock      },
    { label: "Trending", sortBy: "views",      sortType: "desc", icon: FiTrendingUp },
    { label: "Oldest",   sortBy: "createdAt", sortType: "asc",  icon: FiZap        },
];

const CATEGORY_FILTERS = [
    { label: "All",       query: ""          },
    { label: "Films",     query: "film"      },
    { label: "Music",     query: "music"     },
    { label: "Coding",    query: "code"      },
    { label: "Gaming",    query: "gaming"    },
    { label: "Vlog",      query: "vlog"      },
    { label: "Education", query: "education" },
    { label: "Sports",    query: "sports"    },
];

const LIMIT = 12;

const staggerContainer = {
    animate: { transition: { staggerChildren: 0.05 } },
};

const Home = () => {
    const [searchParams]                      = useSearchParams();
    const urlQuery                            = searchParams.get("query") || "";

    const [videos,          setVideos]          = useState([]);
    const [isLoading,       setIsLoading]       = useState(true);
    const [isLoadingMore,   setIsLoadingMore]   = useState(false);
    const [page,            setPage]            = useState(1);
    const [totalPages,      setTotalPages]      = useState(1);
    const [activeSortIndex, setActiveSortIndex] = useState(0);
    const [activeCategory,  setActiveCategory]  = useState(0);

    const activeSort     = SORT_OPTIONS[activeSortIndex];
    const activeQuery    = urlQuery || CATEGORY_FILTERS[activeCategory].query;
    const loadMoreRef    = useRef(null);

    const fetchVideos = useCallback(
        async (pageNum = 1, reset = false) => {
            try {
                reset ? setIsLoading(true) : setIsLoadingMore(true);

                const response = await getAllVideos({
                    page:     pageNum,
                    limit:    LIMIT,
                    query:    activeQuery,
                    sortBy:   activeSort.sortBy,
                    sortType: activeSort.sortType,
                });

                const { videos: newVideos, totalPages: tp } = response.data.data;

                setVideos((prev) => reset ? newVideos : [...prev, ...newVideos]);
                setTotalPages(tp);
                setPage(pageNum);
            } catch {
                toast.error("Failed to load videos");
            } finally {
                setIsLoading(false);
                setIsLoadingMore(false);
            }
        },
        [activeQuery, activeSort.sortBy, activeSort.sortType]
    );

    useEffect(() => {
        setVideos([]);
        setPage(1);
        fetchVideos(1, true);
    }, [urlQuery, activeSortIndex, activeCategory]);

    useEffect(() => {
        if (!loadMoreRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && page < totalPages && !isLoadingMore && !isLoading) {
                    fetchVideos(page + 1);
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [page, totalPages, isLoadingMore, isLoading, fetchVideos]);

    return (
        <div className="w-full">
            <div
                className="sticky top-16 z-30 mb-6 px-4 py-3"
                style={{
                    background:          "rgba(15,15,15,0.95)",
                    backdropFilter:      "blur(12px)",
                    WebkitBackdropFilter:"blur(12px)",
                    borderBottom:        "1px solid rgba(255,255,255,0.05)",
                }}
            >
                <div className="flex flex-wrap items-center gap-3 overflow-x-auto scrollbar-hide">
                    {!urlQuery && (
                        <>
                            <div className="flex items-center gap-2 shrink-0">
                                {SORT_OPTIONS.map((opt, i) => {
                                    const Icon = opt.icon;
                                    return (
                                        <motion.button
                                            key={opt.label}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setActiveSortIndex(i)}
                                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 shrink-0"
                                            style={{
                                                background: activeSortIndex === i ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
                                                color:      activeSortIndex === i ? "#fff" : "#888",
                                                border:     activeSortIndex === i ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.08)",
                                            }}
                                        >
                                            <Icon className="text-sm" />
                                            {opt.label}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <div
                                className="w-px h-5 shrink-0"
                                style={{ background: "rgba(255,255,255,0.1)" }}
                            />

                            <div className="flex items-center gap-2 shrink-0">
                                {CATEGORY_FILTERS.map((cat, i) => (
                                    <motion.button
                                        key={cat.label}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setActiveCategory(i)}
                                        className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-150 shrink-0"
                                        style={{
                                            background: activeCategory === i ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)",
                                            color:      activeCategory === i ? "#fff" : "#666",
                                            border:     activeCategory === i ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.06)",
                                        }}
                                    >
                                        {cat.label}
                                    </motion.button>
                                ))}
                            </div>
                        </>
                    )}

                    {urlQuery && (
                        <div className="flex items-center gap-2">
                            <FiSearch className="text-[#ff3d3d] text-sm" />
                            <span className="text-[#888] text-sm">
                                Results for{" "}
                                <span className="text-white font-semibold">
                                    "{urlQuery}"
                                </span>
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="skeleton"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="px-4 video-grid"
                    >
                        {Array.from({ length: LIMIT }).map((_, i) => (
                            <VideoCardSkeleton key={i} layout="grid" />
                        ))}
                    </motion.div>
                ) : videos.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-4 flex flex-col items-center justify-center py-32 gap-4"
                    >
                        <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center"
                            style={{ background: "rgba(255,61,61,0.1)" }}
                        >
                            <FiSearch className="text-[#ff3d3d] text-3xl" />
                        </div>
                        <div className="text-center">
                            <p className="text-white font-semibold text-lg">
                                No videos found
                            </p>
                            <p className="text-[#666] text-sm mt-1">
                                {urlQuery
                                    ? `No results for "${urlQuery}"`
                                    : "Be the first to upload a video"}
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="grid"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        className="px-4"
                    >
                        <div className="video-grid">
                            {videos.map((video) => (
                                <VideoCard
                                    key={video._id}
                                    video={video}
                                    layout="grid"
                                />
                            ))}
                            {isLoadingMore &&
                                Array.from({ length: 4 }).map((_, i) => (
                                    <VideoCardSkeleton key={`more-${i}`} layout="grid" />
                                ))}
                        </div>

                        <div ref={loadMoreRef} className="h-10 mt-8" />

                        {page >= totalPages && videos.length > 0 && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center text-[#333] text-sm py-8"
                            >
                                You've seen everything
                            </motion.p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Home;