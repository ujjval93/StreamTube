import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState } from "react";
import {
  FiEye,
  FiEyeOff,
  FiCamera,
  FiUser,
  FiMail,
  FiLock,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { registerUser, loginUser } from "../api/auth.api.js";
import { setCredentials } from "../store/slices/authSlice.js";

const Register = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  // No useRef needed — we use <label> to trigger file input natively

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
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
    formData.append("fullName", data.fullName);
    formData.append("email", data.email);
    formData.append("username", data.username);
    formData.append("password", data.password);
    formData.append("avatar", data.avatar[0]);
    if (data.coverImage?.[0]) {
      formData.append("coverImage", data.coverImage[0]);
    }

    try {
      await registerUser(formData);
      toast.success("Account created! Signing you in...");

      const loginResponse = await loginUser({
        username: data.username,
        password: data.password,
      });
      const { user, accessToken } = loginResponse.data.data;
      dispatch(setCredentials({ user, accessToken }));
      navigate("/");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Registration failed. Try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-600 rounded-2xl mb-4">
            <span className="text-white font-black text-xl">ST</span>
          </div>
          <h1 className="text-white text-2xl font-bold">Create account</h1>
          <p className="text-white/50 text-sm mt-1">Join StreamTube today</p>
        </div>

        {/* Form card */}
        <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-white/10 shadow-2xl">
          {/* ✅ Cover image picker — <label> triggers hidden input, no ref.click() */}
          <label
            htmlFor="coverInput"
            className="relative w-full h-28 rounded-xl overflow-hidden bg-[#121212] border border-white/10 cursor-pointer mb-12 group block"
          >
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-1">
                <FiCamera className="text-white/20 text-2xl" />
                <span className="text-white/20 text-xs">
                  Add cover image (optional)
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <FiCamera className="text-white text-2xl" />
            </div>
            <input
              id="coverInput"
              type="file"
              accept="image/*"
              className="hidden"
              {...register("coverImage")}
              onChange={(e) => {
                register("coverImage").onChange(e);
                handleCoverChange(e);
              }}
            />
          </label>

          {/* ✅ Avatar picker — <label> triggers hidden input, no ref.click() */}
          <div className="flex justify-center -mt-20 mb-6 relative z-10">
            <label
              htmlFor="avatarInput"
              className="relative cursor-pointer group"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#1a1a1a] bg-[#121212] flex items-center justify-center">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUser className="text-white/20 text-3xl" />
                )}
              </div>
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <FiCamera className="text-white text-lg" />
              </div>
              <input
                id="avatarInput"
                type="file"
                accept="image/*"
                className="hidden"
                {...register("avatar", { required: "Avatar is required" })}
                onChange={(e) => {
                  register("avatar").onChange(e); // ← tell react-hook-form about the file
                  handleAvatarChange(e); // ← update preview
                }}
              />
            </label>
          </div>

          {errors.avatar && (
            <p className="text-red-400 text-xs text-center -mt-4 mb-4">
              {errors.avatar.message}
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-white/70 text-sm mb-1.5 block">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-lg" />
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register("fullName", {
                    required: "Full name is required",
                    minLength: { value: 2, message: "Name too short" },
                  })}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              {errors.fullName && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="text-white/70 text-sm mb-1.5 block">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-sm">
                  @
                </span>
                <input
                  type="text"
                  placeholder="johndoe"
                  {...register("username", {
                    required: "Username is required",
                    minLength: { value: 3, message: "At least 3 characters" },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: "Only letters, numbers, underscores",
                    },
                  })}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              {errors.username && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-white/70 text-sm mb-1.5 block">
                Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-lg" />
                <input
                  type="email"
                  placeholder="john@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address",
                    },
                  })}
                  className="w-full bg-[#121212] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.email.message}
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
                  placeholder="Min. 6 characters"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "At least 6 characters",
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
                <p className="text-red-400 text-xs mt-1">
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
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-white/50 text-sm mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
