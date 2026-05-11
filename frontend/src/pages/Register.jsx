import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiEye, FiEyeOff, FiUser, FiMail,
    FiLock, FiCamera, FiArrowRight, FiCheck,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { registerUser, loginUser } from "../api/auth.api.js";
import { setCredentials } from "../store/slices/authSlice.js";

const InputField = ({ icon: Icon, label, error, ...props }) => {
    const [focused, setFocused] = useState(false);
    return (
        <div>
            <label className="text-[#666] text-xs uppercase tracking-wider mb-2 block">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444] text-sm" />
                )}
                <input
                    {...props}
                    onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
                    onBlur={(e)  => { setFocused(false); props.onBlur?.(e); }}
                    className="w-full py-3 rounded-xl text-white text-sm placeholder:text-[#333] focus:outline-none transition-all duration-200"
                    style={{
                        background:  "#1a1a1a",
                        paddingLeft: Icon ? "2.5rem" : "1rem",
                        paddingRight:"1rem",
                        border: error
                            ? "1px solid rgba(255,61,61,0.5)"
                            : focused
                            ? "1px solid rgba(255,255,255,0.2)"
                            : "1px solid rgba(255,255,255,0.07)",
                    }}
                />
            </div>
            {error && (
                <p className="text-[#ff3d3d] text-xs mt-1.5">{error}</p>
            )}
        </div>
    );
};

