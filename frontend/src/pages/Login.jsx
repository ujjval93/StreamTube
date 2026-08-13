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
        formState: { errors, isSubmitting, isValid },
    } = useForm({ mode: "onChange" });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPass, setShowPass] = useState(false);

    const onSubmit = async (data) => {
        try {
            const res = await loginUser({ username: data.username.trim(), password: data.password });
            const { user, accessToken } = res.data.data;
            dispatch(setCredentials({ user, accessToken }));
            toast.success(`Welcome back, ${user.fullName.split(" ")[0]}!`);
            navigate("/");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Invalid credentials");
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] px-4 py-10 text-white">
            <div className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-[36px] border border-white/10 bg-[#080808]/95 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.45)] lg:p-10">
                <div className="pointer-events-none absolute inset-x-0 top-6 h-96 bg-[radial-gradient(circle_at_top,rgba(255,61,61,0.16),transparent_40%)]" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative grid gap-8 md:grid-cols-[1.1fr_0.9fr]"
                >
                    <div className="rounded-4xl border border-white/10 bg-[#0f0f0f] p-8 lg:p-10">
                        <div className="mb-6">
                            <p className="text-xs uppercase tracking-[0.35em] text-[#888]">Welcome back</p>
                            <h1 className="mt-4 text-4xl font-semibold text-white">Sign in to StreamTube</h1>
                            <p className="mt-4 text-sm leading-7 text-[#b3b3b3]">
                                Access your videos, upload dashboard, and personalized recommendations with one secure login.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                                <p className="text-xs uppercase tracking-[0.35em] text-[#888]">Creators</p>
                                <p className="mt-3 text-sm text-white">Manage uploads, analytics, and your channel from one place.</p>
                            </div>
                            <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                                <p className="text-xs uppercase tracking-[0.35em] text-[#888]">Premium</p>
                                <p className="mt-3 text-sm text-white">Secure token storage and refreshing for continuous sessions.</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-4xl border border-white/10 bg-[#121212] p-8 lg:p-10">
                        <div className="mb-6">
                            <p className="text-xs uppercase tracking-[0.35em] text-[#888]">Access your account</p>
                            <h2 className="mt-2 text-3xl font-semibold text-white">Sign in</h2>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <label className="block">
                                <span className="text-xs uppercase tracking-[0.35em] text-[#888]">Username or email</span>
                                <div className="relative mt-2">
                                    <FiMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" />
                                    <input
                                        type="text"
                                        placeholder="Your username or email"
                                        {...register("username", { required: "Username or email is required" })}
                                        className="w-full rounded-3xl border border-white/10 bg-[#101010] px-12 py-3 text-white placeholder:text-[#666] outline-none transition duration-200 focus:border-[#ff3d3d]"
                                    />
                                </div>
                                {errors.username && <p className="mt-2 text-xs text-[#ff6b6b]">{errors.username.message}</p>}
                            </label>

                            <label className="block">
                                <span className="text-xs uppercase tracking-[0.35em] text-[#888]">Password</span>
                                <div className="relative mt-2">
                                    <FiLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" />
                                    <input
                                        type={showPass ? "text" : "password"}
                                        placeholder="Enter your password"
                                        {...register("password", {
                                            required: "Password is required",
                                            minLength: { value: 6, message: "At least 6 characters" },
                                        })}
                                        className="w-full rounded-3xl border border-white/10 bg-[#101010] px-12 py-3 pr-14 text-white placeholder:text-[#666] outline-none transition duration-200 focus:border-[#ff3d3d]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass((prev) => !prev)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] transition duration-200 hover:text-white"
                                    >
                                        {showPass ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-2 text-xs text-[#ff6b6b]">{errors.password.message}</p>}
                            </label>

                            <button
                                type="submit"
                                disabled={!isValid || isSubmitting}
                                className="flex w-full items-center justify-center gap-2 rounded-3xl bg-[#ff3d3d] px-5 py-3 text-sm font-semibold text-white transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#ff5757]"
                            >
                                {isSubmitting ? "Signing in..." : "Sign in"}
                                <FiArrowRight className="text-base" />
                            </button>
                        </form>

                        <div className="mt-6 border-t border-white/10 pt-6 text-sm text-[#888]">
                            Don’t have an account?{' '}
                            <Link to="/register" className="font-semibold text-white hover:text-[#ff6b6b]">
                                Create one
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
