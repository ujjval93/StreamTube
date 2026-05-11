import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";
import { loginUser } from "../api/auth.api.js";
import { setCredentials } from "../store/slices/authSlice.js";

const Login = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const dispatch   = useDispatch();
    const navigate   = useNavigate();
    const [showPass, setShowPass] = useState(false);

    const onSubmit = async (data) => {
        try {
            const res              = await loginUser(data);
            const { user, accessToken } = res.data.data;
            dispatch(setCredentials({ user, accessToken }));
            toast.success(`Welcome back, ${user.fullName.split(" ")[0]}!`);
            navigate("/");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Invalid credentials");
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ background: "#0a0a0a" }}
        >
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 rounded-full opacity-20 blur-[120px] pointer-events-none"
                style={{ background: "radial-gradient(circle, #ff3d3d 0%, transparent 70%)" }}
            />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                            style={{ background: "#ff3d3d", boxShadow: "0 4px 20px rgba(255,61,61,0.4)" }}
                        >
                            <span className="text-white font-black text-sm">ST</span>
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight">
                            Stream<span style={{ color: "#ff3d3d" }}>Tube</span>
                        </span>
                    </Link>
                    <h1 className="text-white text-2xl font-bold tracking-tight">
                        Welcome back
                    </h1>
                    <p className="text-[#555] text-sm mt-2">
                        Sign in to continue watching
                    </p>
                </div>

                <div
                    className="rounded-2xl p-8"
                    style={{
                        background: "#111111",
                        border:     "1px solid rgba(255,255,255,0.07)",
                    }}
                >
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="text-[#666] text-xs uppercase tracking-wider mb-2 block">
                                Username or Email
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444] text-sm" />
                                <input
                                    type="text"
                                    placeholder="Enter username or email"
                                    {...register("username", { required: "This field is required" })}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl text-white text-sm placeholder:text-[#333] focus:outline-none transition-all duration-200"
                                    style={{
                                        background: "#1a1a1a",
                                        border: errors.username
                                            ? "1px solid rgba(255,61,61,0.5)"
                                            : "1px solid rgba(255,255,255,0.07)",
                                    }}
                                    onFocus={(e) => {
                                        if (!errors.username)
                                            e.target.style.border = "1px solid rgba(255,255,255,0.2)";
                                    }}
                                    onBlur={(e) => {
                                        if (!errors.username)
                                            e.target.style.border = "1px solid rgba(255,255,255,0.07)";
                                    }}
                                />
                            </div>
                            {errors.username && (
                                <p className="text-[#ff3d3d] text-xs mt-1.5">{errors.username.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-[#666] text-xs uppercase tracking-wider mb-2 block">
                                Password
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444] text-sm" />
                                <input
                                    type={showPass ? "text" : "password"}
                                    placeholder="Enter your password"
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: { value: 6, message: "At least 6 characters" },
                                    })}
                                    className="w-full pl-10 pr-12 py-3 rounded-xl text-white text-sm placeholder:text-[#333] focus:outline-none transition-all duration-200"
                                    style={{
                                        background: "#1a1a1a",
                                        border: errors.password
                                            ? "1px solid rgba(255,61,61,0.5)"
                                            : "1px solid rgba(255,255,255,0.07)",
                                    }}
                                    onFocus={(e) => {
                                        if (!errors.password)
                                            e.target.style.border = "1px solid rgba(255,255,255,0.2)";
                                    }}
                                    onBlur={(e) => {
                                        if (!errors.password)
                                            e.target.style.border = "1px solid rgba(255,255,255,0.07)";
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass((p) => !p)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors"
                                >
                                    {showPass ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-[#ff3d3d] text-xs mt-1.5">{errors.password.message}</p>
                            )}
                        </div>

                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            style={{
                                background:  isSubmitting ? "#cc3030" : "#ff3d3d",
                                boxShadow:   "0 4px 20px rgba(255,61,61,0.25)",
                            }}
                        >
                            {isSubmitting ? (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                            ) : (
                                <>
                                    Sign in
                                    <FiArrowRight className="text-sm" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                        <span className="text-[#333] text-xs">or</span>
                        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                    </div>

                    <p className="text-center text-[#555] text-sm">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="font-semibold transition-colors duration-150"
                            style={{ color: "#ff3d3d" }}
                        >
                            Create one
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;