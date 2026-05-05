import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/layout/ProtectedRoute.jsx";

// ── Pages (we will build these one by one) ───────────────────────────────────
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VideoPlayer from "./pages/VideoPlayer.jsx";
import Channel from "./pages/Channel.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import UploadVideo from "./pages/UploadVideo.jsx";
import Playlists from "./pages/Playlists.jsx";
import PlaylistDetail from "./pages/PlaylistDetail.jsx";
import Settings from "./pages/Settings.jsx";
import WatchHistory from "./pages/WatchHistory.jsx";
import LikedVideos from "./pages/LikedVideos.jsx";
import NotFound from "./pages/NotFound.jsx";

// ── Layout ────────────────────────────────────────────────────────────────────
import Layout from "./components/layout/Layout.jsx";

function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Routes with Navbar/Sidebar layout */}
            <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="video/:videoId" element={<VideoPlayer />} />
                <Route path="channel/:username" element={<Channel />} />

                {/* Protected routes — must be logged in */}
                <Route element={<ProtectedRoute />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="upload" element={<UploadVideo />} />
                    <Route path="playlists" element={<Playlists />} />
                    <Route path="playlist/:playlistId" element={<PlaylistDetail />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="history" element={<WatchHistory />} />
                    <Route path="liked-videos" element={<LikedVideos />} />
                </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;