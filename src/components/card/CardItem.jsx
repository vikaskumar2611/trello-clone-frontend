import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    MoreHorizontal,
    Archive,
    Trash2,
    X,
    CheckCircle2,
    Circle,
    GripVertical,
} from "lucide-react";
import CardLabels from "./CardLabels.jsx";
import CardBadges from "./CardBadges.jsx";
import CardModal from "./CardModal.jsx";
import Avatar from "../common/Avatar.jsx";
import ConfirmDialog from "../common/ConfirmDialog.jsx";
import { useCurrentBoardStore } from "../../store/currentBoardStore.js";
import * as api from "../../services/api.js";
import toast from "react-hot-toast";

export default function CardItem({ card, isDragOverlay = false }) {
    const [showModal, setShowModal] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [isMarking, setIsMarking] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
    const menuButtonRef = useRef(null);

    const { removeCard, updateCardInStore } = useCurrentBoardStore();

    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: card.id,
        data: { type: "card", listId: card.list_id },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isDone = card.due_completed === true;

    // Recalculate position on scroll/resize while menu is open
    useEffect(() => {
        if (!showMenu) return;

        const updatePos = () => {
            if (!menuButtonRef.current) return;
            const rect = menuButtonRef.current.getBoundingClientRect();
            // Try to place dropdown to the left if it would go off screen
            const dropdownWidth = 170;
            const spaceOnRight = window.innerWidth - rect.right;
            const left =
                spaceOnRight >= dropdownWidth
                    ? rect.left // align left edge of button
                    : rect.right - dropdownWidth; // align right edge

            setMenuPos({
                top: rect.bottom + 6,
                left: Math.max(8, left),
            });
        };

        updatePos();

        // Close on scroll so it doesn't float away
        const handleScroll = () => setShowMenu(false);
        window.addEventListener("scroll", handleScroll, true);
        window.addEventListener("resize", updatePos);

        return () => {
            window.removeEventListener("scroll", handleScroll, true);
            window.removeEventListener("resize", updatePos);
        };
    }, [showMenu]);

    const handleOpenMenu = (e) => {
        e.stopPropagation();
        if (!menuButtonRef.current) return;
        const rect = menuButtonRef.current.getBoundingClientRect();
        const dropdownWidth = 170;
        const spaceOnRight = window.innerWidth - rect.right;
        const left =
            spaceOnRight >= dropdownWidth
                ? rect.left
                : rect.right - dropdownWidth;

        setMenuPos({
            top: rect.bottom + 6,
            left: Math.max(8, left),
        });
        setShowMenu((v) => !v);
    };

    const handleMarkDone = async (e) => {
        e.stopPropagation();
        setIsMarking(true);
        try {
            const newVal = !isDone;
            await api.updateCard(card.id, { due_completed: newVal });
            updateCardInStore(card.id, { due_completed: newVal });
            toast.success(
                newVal ? "Card marked as done ✓" : "Card marked as active",
            );
        } catch {
            toast.error("Failed to update card");
        } finally {
            setIsMarking(false);
            setShowMenu(false);
        }
    };

    const handleArchive = async (e) => {
        e.stopPropagation();
        setShowMenu(false);
        setIsArchiving(true);
        try {
            await api.deleteCard(card.id);
            removeCard(card.id);
            toast.success("Card archived");
        } catch {
            toast.error("Failed to archive card");
            setIsArchiving(false);
        }
    };

    const handleDeletePermanent = async () => {
        setIsArchiving(true);
        try {
            await api.deleteCardPermanently(card.id);
            removeCard(card.id);
            toast.success("Card deleted");
        } catch {
            toast.error("Failed to delete card");
        } finally {
            setIsArchiving(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                onClick={() => {
                    if (!isDragging && !showMenu) setShowModal(true);
                }}
                className={`group relative bg-white rounded-xl shadow-sm
                    border border-transparent hover:border-[#b6c2cf]
                    transition-all overflow-visible
                    ${isDone ? "opacity-70" : ""}
                    ${isDragging ? "opacity-30 shadow-lg" : ""}
                    ${isDragOverlay ? "shadow-2xl rotate-2 scale-105" : ""}
                    ${isArchiving ? "opacity-40 pointer-events-none" : ""}`}
            >
                {/* Drag handle */}
                <button
                    ref={setActivatorNodeRef}
                    {...attributes}
                    {...listeners}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-1.5 left-1.5 z-[2]
                               p-1 -m-1 touch-none cursor-grab active:cursor-grabbing
                               opacity-0 group-hover:opacity-100
                               transition-opacity text-[#94a3b8]
                               hover:text-[#475569]"
                    aria-label="Drag card"
                >
                    <GripVertical size={14} />
                </button>

                {/* Cover */}
                {(card.cover_color || card.cover_image) && (
                    <div
                        className="relative w-full h-8 flex-shrink-0 z-[1]"
                        style={{
                            backgroundColor: card.cover_color || undefined,
                            backgroundImage: card.cover_image
                                ? `url(${card.cover_image})`
                                : undefined,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />
                )}

                {/* Card body */}
                <div className="relative z-[1] p-2.5">
                    <div className="flex items-start gap-2 pl-5">
                        <button
                            onClick={handleMarkDone}
                            disabled={isMarking}
                            className={`mt-0.5 flex-shrink-0
                                ${isDone ? "text-green-600" : "text-[#8590a2]"}
                                hover:text-green-600 transition-colors`}
                            aria-label={
                                isDone ? "Mark as active" : "Mark as done"
                            }
                        >
                            {isDone ? (
                                <CheckCircle2 size={14} />
                            ) : (
                                <Circle size={14} />
                            )}
                        </button>

                        <div className="min-w-0 flex-1">
                            <CardLabels labels={card.labels} />
                            <p
                                className={`text-sm text-[#172b4d] leading-snug
                                   break-words pr-7
                                   ${isDone ? "line-through text-[#8590a2]" : ""}`}
                            >
                                {card.title}
                            </p>
                        </div>
                    </div>

                    {isDone && (
                        <div className="flex items-center gap-1 mt-1">
                            <CheckCircle2
                                size={12}
                                className="text-green-500"
                            />
                            <span className="text-[10px] text-green-600 font-medium">
                                Done
                            </span>
                        </div>
                    )}

                    <CardBadges card={card} />

                    {card.members?.length > 0 && (
                        <div className="flex items-center justify-end mt-2 gap-0.5">
                            {card.members.slice(0, 3).map((m) => (
                                <Avatar key={m.id} member={m} size="xs" />
                            ))}
                            {card.members.length > 3 && (
                                <span className="text-[9px] text-[#626f86] ml-0.5">
                                    +{card.members.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Menu button - just the trigger, no dropdown here */}
                <div
                    className="absolute top-1.5 right-1.5 z-[3]
                                opacity-0 group-hover:opacity-100
                                transition-opacity"
                >
                    <button
                        ref={menuButtonRef}
                        onClick={handleOpenMenu}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="p-1 bg-white/90 hover:bg-gray-100
                                   rounded-lg shadow-sm text-[#626f86]
                                   hover:text-[#172b4d] transition-colors"
                    >
                        <MoreHorizontal size={13} />
                    </button>
                </div>
            </div>

            {/* Dropdown in portal - completely outside overflow containers */}
            {showMenu &&
                createPortal(
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-[9998]"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(false);
                            }}
                        />

                        {/* Dropdown */}
                        <div
                            style={{
                                position: "fixed",
                                top: `${menuPos.top}px`,
                                left: `${menuPos.left}px`,
                                zIndex: 9999,
                            }}
                            className="bg-white rounded-xl shadow-xl
                                       border border-gray-200
                                       min-w-[170px] py-1 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                                <span className="text-[11px] font-semibold text-[#44546f]">
                                    Card actions
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowMenu(false);
                                    }}
                                    className="p-0.5 hover:bg-gray-100 rounded"
                                >
                                    <X size={12} className="text-[#626f86]" />
                                </button>
                            </div>

                            {/* Open card */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(false);
                                    setShowModal(true);
                                }}
                                className="w-full flex items-center gap-2.5
                                           px-3 py-2.5 text-xs text-[#172b4d]
                                           hover:bg-gray-50 transition-colors"
                            >
                                Open card
                            </button>

                            {/* Mark done / active */}
                            <button
                                onClick={handleMarkDone}
                                disabled={isMarking}
                                className={`w-full flex items-center gap-2.5
                                            px-3 py-2.5 text-xs transition-colors
                                            ${
                                                isDone
                                                    ? "text-[#172b4d] hover:bg-gray-50"
                                                    : "text-green-600 hover:bg-green-50"
                                            }`}
                            >
                                {isDone ? (
                                    <>
                                        <Circle size={13} />
                                        Mark as active
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={13} />
                                        Mark as done
                                    </>
                                )}
                            </button>

                            {/* Archive */}
                            <button
                                onClick={handleArchive}
                                disabled={isArchiving}
                                className="w-full flex items-center gap-2.5
                                           px-3 py-2.5 text-xs text-[#172b4d]
                                           hover:bg-red-50 hover:text-red-600
                                           transition-colors"
                            >
                                <Archive size={13} />
                                Archive card
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(false);
                                    setShowDeleteConfirm(true);
                                }}
                                disabled={isArchiving}
                                className="w-full flex items-center gap-2.5
                                           px-3 py-2.5 text-xs text-red-600
                                           hover:bg-red-50 transition-colors"
                            >
                                <Trash2 size={13} />
                                Delete card
                            </button>
                        </div>
                    </>,
                    document.body,
                )}

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete card permanently?"
                message={`This will permanently delete "${card.title}".`}
                confirmText="Delete"
                onConfirm={handleDeletePermanent}
                onCancel={() => setShowDeleteConfirm(false)}
                isLoading={isArchiving}
            />

            {showModal && (
                <CardModal
                    cardId={card.id}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
}
