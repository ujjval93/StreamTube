import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    FiHome,
    FiClock,
    FiThumbsUp,
    FiList,
    FiSettings,
    FiGrid,
    FiUsers,
} from "react-icons/fi";

const navItems = [
    { to: "/", icon: FiHome, label: "Home", exact: true },
    { to: "/history", icon: FiClock, label: "History", auth: true },
    { to: "/liked-videos", icon: FiThumbsUp, label: "Liked Videos", auth: true },
    { to: "/playlists", icon: FiList, label: "Playlists", auth: true },
    { to: "/dashboard", icon: FiGrid, label: "Dashboard", auth: true },
    { to: "/settings", icon: FiSettings, label: "Settings", auth: true },
];

const Sidebar = ({ isOpen }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);

    return (
        <>
            {/* Sidebar */}
            <aside
                className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-[#0f0f0f] z-40 transition-all duration-300 overflow-y-auto overflow-x-hidden
                ${isOpen ? "w-56" : "w-0 lg:w-20"}`}
            >
                <div className="py-3">
                    {navItems.map(({ to, icon: Icon, label, auth, exact }) => {
                        if (auth && !isAuthenticated) return null;
                        return (
                            <NavLink
                                key={to}
                                to={to}
                                end={exact}
                                className={({ isActive }) =>
                                    `flex items-center gap-5 px-5 py-3 mx-2 rounded-xl transition-colors group
                                    ${isActive
                                        ? "bg-white/10 text-white"
                                        : "text-white/60 hover:bg-white/5 hover:text-white"
                                    }`
                                }
                            >
                                <Icon className="text-xl shrink-0" />
                                <span
                                    className={`text-sm font-medium whitespace-nowrap transition-all duration-300
                                    ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 lg:hidden"}`}
                                >
                                    {label}
                                </span>
                            </NavLink>
                        );
                    })}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;