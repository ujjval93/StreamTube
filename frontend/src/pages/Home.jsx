import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { FiTrendingUp, FiClock, FiEye, FiRefreshCw } from "react-icons/fi";
import { getAllVideos } from "../api/video.api.js";
import VideoCard from "../components/ui/VideoCard.jsx";
import VideoCardSkeleton from "../components/ui/VideoCardSkeleton.jsx";
import toast from "react-hot-toast";

const SORT_OPTIONS = [
    { label: "Latest", sortBy: "createdAt", sortType: "desc", icon: FiClock },
    { label: "Most Viewed", sortBy: "views", sortType: "desc", icon: FiEye },
    { label: "Trending", sortBy: "createdAt", sortType: "asc", icon: FiTrendingUp },
];

const LIMIT = 12;

const Home = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query") || "";

    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeSortIndex, setActiveSortIndex] = useState(0);

    const activeSort = SORT_OPTIONS[activeSortIndex];

    const fetchVideos = useCallback(
        async (pageNum = 1, reset = false) => {
            try {
                setIsLoading(true);
                const response = await getAllVideos({
                    page: pageNum,
                    limit: LIMIT,
                    query,
                    sortBy: activeSort.sortBy,
                    sortType: activeSort.sortType,
                });

                const { videos: newVideos, totalPages: tp } = response.data.data;

                setVideos((prev) => (reset ? newVideos : [...prev, ...newVideos]));
                setTotalPages(tp);
                setPage(pageNum);
            } catch {
                toast.error("Failed to load videos");
            } finally {
                setIsLoading(false);
            }
        },
        [query, activeSort.sortBy, activeSort.sortType]
    );

    // Reset and fetch on query/sort change
    useEffect(() => {
        setVideos([]);
        setPage(1);
        fetchVideos(1, true);
    }, [query, activeSortIndex]);

    const handleSortChange = (index) => {
        if (index === activeSortIndex) return;
        setActiveSortIndex(index);
    };

    const handleLoadMore = () => {
        fetchVideos(page + 1);
    };

    return (
        <div>
            {/* Filter / Sort bar */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
                {SORT_OPTIONS.map((opt, i) => {
                    const Icon = opt.icon;
                    return (
                        <button
                            key={opt.label}
                            onClick={() => handleSortChange(i)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors
                            ${activeSortIndex === i
                                ? "bg-white text-black"
                                : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                            }`}
                        >
                            <Icon className="text-sm" />
                            {opt.label}
                        </button>
                    );
                })}

                {query && (
                    <span className="ml-auto text-white/40 text-sm">
                        Results for:{" "}
                        <span className="text-white font-medium">"{query}"</span>
                    </span>
                )}
            </div>

            {/* Video grid */}
            {isLoading && videos.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: LIMIT }).map((_, i) => (
                        <VideoCardSkeleton key={i} />
                    ))}
                </div>
            ) : videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                        <FiEye className="text-white/20 text-3xl" />
                    </div>
                    <p className="text-white/40 text-lg">No videos found</p>
                    {query && (
                        <button
                            onClick={() => window.history.back()}
                            className="text-blue-400 text-sm hover:underline"
                        >
                            Clear search
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {videos.map((video) => (
                            <VideoCard key={video._id} video={video} />
                        ))}
                        {/* Skeleton for loading more */}
                        {isLoading &&
                            Array.from({ length: 4 }).map((_, i) => (
                                <VideoCardSkeleton key={`sk-${i}`} />
                            ))}
                    </div>

                    {/* Load more */}
                    {page < totalPages && !isLoading && (
                        <div className="flex justify-center mt-10">
                            <button
                                onClick={handleLoadMore}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full text-sm font-medium transition-colors"
                            >
                                <FiRefreshCw className="text-sm" />
                                Load more
                            </button>
                        </div>
                    )}

                    {page >= totalPages && videos.length > 0 && (
                        <p className="text-center text-white/20 text-sm mt-10">
                            You've reached the end
                        </p>
                    )}
                </>
            )}
        </div>
    );
};

export default Home;