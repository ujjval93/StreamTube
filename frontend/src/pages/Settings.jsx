import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import {
    FiUser, FiMail, FiLock, FiCamera,
    FiEye, FiEyeOff, FiCheck, FiSave,
    FiShield, FiInfo, FiUploadCloud,
    FiCalendar, FiAtSign
} from "react-icons/fi";
import toast from "react-hot-toast";
import {
    updateAccountDetails, updateAvatar,
    updateCoverImage, changePassword,
} from "../api/user.api.js";
import { updateUser } from "../store/slices/authSlice.js";

// Spinner
const Spinner = () => (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
);

// Section Card
const SectionCard = ({ title, description, icon: Icon, children, accent }) => (
    <div className={`rounded-2xl overflow-hidden border transition-all duration-300 ${
        accent
            ? "bg-red-950/10 border-red-500/15"
            : "bg-[#111111] border-white/8 hover:border-white/12"
    }`}>
        <div className={`px-6 py-5 border-b ${accent ? "border-red-500/10" : "border-white/6"}`}>
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        accent ? "bg-red-500/10" : "bg-white/5"
                    }`}>
                        <Icon className={`text-sm ${accent ? "text-red-400" : "text-white/50"}`} />
                    </div>
                )}
                <div>
                    <h2 className={`font-semibold text-sm ${accent ? "text-red-400" : "text-white"}`}>
                        {title}
                    </h2>
                    {description && (
                        <p className="text-white/30 text-xs mt-0.5">{description}</p>
                    )}
                </div>
            </div>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

// Input Field
const InputField = ({ icon: Icon, label, error, ...props }) => (
    <div>
        <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 text-sm" />}
            <input
                {...props}
                className={`w-full bg-white/4 border rounded-xl ${Icon ? "pl-10" : "pl-4"} pr-4 py-3 text-white text-sm placeholder:text-white/15 focus:outline-none transition-all ${
                    error
                        ? "border-red-500/50 focus:border-red-500"
                        : "border-white/8 focus:border-white/25 focus:bg-white/6"
                }`}
            />
        </div>
        {error && <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1"><FiInfo className="text-xs" />{error}</p>}
    </div>
);

// Save Button
const SaveButton = ({ loading, loadingText, children, ...props }) => (
    <button
        {...props}
        disabled={loading || props.disabled}
        className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-white/90 disabled:bg-white/20 disabled:cursor-not-allowed text-black disabled:text-white/40 text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-white/5"
    >
        {loading ? <><Spinner />{loadingText}</> : children}
    </button>
);

const Settings = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const [avatarPreview, setAvatarPreview] = useState(user?.avatar);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const avatarInputRef = useRef(null);

    const [coverPreview, setCoverPreview] = useState(user?.coverImage);
    const [coverFile, setCoverFile] = useState(null);
    const [coverLoading, setCoverLoading] = useState(false);
    const coverInputRef = useRef(null);

    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const {
        register: registerProfile,
        handleSubmit: handleProfileSubmit,
        formState: { errors: profileErrors, isSubmitting: profileSubmitting },
    } = useForm({ defaultValues: { fullName: user?.fullName, email: user?.email } });

    const {
        register: registerPassword,
        handleSubmit: handlePasswordSubmit,
        reset: resetPassword,
        formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
    } = useForm();

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { toast.error("Please select a valid image"); return; }
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return;
        try {
            setAvatarLoading(true);
            const formData = new FormData();
            formData.append("avatar", avatarFile);
            const response = await updateAvatar(formData);
            dispatch(updateUser({ avatar: response.data.data.avatar }));
            setAvatarFile(null);
            toast.success("Avatar updated!");
        } catch { toast.error("Failed to update avatar"); }
        finally { setAvatarLoading(false); }
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { toast.error("Please select a valid image"); return; }
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const handleCoverUpload = async () => {
        if (!coverFile) return;
        try {
            setCoverLoading(true);
            const formData = new FormData();
            formData.append("coverImage", coverFile);
            const response = await updateCoverImage(formData);
            dispatch(updateUser({ coverImage: response.data.data.coverImage }));
            setCoverFile(null);
            toast.success("Cover image updated!");
        } catch { toast.error("Failed to update cover image"); }
        finally { setCoverLoading(false); }
    };

    const onProfileSubmit = async (data) => {
        try {
            const response = await updateAccountDetails({
                fullName: data.fullName.trim(),
                email: data.email.trim(),
            });
            dispatch(updateUser({ fullName: response.data.data.fullName, email: response.data.data.email }));
            toast.success("Profile updated!");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to update profile");
        }
    };

    const onPasswordSubmit = async (data) => {
        try {
            await changePassword({ oldPassword: data.oldPassword, newPassword: data.newPassword });
            resetPassword();
            toast.success("Password changed!");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to change password");
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-5">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-white text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-white/30 text-sm mt-1">Manage your account and preferences</p>
            </div>

            {/* Profile Picture & Cover — Combined */}
            <SectionCard title="Channel Art" description="Customize how your channel looks" icon={FiCamera}>
                {/* Cover Image */}
                <div className="space-y-3 mb-6">
                    <p className="text-white/40 text-xs uppercase tracking-wider">Cover Image</p>
                    <label
                        htmlFor="coverInput"
                        className="relative w-full h-36 rounded-xl overflow-hidden bg-white/4 border border-white/8 cursor-pointer group block hover:border-white/20 transition-all"
                    >
                        {coverPreview ? (
                            <img src={coverPreview} alt="Cover" className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-2">
                                <FiUploadCloud className="text-white/20 text-2xl" />
                                <span className="text-white/20 text-xs">Click to upload cover image</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <FiCamera className="text-white text-xl" />
                            <span className="text-white text-sm font-medium">Change Cover</span>
                        </div>
                        <input id="coverInput" type="file" accept="image/*" className="hidden" ref={coverInputRef} onChange={handleCoverChange} />
                    </label>
                    {coverFile && (
                        <div className="flex items-center justify-between bg-white/4 border border-white/8 rounded-xl px-4 py-3">
                            <span className="text-white/50 text-xs truncate">{coverFile.name}</span>
                            <SaveButton loading={coverLoading} loadingText="Saving..." onClick={handleCoverUpload}>
                                <FiCheck className="text-sm" /> Save
                            </SaveButton>
                        </div>
                    )}
                </div>

                {/* Avatar */}
                <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Profile Picture</p>
                    <div className="flex items-center gap-5">
                        <label htmlFor="avatarInput" className="relative w-20 h-20 rounded-full overflow-hidden cursor-pointer group shrink-0">
                            <img src={avatarPreview || user?.avatar} alt={user?.fullName} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                                <FiCamera className="text-white text-sm" />
                            </div>
                            <input id="avatarInput" type="file" accept="image/*" className="hidden" ref={avatarInputRef} onChange={handleAvatarChange} />
                        </label>

                        <div className="flex-1">
                            <p className="text-white font-semibold text-sm">{user?.fullName}</p>
                            <p className="text-white/30 text-xs mt-0.5">@{user?.username}</p>
                            <label htmlFor="avatarInput" className="inline-block mt-2 text-white/40 hover:text-white/70 text-xs cursor-pointer transition-colors underline underline-offset-2">
                                Change profile picture
                            </label>
                        </div>

                        {avatarFile && (
                            <SaveButton loading={avatarLoading} loadingText="Saving..." onClick={handleAvatarUpload}>
                                <FiCheck className="text-sm" /> Save
                            </SaveButton>
                        )}
                    </div>
                </div>
            </SectionCard>

            {/* Profile Details */}
            <SectionCard title="Profile Details" description="Update your public information" icon={FiUser}>
                <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                    <InputField
                        icon={FiUser}
                        label="Full Name"
                        type="text"
                        placeholder="Your full name"
                        error={profileErrors.fullName?.message}
                        {...registerProfile("fullName", {
                            required: "Full name is required",
                            minLength: { value: 2, message: "Name too short" },
                        })}
                    />
                    <InputField
                        icon={FiMail}
                        label="Email Address"
                        type="email"
                        placeholder="your@email.com"
                        error={profileErrors.email?.message}
                        {...registerProfile("email", {
                            required: "Email is required",
                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
                        })}
                    />
                    <div className="flex justify-end pt-2">
                        <SaveButton loading={profileSubmitting} loadingText="Saving...">
                            <FiSave className="text-sm" /> Save Changes
                        </SaveButton>
                    </div>
                </form>
            </SectionCard>

            {/* Change Password */}
            <SectionCard title="Change Password" description="Keep your account secure with a strong password" icon={FiShield}>
                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                    {/* Current Password */}
                    <div>
                        <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">Current Password</label>
                        <div className="relative">
                            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 text-sm" />
                            <input
                                type={showOldPassword ? "text" : "password"}
                                placeholder="Enter current password"
                                {...registerPassword("oldPassword", { required: "Current password is required" })}
                                className={`w-full bg-white/4 border rounded-xl pl-10 pr-12 py-3 text-white text-sm placeholder:text-white/15 focus:outline-none transition-all ${
                                    passwordErrors.oldPassword ? "border-red-500/50" : "border-white/8 focus:border-white/25"
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                            >
                                {showOldPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                            </button>
                        </div>
                        {passwordErrors.oldPassword && (
                            <p className="text-red-400 text-xs mt-1.5">{passwordErrors.oldPassword.message}</p>
                        )}
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="text-white/50 text-xs uppercase tracking-wider mb-2 block">New Password</label>
                        <div className="relative">
                            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20 text-sm" />
                            <input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Enter new password"
                                {...registerPassword("newPassword", {
                                    required: "New password is required",
                                    minLength: { value: 6, message: "At least 6 characters" },
                                })}
                                className={`w-full bg-white/4 border rounded-xl pl-10 pr-12 py-3 text-white text-sm placeholder:text-white/15 focus:outline-none transition-all ${
                                    passwordErrors.newPassword ? "border-red-500/50" : "border-white/8 focus:border-white/25"
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                            >
                                {showNewPassword ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                            </button>
                        </div>
                        {passwordErrors.newPassword && (
                            <p className="text-red-400 text-xs mt-1.5">{passwordErrors.newPassword.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end pt-2">
                        <SaveButton loading={passwordSubmitting} loadingText="Changing...">
                            <FiShield className="text-sm" /> Change Password
                        </SaveButton>
                    </div>
                </form>
            </SectionCard>

            {/* Account Info */}
            <SectionCard title="Account Info" description="Your account details" icon={FiInfo} accent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-white/5">
                        <div className="flex items-center gap-2 text-white/30 text-sm">
                            <FiAtSign className="text-xs" />
                            Username
                        </div>
                        <span className="text-white/70 text-sm font-medium">@{user?.username}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-white/5">
                        <div className="flex items-center gap-2 text-white/30 text-sm">
                            <FiMail className="text-xs" />
                            Email
                        </div>
                        <span className="text-white/70 text-sm">{user?.email}</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-2 text-white/30 text-sm">
                            <FiCalendar className="text-xs" />
                            Member since
                        </div>
                        <span className="text-white/70 text-sm">
                            {new Date(user?.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric", month: "long", year: "numeric",
                            })}
                        </span>
                    </div>
                </div>
            </SectionCard>
        </div>
    );
};

export default Settings;