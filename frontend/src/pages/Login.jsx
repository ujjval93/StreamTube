import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";
import toast from "react-hot-toast";
import { loginUser } from "../api/auth.api.js";
import { setCredentials } from "../store/slices/authSlice.js";

const Login = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (data) => {
        try {
            const response = await loginUser(data);
            const { user, accessToken } = response.data.data;

            dispatch(setCredentials({ user, accessToken }));
            toast.success(`Welcome back, ${user.fullName}!`);
            navigate("/");
        } catch (error) {
            toast.error(
                error?.response?.data?.message || "Login failed. Please try again."
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-red-600 rounded-2xl mb-4">
                        <span className="text-white font-black text-xl">ST</span>
                    </div>
                    <h1 className="text-white text-2xl font-bold">Sign in</h1>
                    <p className="text-white/50 text-sm mt-1">
                        to continue to StreamTube
                    </p>
                </div>

                {/* Form card */}
                <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-white/10 shadow-2xl">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Username or Email */}
                        <div>
                            <label className="text-white/70 text-sm mb-1.5 block">
                                Username or Email
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-lg" />
                                <input
                                    type="text"
                                    placeholder="Enter username or email"
                                    {...register("username", {
                                        required: "Username or email is required",
                                    })}
                                    className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                            {errors.username && (
                                <p className="text-red-400 text-xs mt-1.5">
                                    {errors.username.message}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="text-white/70 text-sm mb-1.5 block">
                                Password
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-lg" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 6,
                                            message: "Password must be at least 6 characters",
                                        },
                                    })}
                                    className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-400 text-xs mt-1.5">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm mt-2"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-white/30 text-xs">or</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Register link */}
                    <p className="text-center text-white/50 text-sm">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;