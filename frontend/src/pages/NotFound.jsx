import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHome, FiArrowLeft, FiSearch } from "react-icons/fi";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ background: "#0a0a0a" }}
        >
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full opacity-10 blur-[120px] pointer-events-none"
                style={{ background: "radial-gradient(circle, #ff3d3d 0%, transparent 70%)" }}
            />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-center relative z-10 max-w-md"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
                    className="mb-6"
                >
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6" style={{ background: "rgba(255,61,61,0.08)", border: "1px solid rgba(255,61,61,0.15)" }}>
                        <span className="text-5xl font-black" style={{ color: "#ff3d3d" }}>
                            !
                        </span>
                    </div>

                    <motion.h1
                        className="font-black tracking-tight mb-2"
                        style={{
                            fontSize:   "7rem",
                            lineHeight: 1,
                            background: "linear-gradient(135deg, #ff3d3d 0%, #ff8c42 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor:  "transparent",
                            backgroundClip:       "text",
                        }}
                    >
                        404
                    </motion.h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <h2 className="text-white text-xl font-bold mb-2">Page not found</h2>
                    <p className="text-[#555] text-sm leading-relaxed">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-3 flex-wrap"
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[#666] hover:text-white text-sm font-medium transition-all duration-150"
                        style={{
                            background: "rgba(255,255,255,0.05)",
                            border:     "1px solid rgba(255,255,255,0.08)",
                        }}
                    >
                        <FiArrowLeft className="text-sm" />
                        Go back
                    </button>

                    <Link
                        to="/"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-150"
                        style={{
                            background: "#ff3d3d",
                            boxShadow:  "0 4px 16px rgba(255,61,61,0.25)",
                        }}
                    >
                        <FiHome className="text-sm" />
                        Go home
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-10"
                >
                    <p className="text-[#333] text-xs mb-3">Looking for something?</p>
                    <Link
                        to="/?query="
                        className="inline-flex items-center gap-2 text-[#555] hover:text-white text-sm transition-colors"
                    >
                        <FiSearch className="text-sm" />
                        Search StreamTube
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default NotFound;