// ── Color Palette ────────────────────────────────────────────────────────────
export const colors = {
    bg: {
        primary:   "#0f0f0f",
        secondary: "#181818",
        elevated:  "#212121",
        hover:     "#2a2a2a",
    },
    accent: {
        primary: "#ff3d3d",
        hover:   "#ff5555",
        muted:   "rgba(255, 61, 61, 0.15)",
    },
    text: {
        primary:   "#ffffff",
        secondary: "#aaaaaa",
        tertiary:  "#666666",
    },
    border: {
        default: "rgba(255, 255, 255, 0.08)",
        hover:   "rgba(255, 255, 255, 0.16)",
    },
};

// ── Animation Variants (Framer Motion) ───────────────────────────────────────
export const fadeIn = {
    initial:   { opacity: 0 },
    animate:   { opacity: 1 },
    exit:      { opacity: 0 },
    transition: { duration: 0.2 },
};

export const fadeUp = {
    initial:   { opacity: 0, y: 16 },
    animate:   { opacity: 1, y: 0 },
    exit:      { opacity: 0, y: 8 },
    transition: { duration: 0.3, ease: "easeOut" },
};

export const fadeInScale = {
    initial:   { opacity: 0, scale: 0.95 },
    animate:   { opacity: 1, scale: 1 },
    exit:      { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: "easeOut" },
};

export const slideInLeft = {
    initial:   { x: -20, opacity: 0 },
    animate:   { x: 0, opacity: 1 },
    exit:      { x: -20, opacity: 0 },
    transition: { duration: 0.25, ease: "easeOut" },
};

export const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.06,
        },
    },
};

export const staggerItem = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
};

// ── Tailwind Class Shortcuts ──────────────────────────────────────────────────
export const tw = {
    // Cards
    card:        "bg-[#181818] border border-white/[0.08] rounded-2xl",
    cardHover:   "hover:bg-[#212121] hover:border-white/[0.12] transition-all duration-200",

    // Buttons
    btnPrimary:  "bg-[#ff3d3d] hover:bg-[#ff5555] text-white font-semibold rounded-xl transition-all duration-150 active:scale-95",
    btnSecondary:"bg-white/[0.08] hover:bg-white/[0.12] text-white font-medium rounded-xl transition-all duration-150 active:scale-95",
    btnGhost:    "text-[#aaaaaa] hover:text-white hover:bg-white/[0.06] rounded-lg transition-all duration-150",

    // Inputs
    input:       "bg-[#212121] border border-white/[0.08] rounded-xl text-white placeholder:text-[#666] focus:outline-none focus:border-white/20 transition-colors",

    // Text
    textPrimary:   "text-white",
    textSecondary: "text-[#aaaaaa]",
    textTertiary:  "text-[#666666]",
    textAccent:    "text-[#ff3d3d]",
};