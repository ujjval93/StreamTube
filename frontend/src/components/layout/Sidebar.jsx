import { NavLink, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiHome,
    FiClock,
    FiThumbsUp,
    FiList,
    FiGrid,
    FiSettings,
    FiUpload,
    FiTrendingUp,
    FiX,
} from "react-icons/fi";

const SIDEBAR_OPEN_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 80;

const mainLinks = [
    { to: "/", icon: FiHome, label: "Home", exact: true },
    { to: "/history", icon: FiClock, label: "History", auth: true },
    { to: "/liked-videos", icon: FiThumbsUp, label: "Liked Videos", auth: true },
    { to: "/playlists", icon: FiList, label: "Playlists", auth: true },
];

const creatorLinks = [
    { to: "/upload", icon: FiUpload, label: "Upload Video", auth: true },
    { to: "/dashboard", icon: FiGrid, label: "Dashboard", auth: true },
    { to: "/settings", icon: FiSettings, label: "Settings", auth: true },
];

const labelLinks = [{ to: "/?sortBy=trending", icon: FiTrendingUp, label: "Trending" }];

const navItemClasses = (isActive, collapsed) =>
    `relative flex ${collapsed ? "flex-col items-center justify-center gap-1.5" : "items-center gap-3.5"} px-3 py-2.5 rounded-2xl transition-all duration-150 ${
        isActive
            ? "bg-[#1a1a1b] text-white shadow-[0_10px_30px_rgba(255,61,61,0.12)]"
            : "text-[#999] hover:text-white hover:bg-white/5"
    }`;

const NavItem = ({ to, icon: Icon, label, exact, collapsed }) => (
    <NavLink end={exact} to={to} className={({ isActive }) => navItemClasses(isActive, collapsed)}>
        <Icon className={collapsed ? "text-lg" : "text-lg"} />
        {collapsed ? <span className="text-[10px] leading-none">{label}</span> : <span className="text-sm font-medium">{label}</span>}
    </NavLink>
);

const Sidebar = ({ isOpen, isCollapsed, onClose }) => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const collapsedSidebarContent = (
        <div className="flex h-full flex-col items-center overflow-hidden px-2 py-4">
            <Link
                to="/"
                className="flex h-14 w-full items-center justify-center rounded-3xl border border-white/10 bg-[#101010] text-white transition hover:border-white/20"
                onClick={onClose}
                aria-label="StreamTube home"
            >
                <div className="flex h-11 w-11 items-center justify-center shrink-0 overflow-hidden rounded-2xl bg-[#ff3d3d]">
                    <img
                        src="/logo.png"
                        alt="StreamTube"
                        className="h-full w-full object-contain"
                    />
                </div>
            </Link>

            <div className="mt-6 flex w-full flex-col gap-2">
                {mainLinks.map(({ to, icon, label, exact, auth }) => {
                    if (auth && !isAuthenticated) return null;
                    return <NavItem key={to} to={to} icon={icon} label={label} exact={exact} collapsed />;
                })}

                {isAuthenticated && (
                    <div className="mt-2 w-full border-t border-white/10 pt-2">
                        {creatorLinks.map(({ to, icon, label }) => (
                            <NavItem key={to} to={to} icon={icon} label={label} collapsed />
                        ))}
                    </div>
                )}

                <div className="mt-2 w-full border-t border-white/10 pt-2">
                    {labelLinks.map(({ to, icon, label }) => (
                        <NavItem key={to} to={to} icon={icon} label={label} collapsed />
                    ))}
                </div>
            </div>

            {isAuthenticated && user && (
                <div className="mt-auto flex w-full items-center justify-center">
                    <Link
                        to={`/channel/${user.username}`}
                        className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#111] text-white transition hover:bg-white/5"
                        onClick={onClose}
                    >
                        <img src={user.avatar} alt={user.fullName} className="h-10 w-10 rounded-2xl object-cover" />
                    </Link>
                </div>
            )}
        </div>
    );

    const fullSidebarContent = (
        <div className="flex h-full flex-col overflow-y-auto overflow-x-hidden p-4 pb-6 scrollbar-hide">
            

            <div className="space-y-1 px-2">
                {mainLinks.map(({ to, icon, label, exact, auth }) => {
                    if (auth && !isAuthenticated) return null;
                    return <NavItem key={to} to={to} icon={icon} label={label} exact={exact} collapsed={false} />;
                })}
            </div>

            {isAuthenticated && (
                <div className="mt-6 border-t border-white/10 pt-4">
                    <p className="px-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[#777]">Creator</p>
                    <div className="mt-3 space-y-1 px-2">
                        {creatorLinks.map(({ to, icon, label }) => (
                            <NavItem key={to} to={to} icon={icon} label={label} collapsed={false} />
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-6 border-t border-white/10 pt-4">
                <p className="px-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[#777]">Explore</p>
                <div className="mt-3 space-y-1 px-2">
                    {labelLinks.map(({ to, icon, label }) => (
                        <NavItem key={to} to={to} icon={icon} label={label} collapsed={false} />
                    ))}
                </div>
            </div>

            {isAuthenticated && user && (
                <div className="mt-auto rounded-3xl border border-white/10 bg-[#101010] p-4 mb-15">
                    <Link
                        to={`/channel/${user.username}`}
                        className={`flex items-center gap-3 rounded-3xl bg-[#111] p-3 transition hover:bg-white/5 ${isCollapsed ? "justify-center" : ""}`}
                        onClick={onClose}
                    >
                        <img src={user.avatar} alt={user.fullName} className="h-11 w-11 rounded-2xl object-cover" />
                        {!isCollapsed && (
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">{user.fullName}</p>
                                <p className="truncate text-xs text-[#888]">View channel</p>
                            </div>
                        )}
                    </Link>
                </div>
            )}
        </div>
    );

    const sidebarContent = isCollapsed ? collapsedSidebarContent : fullSidebarContent;

    return (
        <>
            <motion.aside
                animate={{
                    width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_OPEN_WIDTH,
                }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 30,
                    mass: 0.8,
                }}
                className="hidden lg:flex lg:flex-col lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-hidden lg:border-r lg:border-white/10 lg:bg-[#090909]"
            >
                {sidebarContent}
            </motion.aside>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="fixed inset-0 z-40 lg:hidden"
                            style={{ background: "rgba(0,0,0,0.72)" }}
                            onClick={onClose}
                        />
                        <motion.aside
                            initial={{ x: -320 }}
                            animate={{ x: 0 }}
                            exit={{ x: -320 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed top-20 left-0 bottom-0 z-40 flex w-72 flex-col overflow-hidden border-r border-white/10 bg-[#101010]"
                        >
                            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                                <Link to="/" className="flex items-center gap-3" onClick={onClose} aria-label="StreamTube home">
                                    <div className="flex h-10 w-10 items-center justify-center shrink-0 overflow-hidden rounded-2xl bg-[#ff3d3d]">
                                        <img
                                            src="/logo.png"
                                            alt="StreamTube"
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">StreamTube</p>
                                        <p className="text-xs text-[#888]">Creator Studio</p>
                                    </div>
                                </Link>
                                <button
                                    onClick={onClose}
                                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 text-[#aaa] transition hover:border-white/20 hover:text-white"
                                >
                                    <FiX />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto scrollbar-hide">
                                {fullSidebarContent}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
