import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { FiUploadCloud, FiFilm, FiImage, FiX, FiArrowLeft, FiCheck, FiInfo, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import { publishVideo } from "../api/video.api.js";

const categories = [
    "Music",
    "Gaming",
    "Coding",
    "Education",
    "Sports",
    "Entertainment",
    "Podcast",
    "Technology",
    "Vlog",
    "News",
];

const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    let index = 0;
    let value = bytes;

    while (value >= 1024 && index < units.length - 1) {
        value /= 1024;
        index += 1;
    }

    return `${value.toFixed(1)} ${units[index]}`;
};

const DropZone = ({ label, accept, icon: Icon, file, preview, onFileSelect, onClear, hint, required }) => {
    const [dragging, setDragging] = useState(false);

    const handleDrop = (event) => {
        event.preventDefault();
        setDragging(false);
        const incoming = event.dataTransfer.files?.[0];
        if (incoming) onFileSelect(incoming);
    };

    return (
        <div>
            <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#888]">{label}</p>
                    <p className="mt-1 text-sm text-[#777]">{hint}</p>
                </div>
                {required && <span className="rounded-full bg-[#2a2a2a] px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-[#ff6b6b]">Required</span>}
            </div>

            <AnimatePresence mode="wait">
                {file ? (
                    <motion.div
                        key="file-preview"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#101010]"
                    >
                        {preview ? (
                            <img src={preview} alt="Preview" className="h-56 w-full object-cover" />
                        ) : (
                            <div className="flex h-56 items-center justify-center gap-4 bg-[#0d0d0d] p-4 text-center text-sm text-[#888]">
                                <Icon className="text-2xl text-[#ff3d3d]" />
                                <div>
                                    <p className="font-medium text-white">{file.name}</p>
                                    <p className="mt-1">{formatFileSize(file.size)}</p>
                                </div>
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={onClear}
                            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-white/10"
                        >
                            <FiX className="text-base" />
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="dropzone"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        onDrop={handleDrop}
                        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onClick={() => document.getElementById(`${label}-input`)?.click()}
                        className={`group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-[30px] border-2 border-dashed px-5 py-12 text-center transition ${dragging ? "border-[#ff3d3d] bg-[#190d0d]" : "border-white/10 bg-[#0f0f0f] hover:border-[#ff3d3d]"}`}
                    >
                        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#1a1a1a] text-2xl text-[#ff3d3d]">
                            <Icon />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">Drop files here or browse</p>
                            <p className="text-xs text-[#777]">Click to select a file</p>
                        </div>
                        <input
                            id={`${label}-input`}
                            type="file"
                            accept={accept}
                            className="hidden"
                            onChange={(event) => {
                                const selected = event.target.files?.[0];
                                if (selected) onFileSelect(selected);
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const UploadVideo = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid },
        watch,
    } = useForm({ mode: "onChange" });

    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [step, setStep] = useState(1);
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState("");
    const [privacy, setPrivacy] = useState("public");
    const [category, setCategory] = useState(categories[0]);

    const descriptionValue = watch("description") || "";

    const handleVideoSelect = (file) => {
        if (!file.type.startsWith("video/")) {
            toast.error("Please select a valid video file.");
            return;
        }
        if (file.size > 500 * 1024 * 1024) {
            toast.error("Video size must be under 500MB.");
            return;
        }
        setVideoFile(file);
        setVideoPreview(URL.createObjectURL(file));
    };

    const handleThumbnailSelect = (file) => {
        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file.");
            return;
        }
        setThumbnailFile(file);
        setThumbnailPreview(URL.createObjectURL(file));
    };

    const addTag = () => {
        const value = tagInput.trim();
        if (!value) return;
        if (tags.includes(value.toLowerCase())) {
            toast.error("Tag already added");
            return;
        }
        if (tags.length >= 8) {
            toast.error("Maximum of 8 tags allowed");
            return;
        }
        setTags((prev) => [...prev, value.toLowerCase()]);
        setTagInput("");
    };

    const removeTag = (tag) => {
        setTags((prev) => prev.filter((item) => item !== tag));
    };

    const handleNextStep = () => {
        if (!videoFile || !thumbnailFile) {
            toast.error("Please select both video and thumbnail before continuing.");
            return;
        }
        setStep(2);
    };

    const onSubmit = async (data) => {
        if (!videoFile || !thumbnailFile) {
            toast.error("Video and thumbnail are required.");
            return;
        }

        const formData = new FormData();
        formData.append("title", data.title.trim());
        formData.append("description", data.description.trim());
        formData.append("category", category);
        formData.append("tags", JSON.stringify(tags));
        formData.append("privacy", privacy);
        formData.append("videoFile", videoFile);
        formData.append("thumbnail", thumbnailFile);

        try {
            setIsUploading(true);
            setUploadProgress(0);

            const response = await publishVideo(formData, {
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percent);
                },
            });

            toast.success("Video published successfully!");
            navigate(`/video/${response.data.data._id}`);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Upload failed.");
            setUploadProgress(0);
        } finally {
            setIsUploading(false);
        }
    };

    const stepLabel = step === 1 ? "Upload files" : "Video details";

    return (
        <div className="min-h-screen bg-[#050505] px-4 py-10 text-white">
            <div className="mx-auto w-full max-w-6xl space-y-8">
                <div className="flex flex-col gap-4 rounded-[36px] border border-white/10 bg-[#0f0f0f] p-6 sm:p-8">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-[#888]">Upload Video</p>
                            <h1 className="mt-2 text-3xl font-semibold text-white">Publish new content</h1>
                            <p className="mt-2 text-sm text-[#aaa]">A modern uploader with preview, tags, category, and publish controls.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-[#101010] px-4 py-3 text-sm text-white transition hover:border-white/20"
                        >
                            <FiArrowLeft /> Back
                        </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
                        <div className="rounded-[30px] border border-white/10 bg-[#121212] p-5">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-white">{stepLabel}</p>
                                    <p className="text-xs text-[#777]">Step {step} of 2</p>
                                </div>
                                <span className="inline-flex items-center gap-2 rounded-full bg-[#161616] px-3 py-2 text-xs uppercase tracking-[0.35em] text-[#ff6b6b]">
                                    <FiUploadCloud /> {privacy === "public" ? "Public" : "Private"}
                                </span>
                            </div>
                            <div className="grid gap-5 md:grid-cols-2">
                                <DropZone
                                    label="Video file"
                                    accept="video/*"
                                    icon={FiFilm}
                                    file={videoFile}
                                    preview={videoPreview}
                                    onFileSelect={handleVideoSelect}
                                    onClear={() => { setVideoFile(null); setVideoPreview(null); }}
                                    hint="MP4, MOV, WebM. Max 500MB."
                                    required
                                />
                                <DropZone
                                    label="Thumbnail"
                                    accept="image/*"
                                    icon={FiImage}
                                    file={thumbnailFile}
                                    preview={thumbnailPreview}
                                    onFileSelect={handleThumbnailSelect}
                                    onClear={() => { setThumbnailFile(null); setThumbnailPreview(null); }}
                                    hint="JPG, PNG, WebP. 1280x720 recommended."
                                    required
                                />
                            </div>

                            {step === 1 && (
                                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                                    <p className="text-sm text-[#888]">Ready? Continue to details and publish.</p>
                                    <button
                                        type="button"
                                        onClick={handleNextStep}
                                        className="inline-flex items-center justify-center gap-2 rounded-3xl bg-[#ff3d3d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ff5757]"
                                    >
                                        Continue
                                        <FiArrowLeft className="rotate-180 text-base" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="rounded-[30px] border border-white/10 bg-[#121212] p-5">
                            <div className="mb-5">
                                <p className="text-sm font-semibold text-white">Quick status</p>
                                <p className="mt-2 text-sm text-[#777]">Your upload progress and metadata live here.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="rounded-3xl border border-white/10 bg-[#101010] px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.3em] text-[#777]">File info</p>
                                    <div className="mt-3 space-y-2 text-sm text-[#ccc]">
                                        <p>Video: {videoFile ? videoFile.name : "Not selected"}</p>
                                        <p>Thumbnail: {thumbnailFile ? thumbnailFile.name : "Not selected"}</p>
                                        <p>Category: {category}</p>
                                    </div>
                                </div>
                                <div className="rounded-3xl border border-white/10 bg-[#101010] px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.3em] text-[#777]">Visibility</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {[
                                            { label: "Public", value: "public" },
                                            { label: "Private", value: "private" },
                                        ].map((option) => (
                                            <button
                                                type="button"
                                                key={option.value}
                                                onClick={() => setPrivacy(option.value)}
                                                className={`rounded-2xl px-4 py-2 text-sm transition ${privacy === option.value ? "bg-[#ff3d3d] text-white" : "bg-[#0d0d0d] text-[#aaa] hover:bg-white/5"}`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="rounded-3xl border border-white/10 bg-[#101010] px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.3em] text-[#777]">Category</p>
                                    <div className="mt-3 text-sm text-[#ccc]">
                                        <p>{category}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[36px] border border-white/10 bg-[#0f0f0f] p-6 sm:p-8"
                >
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-[#888]">Video details</p>
                            <h2 className="mt-2 text-2xl font-semibold text-white">Publish settings</h2>
                        </div>
                        <div className="rounded-full border border-white/10 bg-[#101010] px-4 py-2 text-sm text-[#aaa]">
                            {tags.length} tags added
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
<div className="space-y-4">
                        <div className="grid gap-4 lg:grid-cols-2">
                            <label className="block">
                                <span className="text-xs uppercase tracking-[0.35em] text-[#888]">Title</span>
                                <input
                                    type="text"
                                    placeholder="Enter your video title"
                                    {...register("title", {
                                        required: "Title is required",
                                        minLength: { value: 5, message: "At least 5 characters" },
                                        maxLength: { value: 100, message: "Max 100 characters" },
                                    })}
                                    className="mt-2 w-full rounded-3xl border border-white/10 bg-[#101010] px-4 py-3 text-white placeholder:text-[#666] outline-none transition duration-200 focus:border-[#ff3d3d]"
                                />
                                {errors.title && <p className="mt-2 text-xs text-[#ff6b6b]">{errors.title.message}</p>}
                            </label>

                            <label className="block">
                                <span className="text-xs uppercase tracking-[0.35em] text-[#888]">Category</span>
                                <select
                                    value={category}
                                    onChange={(event) => setCategory(event.target.value)}
                                    className="mt-2 w-full rounded-3xl border border-white/10 bg-[#101010] px-4 py-3 text-white outline-none transition duration-200 focus:border-[#ff3d3d]"
                                >
                                    {categories.map((item) => (
                                        <option key={item} value={item} className="bg-[#101010] text-white">
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <label className="block">
                            <span className="text-xs uppercase tracking-[0.35em] text-[#888]">Description</span>
                            <textarea
                                rows={4}
                                placeholder="Add a description that tells viewers what your video is about"
                                {...register("description", {
                                    required: "Description is required",
                                    minLength: { value: 10, message: "At least 10 characters" },
                                })}
                                className="mt-2 w-full rounded-3xl border border-white/10 bg-[#101010] px-4 py-3 text-white placeholder:text-[#666] outline-none transition duration-200 focus:border-[#ff3d3d] resize-none"
                                />
                                <div className="mt-2 flex items-center justify-between text-xs text-[#777]">
                                    <p>{errors.description ? errors.description.message : "Describe the video in a few sentences."}</p>
                                    <span>{descriptionValue.length}/500</span>
                                </div>
                            </label>
                        </div>

                        <div className="rounded-[28px] border border-white/10 bg-[#101010] p-5">
                            <p className="text-xs uppercase tracking-[0.35em] text-[#888]">Tags</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <span key={tag} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#141414] px-3 py-2 text-sm text-[#ddd]">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="rounded-full bg-white/5 p-1 text-white transition hover:bg-white/10">
                                            <FiX className="text-xs" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                                    placeholder="Add a tag and press Enter"
                                    className="w-full rounded-3xl border border-white/10 bg-[#0d0d0d] px-4 py-3 text-white placeholder:text-[#666] outline-none transition duration-200 focus:border-[#ff3d3d]"
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="inline-flex items-center justify-center gap-2 rounded-3xl bg-[#ff3d3d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ff5757]"
                                >
                                    <FiPlus className="text-base" /> Add tag
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-1 rounded-[28px] border border-white/10 bg-[#101010] p-4">
                                <p className="text-xs uppercase tracking-[0.35em] text-[#888]">Upload preview</p>
                                <div className="mt-3 flex flex-col gap-2 text-sm text-[#ccc]">
                                    <p><span className="text-white">Privacy:</span> {privacy}</p>
                                    <p><span className="text-white">Category:</span> {category}</p>
                                    <p><span className="text-white">Tags:</span> {tags.length || 0}</p>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={!isValid || isUploading}
                                className="inline-flex items-center justify-center gap-2 rounded-3xl bg-[#ff3d3d] px-6 py-3 text-sm font-semibold text-white transition duration-200 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#ff5757]"
                            >
                                {isUploading ? "Publishing..." : "Publish video"}
                                {isUploading ? <FiUploadCloud /> : <FiCheck />}
                            </button>
                        </div>

                        {isUploading && (
                            <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] p-4">
                                <div className="mb-3 flex items-center justify-between text-sm text-[#aaa]">
                                    <span>Upload status</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                                    <motion.div
                                        className="h-full rounded-full bg-linear-to-r from-[#ff3d3d] to-[#ff8c42]"
                                        animate={{ width: `${uploadProgress}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            </div>
                        )}
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default UploadVideo;
