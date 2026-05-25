import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    Palette,
    UserPlus,
    Trash2,
    X,
    Sun,
    Moon,
} from "lucide-react";
import Avatar from "../common/Avatar.jsx";
import BoardBgPicker from "./BoardBgPicker.jsx";
import ConfirmDialog from "../common/ConfirmDialog.jsx";
import { useCurrentBoardStore } from "../../store/currentBoardStore.js";
import { useBoardStore } from "../../store/boardStore.js";
import * as api from "../../services/api.js";
import toast from "react-hot-toast";

export default function BoardHeader({ board, members, theme, onToggleTheme }) {
    const navigate = useNavigate();
    const [showBgPicker, setShowBgPicker] = useState(false);
    const [showMemberPicker, setShowMemberPicker] = useState(false);
    const [allMembers, setAllMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [addingMemberId, setAddingMemberId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const memberPickerRef = useRef(null);

    const addBoardMember = useCurrentBoardStore((s) => s.addBoardMember);
    const removeBoard = useBoardStore((s) => s.removeBoard);

    const availableMembers = useMemo(() => {
        const currentIds = new Set((members || []).map((m) => m.id));
        return allMembers.filter((m) => !currentIds.has(m.id));
    }, [allMembers, members]);

    const loadMembers = async () => {
        setLoadingMembers(true);
        try {
            const res = await api.getAllMembers();
            setAllMembers(res.data.data || []);
        } catch {
            toast.error("Failed to load members");
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleOpenPicker = async () => {
        const next = !showMemberPicker;
        setShowMemberPicker(next);
        if (next && allMembers.length === 0) {
            await loadMembers();
        }
    };

    const handleAddMember = async (member) => {
        if (!board?.id) return;
        setAddingMemberId(member.id);
        try {
            const res = await api.addBoardMember(board.id, {
                member_id: member.id,
            });
            addBoardMember(res.data.data);
            toast.success("Member added to board");
        } catch {
            toast.error("Failed to add member");
        } finally {
            setAddingMemberId(null);
        }
    };

    const handleDeleteBoard = async () => {
        if (!board?.id) return;
        setIsDeleting(true);
        try {
            await api.deleteBoard(board.id);
            removeBoard(board.id);
            toast.success("Board deleted");
            navigate("/");
        } catch {
            toast.error("Failed to delete board");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    useEffect(() => {
        if (!showMemberPicker) return;
        const handler = (e) => {
            if (memberPickerRef.current?.contains(e.target)) return;
            setShowMemberPicker(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [showMemberPicker]);

    return (
        <>
            <header
                className="relative z-30 flex items-center gap-2 px-4 py-2.5
                   backdrop-blur-sm flex-shrink-0"
                style={{
                    backgroundColor: "var(--ui-surface)",
                    borderBottom: "1px solid var(--ui-surface-border)",
                    color: "var(--ui-ink)",
                }}
            >
                {/* Back */}
                <button
                    onClick={() => navigate("/")}
                    className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                    style={{ backgroundColor: "transparent" }}
                >
                    <ChevronLeft size={18} />
                </button>

                {/* Board title */}
                <h1
                    className="font-bold text-base sm:text-lg
                       leading-tight flex-1 truncate"
                >
                    {board?.title}
                </h1>

                {/* Member avatars */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    {members?.slice(0, 4).map((m) => (
                        <Avatar
                            key={m.id}
                            member={m}
                            size="sm"
                            className="border-2"
                            style={{ borderColor: "var(--ui-surface-border)" }}
                        />
                    ))}
                    {members?.length > 4 && (
                        <div
                            className="w-6 h-6 rounded-full
                            flex items-center justify-center
                            text-[10px] font-bold"
                            style={{
                                backgroundColor: "var(--ui-surface-strong)",
                                color: "var(--ui-ink)",
                            }}
                        >
                            +{members.length - 4}
                        </div>
                    )}
                </div>

                <button
                    onClick={onToggleTheme}
                    className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                    style={{
                        backgroundColor: "var(--ui-surface-strong)",
                        border: "1px solid var(--ui-border)",
                        color: "var(--ui-ink)",
                    }}
                    aria-label="Toggle theme"
                >
                    {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
                </button>

                {/* Add member */}
                <div ref={memberPickerRef} className="relative flex-shrink-0">
                    <button
                        onClick={handleOpenPicker}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ backgroundColor: "var(--ui-surface-strong)" }}
                        aria-label="Add member"
                    >
                        <UserPlus size={14} />
                    </button>

                    {showMemberPicker && (
                        <div
                            className="absolute right-0 mt-2 w-56 rounded-xl z-50
                         overflow-hidden"
                            style={{
                                backgroundColor: "var(--ui-surface-strong)",
                                border: "1px solid var(--ui-border)",
                                boxShadow: "var(--ui-shadow)",
                            }}
                        >
                            <div
                                className="flex items-center justify-between px-3 py-2"
                                style={{
                                    borderBottom: "1px solid var(--ui-border)",
                                }}
                            >
                                <span className="text-xs font-semibold">
                                    Add members
                                </span>
                                <button
                                    onClick={() => setShowMemberPicker(false)}
                                    className="p-0.5 hover:bg-gray-100 rounded"
                                >
                                    <X
                                        size={12}
                                        style={{ color: "var(--ui-muted)" }}
                                    />
                                </button>
                            </div>

                            <div className="max-h-56 overflow-y-auto p-2">
                                {loadingMembers ? (
                                    <div
                                        className="text-xs px-2 py-3"
                                        style={{ color: "var(--ui-muted)" }}
                                    >
                                        Loading...
                                    </div>
                                ) : availableMembers.length === 0 ? (
                                    <div
                                        className="text-xs px-2 py-3"
                                        style={{ color: "var(--ui-muted)" }}
                                    >
                                        No members to add
                                    </div>
                                ) : (
                                    availableMembers.map((member) => (
                                        <button
                                            key={member.id}
                                            onClick={() =>
                                                handleAddMember(member)
                                            }
                                            disabled={
                                                addingMemberId === member.id
                                            }
                                            className="w-full flex items-center gap-2 px-2 py-1.5
                                     rounded-lg transition-colors"
                                            style={{
                                                color: "var(--ui-ink)",
                                            }}
                                        >
                                            <Avatar member={member} size="sm" />
                                            <span className="flex-1 text-xs text-left font-medium">
                                                {member.name}
                                            </span>
                                            <span
                                                className="text-[10px] font-semibold"
                                                style={{
                                                    color: "var(--ui-primary)",
                                                }}
                                            >
                                                Add
                                            </span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Change background */}
                <button
                    onClick={() => setShowBgPicker((v) => !v)}
                    className="flex items-center gap-1.5 px-3 py-1.5
                     rounded-lg text-xs font-medium transition-colors flex-shrink-0"
                    style={{ backgroundColor: "var(--ui-surface-strong)" }}
                >
                    <Palette size={14} />
                    <span className="hidden sm:inline">Background</span>
                </button>

                {/* Delete board */}
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5
                     rounded-lg text-xs font-medium transition-colors flex-shrink-0"
                    style={{ backgroundColor: "var(--ui-surface-strong)" }}
                >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">Delete</span>
                </button>
            </header>

            {/* Background picker dropdown - below header */}
            {showBgPicker && (
                <BoardBgPicker
                    board={board}
                    onClose={() => setShowBgPicker(false)}
                />
            )}

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete board permanently?"
                message={`This will permanently delete "${board?.title}" and all its lists and cards.`}
                confirmText="Delete"
                onConfirm={handleDeleteBoard}
                onCancel={() => setShowDeleteConfirm(false)}
                isLoading={isDeleting}
            />
        </>
    );
}
