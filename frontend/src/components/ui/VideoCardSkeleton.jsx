const VideoCardSkeleton = ({ layout = "grid" }) => {
    if (layout === "list") {
        return (
            <div className="flex gap-4 p-2">
                <div className="w-44 sm:w-52 aspect-video rounded-xl shimmer shrink-0" />
                <div className="flex-1 py-1 space-y-2.5">
                    <div className="h-3.5 shimmer rounded-lg w-full" />
                    <div className="h-3.5 shimmer rounded-lg w-4/5" />
                    <div className="h-3 shimmer rounded-lg w-1/3 mt-1" />
                    <div className="h-3 shimmer rounded-lg w-1/4" />
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="w-full aspect-video rounded-xl shimmer" />
            <div className="flex gap-3 mt-3">
                <div className="w-8 h-8 rounded-full shimmer shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2 pt-0.5">
                    <div className="h-3.5 shimmer rounded-lg w-full" />
                    <div className="h-3.5 shimmer rounded-lg w-3/4" />
                    <div className="h-3 shimmer rounded-lg w-1/2" />
                </div>
            </div>
        </div>
    );
};

export default VideoCardSkeleton;