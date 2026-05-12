import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock, FiCamera, FiImage, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";
import { registerUser, loginUser } from "../api/auth.api.js";
import { setCredentials } from "../store/slices/authSlice.js";

const Register = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
    } = useForm({ mode: "onChange" });

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [showPass, setShowPass] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);

    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const avatarInputRegister = register("avatar", { required: "Avatar is required" });
    const coverInputRegister = register("coverImage");

    const handleCoverChange = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data) => {
        if (!data.avatar?.[0]) {
            toast.error("Avatar is required");
            return;
        }

        const formData = new FormData();
        formData.append("fullName", data.fullName.trim());
        formData.append("email", data.email.trim());
        formData.append("username", data.username.trim().toLowerCase());
        formData.append("password", data.password);
        formData.append("avatar", data.avatar[0]);
        if (data.coverImage?.[0]) {
            formData.append("coverImage", data.coverImage[0]);
        }

        try {
            await registerUser(formData);
            const loginRes = await loginUser({ username: data.username.trim().toLowerCase(), password: data.password });
            const { user, accessToken } = loginRes.data.data;
            dispatch(setCredentials({ user, accessToken }));
            toast.success(`Welcome to StreamTube, ${user.fullName.split(" ")[0]}!`);
            navigate("/");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] px-4 py-10 text-white">
            <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 overflow-hidden rounded-[36px] border border-white/10 bg-[#080808]/95 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.45)] lg:p-10">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,rgba(255,61,61,0.16),transparent_40%)]" />
                <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

                <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="rounded-[36px] border border-white/10 bg-[#0f0f0f] p-8 lg:p-10"
                    >
                        <div className="mb-8 max-w-xl">
                            <p className="text-xs uppercase tracking-[0.4em] text-[#888]">Create account</p>
                            <h1 className="mt-4 text-4xl font-semibold text-white">Get started with StreamTube</h1>
                            <p className="mt-4 text-sm leading-7 text-[#b3b3b3]">
                                Build your creator profile, upload videos, and grow your audience with a polished dark interface designed for creators.
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                                <p className="text-xs uppercase tracking-[0.35em] text-[#888]">Fast</p>
                                <p className="mt-3 text-sm text-white">Instant validation and smooth interactions.</p>
                            </div>
                            <div className="rounded-3xl border border-white/8 bg-white/5 p-5">
                                <p className="text-xs uppercase tracking-[0.35em] text-[#888]">Secure</p>
                                <p className="mt-3 text-sm text-white">Persistent login state with token-based auth.</p>
                            </div>
                        </div>

                        <div className="mt-8 rounded-[28px] border border-white/8 bg-[#111] p-6">
                            <p className="text-xs uppercase tracking-[0.35em] text-[#888]">Avatar preview</p>
                            <div className="mt-4 flex items-center gap-4">
                                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#111]">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                                    ) : (
                                        <FiUser className="text-3xl text-[#666]" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Your creator avatar</p>
                                    <p className="text-xs text-[#777]">This appears across your channel and video cards.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
                        className="rounded-4xl border border-white/10 bg-[#121212] p-8 lg:p-10"
                    >
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.35em] text-[#888]">Sign up</p>
                                <h2 className="mt-2 text-3xl font-semibold text-white">Account details</h2>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="text-xs uppercase tracking-[0.35em] text-[#888]">Full name</span>
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        {...register("fullName", {
                                            required: "Full name is required",
                                            minLength: { value: 2, message: "Use at least 2 characters" },
                                        })}
                                        className="mt-2 w-full rounded-3xl border border-white/10 bg-[#101010] px-4 py-3 text-white placeholder:text-[#666] outline-none transition duration-200 focus:border-[#ff3d3d]"
                                    />
                                    {errors.fullName && <p className="mt-2 text-xs text-[#ff6b6b]">{errors.fullName.message}</p>}
                                </label>

                                <label className="block">
                                    <span className="text-xs uppercase tracking-[0.35em] text-[#888]">Username</span>
                                    <input
                                        type="text"
                                        placeholder="johndoe"
                                        {...register("username", {
                                            required: "Username is required",
                                            minLength: { value: 3, message: "At least 3 characters" },
                                            pattern: {
                                                value: /^[a-zA-Z0-9_]+$/,
                                                message: "Letters, numbers, and underscore only",
                                            },
                                        })}
                                        className="mt-2 w-full rounded-3xl border border-white/10 bg-[#101010] px-4 py-3 text-white placeholder:text-[#666] outline-none transition duration-200 focus:border-[#ff3d3d]"
                                    />
                                    {errors.username && <p className="mt-2 text-xs text-[#ff6b6b]">{errors.username.message}</p>}
                                </label>
                            </div>

                            <label className="block">
                                <span className="text-xs uppercase tracking-[0.35em] text-[#888]">Email</span>
                                <input
                                    type="email"
                                    placeholder="john@example.com"
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Enter a valid email",
                                        },
                                    })}
                                    className="mt-2 w-full rounded-3xl border border-white/10 bg-[#101010] px-4 py-3 text-white placeholder:text-[#666] outline-none transition duration-200 focus:border-[#ff3d3d]"
                                />
                                {errors.email && <p className="mt-2 text-xs text-[#ff6b6b]">{errors.email.message}</p>}
                            </label>

                            <label className="block">
                                <span className="text-xs uppercase tracking-[0.35em] text-[#888]">Password</span>
                                <div className="relative mt-2">
                                    <input
                                        type={showPass ? "text" : "password"}
                                        placeholder="Create a strong password"
                                        {...register("password", {
                                            required: "Password is required",
                                            minLength: { value: 6, message: "At least 6 characters" },
                                        })}
                                        className="w-full rounded-3xl border border-white/10 bg-[#101010] px-4 py-3 pr-12 text-white placeholder:text-[#666] outline-none transition duration-200 focus:border-[#ff3d3d]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass((prev) => !prev)}
                                        className="absolute inset-y-0 right-3 flex items-center text-[#999] transition duration-200 hover:text-white"
                                    >
                                        {showPass ? <FiEyeOff className="text-base" /> : <FiEye className="text-base" />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-2 text-xs text-[#ff6b6b]">{errors.password.message}</p>}
                            </label>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="block cursor-pointer">
                                    <span className="text-xs uppercase tracking-[0.35em] text-[#888]">Profile avatar</span>
                                    <div className="mt-2 flex items-center justify-between rounded-3xl border border-white/10 bg-[#101010] p-4 transition duration-200 hover:border-[#ff3d3d]">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[#060606]">
                                                {avatarPreview ? (
                                                    <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
                                                ) : (
                                                    <FiUser className="text-[#888] text-xl" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm text-white">Upload avatar</p>
                                                <p className="text-xs text-[#777]">PNG, JPG, WEBP</p>
                                            </div>
                                        </div>
                                        <span className="rounded-3xl bg-[#ff3d3d] px-4 py-2 text-xs font-semibold text-white">Browse</span>
                                    </div>
                                    <input
                                        className="hidden"
                                        type="file"
                                        accept="image/*"
                                        ref={avatarInputRef}
                                        {...avatarInputRegister}
                                        onChange={(event) => {
                                            avatarInputRegister.onChange(event);
                                            handleAvatarChange(event);
                                        }}
                                    />
                                    {errors.avatar && <p className="mt-2 text-xs text-[#ff6b6b]">{errors.avatar.message}</p>}
                                </label>

                                <label className="block cursor-pointer">
                                    <span className="text-xs uppercase tracking-[0.35em] text-[#888]">Cover image</span>
                                    <div className="mt-2 flex items-center justify-between rounded-3xl border border-white/10 bg-[#101010] p-4 transition duration-200 hover:border-[#ff3d3d]">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-[#060606]">
                                                {coverPreview ? (
                                                    <img src={coverPreview} alt="Cover preview" className="h-full w-full object-cover" />
                                                ) : (
                                                    <FiImage className="text-[#888] text-xl" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm text-white">Optional cover</p>
                                                <p className="text-xs text-[#777]">Better channel branding</p>
                                            </div>
                                        </div>
                                        <span className="rounded-3xl bg-white/10 px-4 py-2 text-xs font-semibold text-white">Choose</span>
                                    </div>
                                    <input
                                        className="hidden"
                                        type="file"
                                        accept="image/*"
                                        ref={coverInputRef}
                                        {...coverInputRegister}
                                        onChange={(event) => {
                                            coverInputRegister.onChange(event);
                                            handleCoverChange(event);
                                        }}
                                    />
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={!isValid || isSubmitting}
                                className="flex w-full items-center justify-center gap-2 rounded-3xl bg-[#ff3d3d] px-5 py-3 text-sm font-semibold text-white transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#ff5757]"
                            >
                                {isSubmitting ? "Creating account..." : "Create account"}
                                <FiArrowRight className="text-base" />
                            </button>
                        </form>

                        <div className="mt-6 border-t border-white/10 pt-5 text-center text-sm text-[#888]">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-white hover:text-[#ff6b6b]">
                                Sign in
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Register;
