const VideoCardSkeleton = () => {
    return (
        <div className="animate-pulse">
            {/* Thumbnail */}
            <div className="w-full aspect-video rounded-xl bg-white/10" />
            {/* Info */}
            <div className="flex gap-3 mt-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-white/10 rounded w-full" />
                    <div className="h-3.5 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                </div>
            </div>
        </div>
    );
};

export default VideoCardSkeleton;