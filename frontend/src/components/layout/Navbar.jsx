import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiSearch,
    FiUpload,
    FiBell,
    FiMenu,
    FiLogOut,
    FiSettings,
    FiGrid,
    FiUser,
    FiChevronRight,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { logoutUser } from "../../api/auth.api.js";
import { logout } from "../../store/slices/authSlice.js";

const dropdownVariants = {
    initial:    { opacity: 0, y: 8, scale: 0.96 },
    animate:    { opacity: 1, y: 0, scale: 1 },
    exit:       { opacity: 0, y: 8, scale: 0.96 },
    transition: { duration: 0.15, ease: "easeOut" },
};

const Navbar = ({ onMenuClick }) => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const dispatch  = useDispatch();
    const navigate  = useNavigate();

    const [searchQuery,   setSearchQuery]   = useState("");
    const [searchFocused, setSearchFocused] = useState(false);
    const [dropdownOpen,  setDropdownOpen]  = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?query=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch {
        } finally {
            dispatch(logout());
            setDropdownOpen(false);
            toast.success("Signed out successfully");
            navigate("/login");
        }
    };

    const navLinks = [
        { to: `/channel/${user?.username}`, icon: FiUser,     label: "Your Channel" },
        { to: "/dashboard",                  icon: FiGrid,     label: "Dashboard"    },
        { to: "/settings",                   icon: FiSettings, label: "Settings"     },
    ];

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4 gap-4"
            style={{
                background:          "rgba(15, 15, 15, 0.95)",
                backdropFilter:      "blur(20px)",
                WebkitBackdropFilter:"blur(20px)",
                borderBottom:        "1px solid rgba(255,255,255,0.06)",
            }}
        >
            <div className="flex items-center gap-3 w-55 shrink-0">
                <button
                    onClick={onMenuClick}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-[#aaaaaa] hover:text-white hover:bg-white/8 transition-all duration-150"
                >
                    <FiMenu className="text-xl" />
                </button>

                <Link to="/" className="flex items-center gap-2.5">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "#ff3d3d" }}
                    >
                        <span className="text-white font-black text-sm tracking-tight">ST</span>
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight hidden sm:block">
                        Stream<span style={{ color: "#ff3d3d" }}>Tube</span>
                    </span>
                </Link>
            </div>

            <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto">
                <div
                    className="flex items-center rounded-xl overflow-hidden transition-all duration-200"
                    style={{
                        background: searchFocused ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.05)",
                        border:     searchFocused ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.08)",
                    }}
                >
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        placeholder="Search videos, channels..."
                        className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2.5 text-[#aaaaaa] hover:text-white transition-colors duration-150 border-l border-white/8"
                    >
                        <FiSearch className="text-lg" />
                    </button>
                </div>
            </form>

            <div className="flex items-center gap-1.5 w-55 justify-end shrink-0">
                {isAuthenticated ? (
                    <>
                        <Link
                            to="/upload"
                            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-[#aaaaaa] hover:text-white hover:bg-white/8 transition-all duration-150"
                        >
                            <FiUpload className="text-base" />
                            <span className="hidden md:inline">Upload</span>
                        </Link>

                        <button className="w-10 h-10 flex items-center justify-center rounded-xl text-[#aaaaaa] hover:text-white hover:bg-white/8 transition-all duration-150">
                            <FiBell className="text-xl" />
                        </button>

                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen((prev) => !prev)}
                                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-white/8 transition-all duration-150"
                            >
                                <img
                                    src={user?.avatar}
                                    alt={user?.fullName}
                                    className="w-8 h-8 rounded-lg object-cover"
                                />
                                <span className="text-sm text-white font-medium hidden lg:block max-w-25 truncate">
                                    {user?.fullName?.split(" ")[0]}
                                </span>
                            </button>

                            <AnimatePresence>
                                {dropdownOpen && (
                                    <motion.div
                                        {...dropdownVariants}
                                        className="absolute right-0 top-12 w-60 rounded-2xl overflow-hidden z-50"
                                        style={{
                                            background:  "#181818",
                                            border:      "1px solid rgba(255,255,255,0.08)",
                                            boxShadow:   "0 8px 40px rgba(0,0,0,0.7)",
                                        }}
                                    >
                                        <div className="p-4 border-b border-white/8">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user?.avatar}
                                                    alt={user?.fullName}
                                                    className="w-10 h-10 rounded-xl object-cover"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-white text-sm font-semibold truncate">
                                                        {user?.fullName}
                                                    </p>
                                                    <p className="text-[#666] text-xs truncate">
                                                        @{user?.username}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-2">
                                            {navLinks.map(({ to, icon: Icon, label }) => (
                                                <Link
                                                    key={to}
                                                    to={to}
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[#aaaaaa] hover:text-white hover:bg-white/6 transition-all duration-150 group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Icon className="text-base" />
                                                        <span className="text-sm">{label}</span>
                                                    </div>
                                                    <FiChevronRight className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="p-2 border-t border-white/8">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all duration-150"
                                            >
                                                <FiLogOut className="text-base" />
                                                <span className="text-sm font-medium">Sign out</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-2">
                        <Link
                            to="/login"
                            className="px-4 py-2 rounded-xl text-sm font-medium text-[#aaaaaa] hover:text-white hover:bg-white/8 transition-all duration-150"
                        >
                            Sign in
                        </Link>
                        <Link
                            to="/register"
                            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-150 active:scale-95"
                            style={{ background: "#ff3d3d" }}
                        >
                            Sign up
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;