import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-white text-8xl font-black mb-4">404</h1>
                <p className="text-white/50 text-lg mb-8">
                    This page doesn't exist
                </p>
                <Link
                    to="/"
                    className="bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-white/90 transition-colors"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;