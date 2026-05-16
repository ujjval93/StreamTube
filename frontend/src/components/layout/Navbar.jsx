import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiUpload, FiBell, FiMenu, FiLogOut, FiSettings, FiGrid, FiUser, FiChevronRight } from "react-icons/fi";
import toast from "react-hot-toast";
import { logoutUser } from "../../api/auth.api.js";
import { logout } from "../../store/slices/authSlice.js";

const menuVariants = {
    initial: { opacity: 0, y: 8, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 8, scale: 0.98 },
};

const Navbar = ({ onMenuClick, isCollapsed }) => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const handleSearch = (event) => {
        event.preventDefault();
        if (!searchQuery.trim()) return;
        navigate(`/?query=${encodeURIComponent(searchQuery.trim())}`);
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch {
        } finally {
            dispatch(logout());
            toast.success("Signed out successfully");
            navigate("/login");
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#090909]/95 backdrop-blur-xl px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <motion.div
                className="flex h-16 items-center gap-3"
                animate={{ marginLeft: isCollapsed ? 64 : 244 }}
                transition={{ type: "spring", stiffness: 280, damping: 30 }}
            >
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#101010] text-[#bbb] transition hover:border-white/20 hover:text-white"
                >
                    <FiMenu className="text-xl" />
                </button>

                <Link to="/" className="flex items-center gap-3 whitespace-nowrap overflow-hidden">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff3d3d] text-white shadow-[0_10px_30px_rgba(255,61,61,0.25)]">
                        ST
                    </div>
                    <motion.div
                        className="hidden md:flex md:flex-col"
                        animate={{ width: isCollapsed ? 0 : 120 }}
                        transition={{ duration: 0.2 }}
                    >
                        <p className="text-sm font-bold text-white">StreamTube</p>
                        <p className="text-xs text-[#888]">Creator Studio</p>
                    </motion.div>
                </Link>

                <form onSubmit={handleSearch} className="flex flex-1 items-center justify-center">
                    <div className={`flex w-full max-w-2xl items-center gap-3 rounded-2xl border px-3 py-2 transition ${searchFocused ? "border-[#ff3d3d] bg-[#121212]" : "border-white/10 bg-[#101010]"}`}>
                        <FiSearch className="text-[#888]" />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            placeholder="Search videos, channels, topics..."
                            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#555]"
                        />
                        <button
                            type="submit"
                            className="rounded-2xl bg-[#ff3d3d] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#ff5f5f]"
                        >
                            Search
                        </button>
                    </div>
                </form>

                <div className="flex items-center gap-2">
                    <Link
                        to="/upload"
                        className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-[#101010] px-4 py-2 text-sm text-white transition hover:border-white/20 hover:bg-[#141414] lg:flex"
                    >
                        <FiUpload />
                        Upload
                    </Link>

                    {isAuthenticated ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setDropdownOpen((prev) => !prev)}
                                className="flex h-11 items-center gap-3 rounded-2xl border border-white/10 bg-[#101010] px-3 pr-4 text-white transition hover:border-white/20"
                            >
                                <img src={user?.avatar} alt={user?.fullName} className="h-9 w-9 rounded-2xl object-cover" />
                                <div className="hidden min-w-0 flex-col truncate sm:flex">
                                    <span className="truncate text-sm font-medium">{user?.fullName}</span>
                                    <span className="truncate text-xs text-[#999]">@{user?.username}</span>
                                </div>
                            </button>

                            <AnimatePresence>
                                {dropdownOpen && (
                                    <motion.div
                                        variants={menuVariants}
                                        initial="initial"
                                        animate="animate"
                                        exit="exit"
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-16 w-72 overflow-hidden rounded-3xl border border-white/10 bg-[#121212] shadow-[0_30px_90px_rgba(0,0,0,0.45)]"
                                        style={{ zIndex: 60 }}
                                    >
                                        <div className="border-b border-white/10 p-4">
                                            <p className="text-sm font-medium text-white">Signed in as</p>
                                            <p className="truncate text-xs text-[#999]">{user?.email || user?.username}</p>
                                        </div>
                                        <div className="space-y-1 p-2">
                                            <Link
                                                to={`/channel/${user?.username}`}
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-white transition hover:bg-white/5"
                                            >
                                                <FiUser />
                                                Your channel
                                            </Link>
                                            <Link
                                                to="/dashboard"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-white transition hover:bg-white/5"
                                            >
                                                <FiGrid />
                                                Dashboard
                                            </Link>
                                            <Link
                                                to="/settings"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm text-white transition hover:bg-white/5"
                                            >
                                                <FiSettings />
                                                Settings
                                            </Link>
                                        </div>
                                        <div className="border-t border-white/10 p-2">
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm text-[#ff6b6b] transition hover:bg-white/5"
                                            >
                                                <FiLogOut />
                                                Sign out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="hidden items-center gap-2 lg:flex">
                            <Link
                                to="/login"
                                className="rounded-2xl border border-white/10 bg-[#101010] px-4 py-2 text-sm text-white transition hover:border-white/20"
                            >
                                Sign in
                            </Link>
                            <Link
                                to="/register"
                                className="rounded-2xl bg-[#ff3d3d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff5f5f]"
                            >
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>
                </motion.div>
            </nav>
    );
};

export default Navbar;
