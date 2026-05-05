import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-[#0f0f0f]">
            {/* Navbar */}
            <Navbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />

            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} />

            {/* Main content */}
            <main
                className={`pt-16 transition-all duration-300 min-h-screen
                ${sidebarOpen ? "lg:ml-56" : "lg:ml-20"}`}
            >
                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;