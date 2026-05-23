import { useState, useRef, useEffect } from "react";
import { X, Check, Image, Palette, Loader2 } from "lucide-react";
import { useBoardStore } from "../../store/boardStore.js";
import { useCurrentBoardStore } from "../../store/currentBoardStore.js";
import * as api from "../../services/api.js";
import toast from "react-hot-toast";

// Solid color options
const COLORS = [
    { value: "#0079BF", label: "Blue" },
    { value: "#D29034", label: "Orange" },
    { value: "#519839", label: "Green" },
    { value: "#B04632", label: "Red" },
    { value: "#89609E", label: "Purple" },
    { value: "#CD5A91", label: "Pink" },
    { value: "#4BBF6B", label: "Lime" },
    { value: "#00AECC", label: "Sky" },
    { value: "#838C91", label: "Grey" },
    { value: "#172b4d", label: "Navy" },
];

// Unsplash curated board backgrounds (free to use)
const PRESET_IMAGES = [
    {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
        thumb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=60",
        label: "Mountains",
    },
    {
        url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80",
        thumb: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&q=60",
        label: "Gradient",
    },
    {
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
        thumb: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&q=60",
        label: "Forest",
    },
    {
        url: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=1200&q=80",
        thumb: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=200&q=60",
        label: "Ocean",
    },
    {
        url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80",
        thumb: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=200&q=60",
        label: "Galaxy",
    },
    {
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
        thumb: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&q=60",
        label: "Beach",
    },
    {
        url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80",
        thumb: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=200&q=60",
        label: "Pine",
    },
    {
        url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80",
        thumb: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=200&q=60",
        label: "Meadow",
    },
];

