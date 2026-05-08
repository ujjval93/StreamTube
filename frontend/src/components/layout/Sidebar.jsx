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

const mainLinks = [
    { to: "/",        icon: FiHome,      label: "Home",         exact: true  },
    { to: "/history", icon: FiClock,     label: "History",      auth: true   },
    { to: "/liked-videos", icon: FiThumbsUp, label: "Liked Videos", auth: true },
    { to: "/playlists",    icon: FiList,     label: "Playlists",    auth: true },
];

const creatorLinks = [
    { to: "/upload",    icon: FiUpload, label: "Upload Video", auth: true },
    { to: "/dashboard", icon: FiGrid,   label: "Dashboard",    auth: true },
    { to: "/settings",  icon: FiSettings, label: "Settings",   auth: true },
];

const sidebarVariants = {
    open:   { x: 0,    transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: -280, transition: { type: "spring", stiffness: 300, damping: 30 } },
};

const overlayVariants = {
    open:   { opacity: 1 },
    closed: { opacity: 0 },
};

const NavItem = ({ to, icon: Icon, label, exact, isOpen }) => {
    return (
        <NavLink
            to={to}
            end={exact}
            className={({ isActive }) =>
                `relative flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-150 group
                ${isActive
                    ? "text-white"
                    : "text-[#888] hover:text-white hover:bg-white/6"
                }`
            }
        >
            {({ isActive }) => (
                <>
                    {isActive && (
                        <motion.div
                            layoutId="activeNav"
                            className="absolute inset-0 rounded-xl"
                            style={{ background: "rgba(255,61,61,0.12)" }}
                            transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        />
                    )}
                    <div className="relative flex items-center gap-3.5 w-full">
                        <Icon
                            className={`text-lg shrink-0 transition-colors duration-150 ${
                                isActive ? "text-[#ff3d3d]" : ""
                            }`}
                        />
                        <AnimatePresence>
                            {isOpen && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                                >
                                    {label}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                </>
            )}
        </NavLink>
    );
};

const SectionLabel = ({ label, isOpen }) => {
    if (!isOpen) return <div className="h-px bg-white/6 mx-2 my-2" />;
    return (
        <p className="px-3 pt-4 pb-1.5 text-xs font-semibold uppercase tracking-widest text-[#444]">
            {label}
        </p>
    );
};

const Sidebar = ({ isOpen, onClose }) => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const sidebarContent = (
        <div className="flex flex-col h-full py-3 overflow-y-auto overflow-x-hidden scrollbar-hide">
            <div className="px-2 space-y-0.5">
                {mainLinks.map(({ to, icon, label, exact, auth }) => {
                    if (auth && !isAuthenticated) return null;
                    return (
                        <NavItem
                            key={to}
                            to={to}
                            icon={icon}
                            label={label}
                            exact={exact}
                            isOpen={isOpen}
                        />
                    );
                })}
            </div>

            {isAuthenticated && (
                <>
                    <SectionLabel label="Creator" isOpen={isOpen} />
                    <div className="px-2 space-y-0.5">
                        {creatorLinks.map(({ to, icon, label }) => (
                            <NavItem
                                key={to}
                                to={to}
                                icon={icon}
                                label={label}
                                isOpen={isOpen}
                            />
                        ))}
                    </div>
                </>
            )}

            {isAuthenticated && isOpen && user && (
                <div className="mt-auto px-2 pt-4 pb-2">
                    <Link
                        to={`/channel/${user.username}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/6 transition-all duration-150 group"
                    >
                        <img
                            src={user.avatar}
                            alt={user.fullName}
                            className="w-8 h-8 rounded-lg object-cover shrink-0"
                        />
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="min-w-0"
                                >
                                    <p className="text-white text-sm font-medium truncate">
                                        {user.fullName}
                                    </p>
                                    <p className="text-[#555] text-xs truncate">
                                        View channel
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Link>
                </div>
            )}
        </div>
    );

    return (
        <>
            <motion.aside
                animate={{ width: isOpen ? 240 : 72 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 hidden lg:block overflow-hidden"
                style={{
                    background:   "#0f0f0f",
                    borderRight:  "1px solid rgba(255,255,255,0.05)",
                }}
            >
                {sidebarContent}
            </motion.aside>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            variants={overlayVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-40 lg:hidden"
                            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
                            onClick={onClose}
                        />

                        <motion.aside
                            variants={sidebarVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            className="fixed top-0 left-0 h-full w-64 z-50 lg:hidden flex flex-col"
                            style={{
                                background:  "#181818",
                                borderRight: "1px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            <div
                                className="flex items-center justify-between px-4 h-16 shrink-0"
                                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                            >
                                <Link to="/" className="flex items-center gap-2.5" onClick={onClose}>
                                    <div
                                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                                        style={{ background: "#ff3d3d" }}
                                    >
                                        <span className="text-white font-black text-xs">ST</span>
                                    </div>
                                    <span className="text-white font-bold text-base tracking-tight">
                                        Stream<span style={{ color: "#ff3d3d" }}>Tube</span>
                                    </span>
                                </Link>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[#666] hover:text-white hover:bg-white/8 transition-all duration-150"
                                >
                                    <FiX className="text-lg" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto py-3 scrollbar-hide">
                                <div className="px-2 space-y-0.5">
                                    {mainLinks.map(({ to, icon, label, exact, auth }) => {
                                        if (auth && !isAuthenticated) return null;
                                        return (
                                            <div key={to} onClick={onClose}>
                                                <NavItem
                                                    to={to}
                                                    icon={icon}
                                                    label={label}
                                                    exact={exact}
                                                    isOpen={true}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>

                                {isAuthenticated && (
                                    <>
                                        <SectionLabel label="Creator" isOpen={true} />
                                        <div className="px-2 space-y-0.5">
                                            {creatorLinks.map(({ to, icon, label }) => (
                                                <div key={to} onClick={onClose}>
                                                    <NavItem
                                                        to={to}
                                                        icon={icon}
                                                        label={label}
                                                        isOpen={true}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;