const Register = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm();

    const dispatch  = useDispatch();
    const navigate  = useNavigate();

    const [showPass,        setShowPass]        = useState(false);
    const [avatarPreview,   setAvatarPreview]   = useState(null);
    const [coverPreview,    setCoverPreview]     = useState(null);

    const avatarInputRef = useRef(null);
    const coverInputRef  = useRef(null);

    const { ref: avatarRHFRef, ...avatarRest } = register("avatar", { required: "Avatar is required" });
    const { ref: coverRHFRef,  ...coverRest  } = register("coverImage");

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) setAvatarPreview(URL.createObjectURL(file));
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) setCoverPreview(URL.createObjectURL(file));
    };

    const onSubmit = async (data) => {
        if (!data.avatar?.[0]) { toast.error("Avatar is required"); return; }

        const formData = new FormData();
        formData.append("fullName",  data.fullName);
        formData.append("email",     data.email);
        formData.append("username",  data.username);
        formData.append("password",  data.password);
        formData.append("avatar",    data.avatar[0]);
        if (data.coverImage?.[0]) formData.append("coverImage", data.coverImage[0]);

        try {
            await registerUser(formData);
            const loginRes              = await loginUser({ username: data.username, password: data.password });
            const { user, accessToken } = loginRes.data.data;
            dispatch(setCredentials({ user, accessToken }));
            toast.success(`Welcome to StreamTube, ${user.fullName.split(" ")[0]}!`);
            navigate("/");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{ background: "#0a0a0a" }}
        >
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 rounded-full opacity-15 blur-[120px] pointer-events-none"
                style={{ background: "radial-gradient(circle, #ff3d3d 0%, transparent 70%)" }}
            />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: "#ff3d3d", boxShadow: "0 4px 20px rgba(255,61,61,0.4)" }}
                        >
                            <span className="text-white font-black text-sm">ST</span>
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight">
                            Stream<span style={{ color: "#ff3d3d" }}>Tube</span>
                        </span>
                    </Link>
                    <h1 className="text-white text-2xl font-bold tracking-tight">
                        Create your account
                    </h1>
                    <p className="text-[#555] text-sm mt-2">
                        Join millions of creators and viewers
                    </p>
                </div>

                <div
                    className="rounded-2xl p-8"
                    style={{
                        background: "#111111",
                        border:     "1px solid rgba(255,255,255,0.07)",
                    }}
                >
                    <div
                        className="relative w-full h-28 rounded-xl overflow-hidden mb-3 cursor-pointer group"
                        style={{
                            background: "#1a1a1a",
                            border:     "1px solid rgba(255,255,255,0.07)",
                        }}
                        onClick={() => coverInputRef.current?.click()}
                    >
                        {coverPreview ? (
                            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-2">
                                <FiCamera className="text-[#333] text-xl" />
                                <span className="text-[#333] text-xs">Add cover image (optional)</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <FiCamera className="text-white text-lg" />
                            <span className="text-white text-sm">Change cover</span>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={(e) => { coverRHFRef(e); coverInputRef.current = e; }}
                            {...coverRest}
                            onChange={handleCoverChange}
                        />
                    </div>

                    <div className="flex justify-center -mt-10 mb-5 relative z-10">
                        <div
                            className="relative cursor-pointer group"
                            onClick={() => avatarInputRef.current?.click()}
                        >
                            <div
                                className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
                                style={{
                                    background: "#1a1a1a",
                                    border:     errors.avatar ? "3px solid rgba(255,61,61,0.5)" : "3px solid #111111",
                                }}
                            >
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <FiUser className="text-[#333] text-2xl" />
                                )}
                            </div>
                            <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <FiCamera className="text-white text-sm" />
                            </div>
                            {avatarPreview && (
                                <div
                                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                                    style={{ background: "#ff3d3d", border: "2px solid #111111" }}
                                >
                                    <FiCheck className="text-white text-xs" />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={(e) => { avatarRHFRef(e); avatarInputRef.current = e; }}
                                {...avatarRest}
                                onChange={handleAvatarChange}
                            />
                        </div>
                    </div>

                    {errors.avatar && (
                        <p className="text-[#ff3d3d] text-xs text-center -mt-3 mb-4">
                            {errors.avatar.message}
                        </p>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <InputField
                                icon={FiUser}
                                label="Full Name"
                                type="text"
                                placeholder="John Doe"
                                error={errors.fullName?.message}
                                {...register("fullName", {
                                    required: "Required",
                                    minLength: { value: 2, message: "Too short" },
                                })}
                            />
                            <div>
                                <label className="text-[#666] text-xs uppercase tracking-wider mb-2 block">
                                    Username
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444] text-sm">@</span>
                                    <input
                                        type="text"
                                        placeholder="johndoe"
                                        {...register("username", {
                                            required: "Required",
                                            minLength: { value: 3, message: "Min 3 chars" },
                                            pattern: {
                                                value:   /^[a-zA-Z0-9_]+$/,
                                                message: "Letters, numbers, _ only",
                                            },
                                        })}
                                        className="w-full pl-9 pr-4 py-3 rounded-xl text-white text-sm placeholder:text-[#333] focus:outline-none transition-all duration-200"
                                        style={{
                                            background: "#1a1a1a",
                                            border: errors.username
                                                ? "1px solid rgba(255,61,61,0.5)"
                                                : "1px solid rgba(255,255,255,0.07)",
                                        }}
                                    />
                                </div>
                                {errors.username && (
                                    <p className="text-[#ff3d3d] text-xs mt-1.5">{errors.username.message}</p>
                                )}
                            </div>
                        </div>

                        <InputField
                            icon={FiMail}
                            label="Email"
                            type="email"
                            placeholder="john@example.com"
                            error={errors.email?.message}
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value:   /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Invalid email",
                                },
                            })}
                        />

                        <div>
                            <label className="text-[#666] text-xs uppercase tracking-wider mb-2 block">
                                Password
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#444] text-sm" />
                                <input
                                    type={showPass ? "text" : "password"}
                                    placeholder="Min. 6 characters"
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
                                background: "#ff3d3d",
                                boxShadow:  "0 4px 20px rgba(255,61,61,0.25)",
                            }}
                        >
                            {isSubmitting ? (
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                            ) : (
                                <>
                                    Create Account
                                    <FiArrowRight className="text-sm" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                        <span className="text-[#333] text-xs">or</span>
                        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
                    </div>

                    <p className="text-center text-[#555] text-sm">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-semibold transition-colors"
                            style={{ color: "#ff3d3d" }}
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;