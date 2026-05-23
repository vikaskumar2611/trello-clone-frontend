import { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import * as api from "../../services/api.js";
import { useCurrentBoardStore } from "../../store/currentBoardStore.js";

export default function AddCardButton({ listId }) {
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const textareaRef = useRef(null);
    const addCard = useCurrentBoardStore((s) => s.addCard);

    useEffect(() => {
        if (isAdding) {
            // Small timeout ensures the textarea is mounted before focusing
            setTimeout(() => textareaRef.current?.focus(), 50);
        }
    }, [isAdding]);

    const handleAdd = async () => {
        if (!title.trim() || loading) return;
        setLoading(true);
        try {
            const res = await api.createCard(listId, { title: title.trim() });
            addCard(listId, res.data.data);
            setTitle("");
            // Stay open so user can add another card quickly (Trello behavior)
            setTimeout(() => textareaRef.current?.focus(), 50);
        } catch {
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setIsAdding(false);
        setTitle("");
    };

    if (!isAdding) {
        return (
            <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1.5 w-full px-2 py-2
                   text-[#44546f] hover:bg-[#091e420f]
                   hover:text-[#172b4d] rounded-lg
                   text-xs font-medium transition-colors
                   group"
            >
                <span
                    className="flex items-center justify-center
                         w-5 h-5 rounded
                         group-hover:bg-[#0052CC]
                         group-hover:text-white
                         transition-colors"
                >
                    <Plus size={14} />
                </span>
                Add a card
            </button>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <textarea
                ref={textareaRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAdd();
                    }
                    if (e.key === "Escape") handleCancel();
                }}
                placeholder="Enter a title for this card..."
                rows={3}
                className="w-full px-3 py-2 text-sm text-[#172b4d]
                   bg-white border-2 border-[#0052CC]
                   rounded-xl focus:outline-none resize-none
                   shadow-sm"
            />
            <div className="flex items-center gap-2">
                <button
                    onClick={handleAdd}
                    disabled={!title.trim() || loading}
                    className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0065FF]
                     text-white text-xs font-semibold rounded-lg
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
                >
                    {loading ? "Adding..." : "Add card"}
                </button>
                <button
                    onClick={handleCancel}
                    className="p-1.5 hover:bg-[#091e420f] rounded-lg
                     text-[#626f86] hover:text-[#172b4d]
                     transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
