import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { FiSearch, FiUpload, FiBell, FiMenu, FiX } from "react-icons/fi";
import { logout } from "../../store/slices/authSlice.js";
import { logoutUser } from "../../api/auth.api.js";
import toast from "react-hot-toast";

const Navbar = ({ onMenuClick }) => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?query=${searchQuery.trim()}`);
        }
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
            dispatch(logout());
            toast.success("Logged out successfully");
            navigate("/login");
        } catch {
            dispatch(logout());
            navigate("/login");
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f] border-b border-white/10 h-16 flex items-center px-4 gap-4">
            {/* Left — logo + hamburger */}
            <div className="flex items-center gap-3 min-w-50">
                <button
                    onClick={onMenuClick}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <FiMenu className="text-white text-xl" />
                </button>
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-black text-sm">ST</span>
                    </div>
                    <span className="text-white font-bold text-lg tracking-tight hidden sm:block">
                        StreamTube
                    </span>
                </Link>
            </div>

            {/* Center — search */}
            <form
                onSubmit={handleSearch}
                className="flex-1 max-w-2xl mx-auto flex items-center"
            >
                <div className="flex w-full">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search"
                        className="w-full bg-[#121212] border border-white/20 rounded-l-full px-5 py-2 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <button
                        type="submit"
                        className="bg-white/10 border border-white/20 border-l-0 rounded-r-full px-5 hover:bg-white/20 transition-colors"
                    >
                        <FiSearch className="text-white text-lg" />
                    </button>
                </div>
            </form>

            {/* Right — actions */}
            <div className="flex items-center gap-2 min-w-37.5 justify-end">
                {isAuthenticated ? (
                    <>
                        <Link
                            to="/upload"
                            className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            title="Upload video"
                        >
                            <FiUpload className="text-white text-xl" />
                        </Link>
                        <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                            <FiBell className="text-white text-xl" />
                        </button>

                        {/* Avatar dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/20 hover:border-white/50 transition-colors"
                            >
                                <img
                                    src={user?.avatar}
                                    alt={user?.fullName}
                                    className="w-full h-full object-cover"
                                />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 top-12 w-56 bg-[#212121] rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50">
                                    {/* User info */}
                                    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                                        <img
                                            src={user?.avatar}
                                            alt={user?.fullName}
                                            className="w-9 h-9 rounded-full object-cover"
                                        />
                                        <div className="overflow-hidden">
                                            <p className="text-white text-sm font-medium truncate">
                                                {user?.fullName}
                                            </p>
                                            <p className="text-white/50 text-xs truncate">
                                                @{user?.username}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Links */}
                                    <Link
                                        to={`/channel/${user?.username}`}
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center px-4 py-3 text-white/80 hover:bg-white/10 text-sm transition-colors"
                                    >
                                        Your channel
                                    </Link>
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center px-4 py-3 text-white/80 hover:bg-white/10 text-sm transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                    <Link
                                        to="/settings"
                                        onClick={() => setDropdownOpen(false)}
                                        className="flex items-center px-4 py-3 text-white/80 hover:bg-white/10 text-sm transition-colors"
                                    >
                                        Settings
                                    </Link>
                                    <div className="border-t border-white/10">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-3 text-red-400 hover:bg-white/10 text-sm transition-colors"
                                        >
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <Link
                        to="/login"
                        className="flex items-center gap-2 border border-blue-500 text-blue-400 px-4 py-1.5 rounded-full text-sm hover:bg-blue-500/10 transition-colors"
                    >
                        Sign in
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;