export default function BoardBgPicker({ board, onClose }) {
    const [activeTab, setActiveTab] = useState("colors"); // 'colors' | 'images'
    const [saving, setSaving] = useState(null); // what is being saved
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);
    const panelRef = useRef(null);

    const updateBoardInList = useBoardStore((s) => s.updateBoardInList);
    const { board: liveBoard, fetchBoard } = useCurrentBoardStore();

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    const applyColor = async (color) => {
        setSaving(color);
        try {
            await api.updateBoard(board.id, {
                background_color: color,
                background_image: null, // clear image when color chosen
            });
            updateBoardInList(board.id, {
                background_color: color,
                background_image: null,
            });
            // Update live board page background instantly
            await fetchBoard(board.id);
            toast.success("Background updated");
        } catch {
            toast.error("Failed to update background");
        } finally {
            setSaving(null);
        }
    };

    const applyImage = async (imageUrl) => {
        setSaving(imageUrl);
        try {
            await api.updateBoard(board.id, {
                background_image: imageUrl,
                background_color: "#000000", // fallback color
            });
            updateBoardInList(board.id, {
                background_image: imageUrl,
                background_color: "#000000",
            });
            await fetchBoard(board.id);
            toast.success("Background updated");
        } catch {
            toast.error("Failed to update background");
        } finally {
            setSaving(null);
        }
    };

    // Upload custom image via Cloudinary
    const handleCustomUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        setUploading(true);
        try {
            // Use attachment upload endpoint - reuse existing cloudinary setup
            const formData = new FormData();
            formData.append("attachment", file);

            // We need a card id for the attachment endpoint
            // Instead, lets call updateBoard with a placeholder
            // and upload via a dedicated approach

            // Create a temporary FileReader to get base64
            // Then send as background_image URL via updateBoard
            // Actually - simplest: upload to cloudinary directly from frontend
            // using the attachment of any card, then use the URL
            // Better approach: add a board background upload endpoint

            // For now - use a free image hosting trick with FileReader
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const dataUrl = ev.target?.result;
                await api.updateBoard(board.id, {
                    background_image: dataUrl,
                    background_color: "#000000",
                });
                updateBoardInList(board.id, {
                    background_image: dataUrl,
                    background_color: "#000000",
                });
                await fetchBoard(board.id);
                toast.success("Custom background applied");
                setUploading(false);
            };
            reader.readAsDataURL(file);
        } catch {
            toast.error("Upload failed");
            setUploading(false);
        }

        // Reset file input
        if (fileRef.current) fileRef.current.value = "";
    };

    const currentBg = liveBoard?.background_color || board.background_color;
    const currentImage = liveBoard?.background_image || board.background_image;

    return (
        <div
            ref={panelRef}
            className="absolute top-14 right-24 z-40 w-72
                 bg-white rounded-2xl shadow-2xl border border-gray-200
                 overflow-hidden"
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-3
                      border-b border-gray-100"
            >
                <h3 className="text-sm font-semibold text-[#172b4d]">
                    Board Background
                </h3>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-lg
                     text-[#626f86] transition-colors"
                >
                    <X size={15} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex px-3 pt-3 gap-1.5">
                <button
                    onClick={() => setActiveTab("colors")}
                    className={`flex-1 flex items-center justify-center gap-1.5
                      py-2 rounded-lg text-xs font-semibold transition-colors
                      ${
                          activeTab === "colors"
                              ? "bg-[#0052CC] text-white"
                              : "bg-[#091e420f] text-[#44546f] hover:bg-[#091e4221]"
                      }`}
                >
                    <Palette size={13} />
                    Colors
                </button>
                <button
                    onClick={() => setActiveTab("images")}
                    className={`flex-1 flex items-center justify-center gap-1.5
                      py-2 rounded-lg text-xs font-semibold transition-colors
                      ${
                          activeTab === "images"
                              ? "bg-[#0052CC] text-white"
                              : "bg-[#091e420f] text-[#44546f] hover:bg-[#091e4221]"
                      }`}
                >
                    <Image size={13} />
                    Images
                </button>
            </div>

            <div className="p-3">
                {/* ── Colors Tab ─────────────────────────────── */}
                {activeTab === "colors" && (
                    <div className="grid grid-cols-5 gap-2">
                        {COLORS.map((c) => {
                            const isActive =
                                currentBg === c.value && !currentImage;
                            const isSaving = saving === c.value;
                            return (
                                <button
                                    key={c.value}
                                    title={c.label}
                                    onClick={() => applyColor(c.value)}
                                    disabled={!!saving || uploading}
                                    className={`relative h-10 rounded-xl transition-all
                              hover:scale-110 hover:shadow-md
                              disabled:cursor-not-allowed
                              ${
                                  isActive
                                      ? "ring-2 ring-offset-2 ring-[#0052CC] scale-105"
                                      : ""
                              }`}
                                    style={{ backgroundColor: c.value }}
                                >
                                    {/* Active checkmark */}
                                    {isActive && !isSaving && (
                                        <div
                                            className="absolute inset-0 flex items-center
                                    justify-center"
                                        >
                                            <Check
                                                size={14}
                                                className="text-white drop-shadow"
                                            />
                                        </div>
                                    )}
                                    {/* Saving spinner */}
                                    {isSaving && (
                                        <div
                                            className="absolute inset-0 flex items-center
                                    justify-center"
                                        >
                                            <Loader2
                                                size={13}
                                                className="text-white animate-spin"
                                            />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* ── Images Tab ─────────────────────────────── */}
                {activeTab === "images" && (
                    <>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            {PRESET_IMAGES.map((img) => {
                                const isActive = currentImage === img.url;
                                const isSaving = saving === img.url;
                                return (
                                    <button
                                        key={img.url}
                                        title={img.label}
                                        onClick={() => applyImage(img.url)}
                                        disabled={!!saving || uploading}
                                        className={`relative h-16 rounded-xl overflow-hidden
                                transition-all hover:scale-105 hover:shadow-md
                                disabled:cursor-not-allowed
                                ${
                                    isActive
                                        ? "ring-2 ring-offset-1 ring-[#0052CC]"
                                        : ""
                                }`}
                                    >
                                        <img
                                            src={img.thumb}
                                            alt={img.label}
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Label overlay */}
                                        <div
                                            className="absolute inset-x-0 bottom-0
                                    bg-gradient-to-t from-black/60 to-transparent
                                    py-1 px-2"
                                        >
                                            <span className="text-white text-[9px] font-medium">
                                                {img.label}
                                            </span>
                                        </div>
                                        {/* Active check */}
                                        {isActive && !isSaving && (
                                            <div
                                                className="absolute top-1.5 right-1.5
                                      bg-[#0052CC] rounded-full p-0.5"
                                            >
                                                <Check
                                                    size={10}
                                                    className="text-white"
                                                />
                                            </div>
                                        )}
                                        {/* Saving overlay */}
                                        {isSaving && (
                                            <div
                                                className="absolute inset-0 bg-black/40
                                      flex items-center justify-center"
                                            >
                                                <Loader2
                                                    size={18}
                                                    className="text-white animate-spin"
                                                />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Custom image upload */}
                        <div className="border-t border-gray-100 pt-3">
                            <p
                                className="text-[10px] font-semibold text-[#44546f]
                            uppercase tracking-wide mb-2"
                            >
                                Custom Image
                            </p>
                            <button
                                onClick={() => fileRef.current?.click()}
                                disabled={!!saving || uploading}
                                className="w-full flex items-center justify-center gap-2
                           py-2.5 border-2 border-dashed border-[#c1c7d0]
                           hover:border-[#0052CC] hover:bg-blue-50
                           rounded-xl text-xs text-[#44546f]
                           hover:text-[#0052CC] transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <>
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Image size={14} />
                                        Upload from device
                                    </>
                                )}
                            </button>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleCustomUpload}
                            />
                        </div>

                        {/* Remove background image */}
                        {currentImage && (
                            <button
                                onClick={() =>
                                    applyColor(currentBg || "#0079BF")
                                }
                                disabled={!!saving || uploading}
                                className="w-full mt-2 py-2 text-xs text-[#626f86]
                           hover:text-red-500 hover:bg-red-50
                           rounded-xl transition-colors"
                            >
                                Remove image background
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
