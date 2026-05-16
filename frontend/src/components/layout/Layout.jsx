import { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FiHome, FiUpload, FiUser, FiClock } from "react-icons/fi";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

const mobileNavItems = [
    { to: "/",            icon: FiHome,   label: "Home",    exact: true },
    { to: "/history",     icon: FiClock,  label: "History", auth: true  },
    { to: "/upload",      icon: FiUpload, label: "Upload",  auth: true  },
];

const pageVariants = {
    initial:    { opacity: 0, y: 6 },
    animate:    { opacity: 1, y: 0 },
    exit:       { opacity: 0, y: -6 },
    transition: { duration: 0.2, ease: "easeOut" },
};

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { isAuthenticated, user }     = useSelector((state) => state.auth);
    const location                      = useLocation();

    useEffect(() => {
        const isMobile = window.innerWidth < 1024;
        if (isMobile && sidebarOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [sidebarOpen]);

    return (
        <div className="min-h-screen bg-[#0f0f0f] text-white">
            <Navbar onMenuClick={() => setSidebarOpen((prev) => !prev)} isCollapsed={!sidebarOpen} />

            <div className="pt-16">
                <div className="flex min-h-[calc(100vh-4rem)] overflow-hidden">
                    <Sidebar
                        isOpen={sidebarOpen}
                        isCollapsed={!sidebarOpen}
                        onClose={() => setSidebarOpen(false)}
                    />

                    <main className="flex-1 overflow-x-hidden">
                        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6">
                            <AnimatePresence mode="wait">
                                <motion.div key={location.pathname} {...pageVariants}>
                                    <Outlet />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </main>
                </div>
            </div>

            <nav
                className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
                style={{
                    background:          "rgba(15,15,15,0.98)",
                    backdropFilter:      "blur(20px)",
                    WebkitBackdropFilter:"blur(20px)",
                    borderTop:           "1px solid rgba(255,255,255,0.06)",
                }}
            >
                <div className="flex items-center justify-around px-2 py-2">
                    {mobileNavItems.map(({ to, icon: Icon, label, exact, auth }) => {
                        if (auth && !isAuthenticated) return null;
                        return (
                            <NavLink
                                key={to}
                                to={to}
                                end={exact}
                                className={({ isActive }) =>
                                    `flex flex-col items-center gap-1 px-5 py-1.5 rounded-xl transition-all duration-150
                                    ${isActive ? "text-[#ff3d3d]" : "text-[#666] hover:text-white"}`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className="relative">
                                            <Icon className="text-xl" />
                                            {isActive && (
                                                <motion.div
                                                    layoutId="mobileNav"
                                                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                                                    style={{ background: "#ff3d3d" }}
                                                />
                                            )}
                                        </div>
                                        <span className="text-[10px] font-medium">{label}</span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}

                    {isAuthenticated ? (
                        <NavLink
                            to={`/channel/${user?.username}`}
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-1 px-5 py-1.5 rounded-xl transition-all duration-150
                                ${isActive ? "text-[#ff3d3d]" : "text-[#666] hover:text-white"}`
                            }
                        >
                            <img
                                src={user?.avatar}
                                alt={user?.fullName}
                                className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-[10px] font-medium">Profile</span>
                        </NavLink>
                    ) : (
                        <NavLink
                            to="/login"
                            className={({ isActive }) =>
                                `flex flex-col items-center gap-1 px-5 py-1.5 rounded-xl transition-all duration-150
                                ${isActive ? "text-[#ff3d3d]" : "text-[#666] hover:text-white"}`
                            }
                        >
                            <FiUser className="text-xl" />
                            <span className="text-[10px] font-medium">Sign in</span>
                        </NavLink>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default Layout;