import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Archive, Trash2, X, Copy } from "lucide-react";
import * as api from "../../services/api.js";
import { useCurrentBoardStore } from "../../store/currentBoardStore.js";
import toast from "react-hot-toast";
import ConfirmDialog from "../common/ConfirmDialog.jsx";

export default function ListHeader({ list, dragHandleProps }) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(list.title);
    const [showMenu, setShowMenu] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const inputRef = useRef(null);
    const menuRef = useRef(null);
    const isSaving = useRef(false);
    const { updateListInStore, removeList } = useCurrentBoardStore();

    useEffect(() => {
        if (isEditing) inputRef.current?.select();
    }, [isEditing]);

    // Close menu on outside click
    useEffect(() => {
        if (!showMenu) return;
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [showMenu]);

    const handleSave = async () => {
        if (isSaving.current) return;
        const trimmed = title.trim();
        if (!trimmed || trimmed === list.title) {
            setTitle(list.title);
            setIsEditing(false);
            return;
        }
        isSaving.current = true;
        try {
            await api.updateList(list.id, { title: trimmed });
            updateListInStore(list.id, { title: trimmed });
            setIsEditing(false);
            toast.success("List renamed");
        } catch {
            setTitle(list.title);
        } finally {
            isSaving.current = false;
        }
    };

    const handleArchiveList = async () => {
        setShowMenu(false);
        if (!confirm(`Archive list "${list.title}" and all its cards?`)) return;
        try {
            await api.deleteList(list.id);
            removeList(list.id);
            toast.success(`"${list.title}" archived`);
        } catch {
            toast.error("Failed to archive list");
        }
    };

    const handleDeleteList = async () => {
        setIsDeleting(true);
        try {
            await api.deleteListPermanently(list.id);
            removeList(list.id);
            toast.success(`"${list.title}" deleted`);
        } catch {
            toast.error("Failed to delete list");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <>
            <div
                className="flex items-center gap-1 px-2 pt-2.5 pb-1
                 cursor-grab active:cursor-grabbing select-none"
                {...dragHandleProps}
            >
                {/* Title - click to edit */}
                {isEditing ? (
                    <input
                        ref={inputRef}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleSave}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                inputRef.current?.blur();
                            }
                            if (e.key === "Escape") {
                                isSaving.current = true;
                                setTitle(list.title);
                                setIsEditing(false);
                                isSaving.current = false;
                            }
                        }}
                        // Stop drag from activating while typing
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 px-2 py-1 text-sm font-semibold
                     text-[#172b4d] bg-white border-2
                     border-[#0052CC] rounded-lg focus:outline-none"
                    />
                ) : (
                    <h3
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                        }}
                        className="flex-1 px-2 py-1 text-sm font-semibold
                     text-[#172b4d] rounded-lg hover:bg-black/5
                     cursor-text truncate leading-tight"
                    >
                        {list.title}
                    </h3>
                )}

                {/* Card count */}
                <span
                    className="text-[10px] text-[#626f86] bg-[#091e420f]
                       px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                >
                    {list.cards?.length ?? 0}
                </span>

                {/* Menu button */}
                <div className="relative flex-shrink-0" ref={menuRef}>
                    <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu((v) => !v);
                        }}
                        className={`p-1.5 rounded-lg transition-colors
                      text-[#626f86] hover:text-[#172b4d]
                      ${showMenu ? "bg-black/10" : "hover:bg-black/10"}`}
                    >
                        <MoreHorizontal size={15} />
                    </button>

                    {showMenu && (
                        <div
                            className="absolute top-full right-0 mt-1 bg-white
                       rounded-xl shadow-xl border border-gray-200
                       z-30 min-w-[200px] py-1 overflow-hidden"
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            {/* Menu header */}
                            <div
                                className="flex items-center justify-between
                            px-3 py-2 border-b border-gray-100"
                            >
                                <span className="text-xs font-semibold text-[#44546f]">
                                    List actions
                                </span>
                                <button
                                    onClick={() => setShowMenu(false)}
                                    className="p-0.5 hover:bg-gray-100 rounded text-[#626f86]"
                                >
                                    <X size={13} />
                                </button>
                            </div>

                            {/* Archive list */}
                            <button
                                onClick={handleArchiveList}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5
                         text-xs text-[#172b4d] hover:bg-red-50
                         hover:text-red-600 transition-colors"
                            >
                                <Archive size={13} />
                                Archive this list
                            </button>

                            <button
                                onClick={() => {
                                    setShowMenu(false);
                                    setShowDeleteConfirm(true);
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5
                         text-xs text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <Trash2 size={13} />
                                Delete list
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog
                isOpen={showDeleteConfirm}
                title="Delete list permanently?"
                message={`This will permanently delete "${list.title}" and all its cards.`}
                confirmText="Delete"
                onConfirm={handleDeleteList}
                onCancel={() => setShowDeleteConfirm(false)}
                isLoading={isDeleting}
            />
        </>
    );
}
