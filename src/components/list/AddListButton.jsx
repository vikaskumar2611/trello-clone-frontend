import { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import * as api from "../../services/api.js";
import { useCurrentBoardStore } from "../../store/currentBoardStore.js";

export default function AddListButton({ boardId }) {
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const addList = useCurrentBoardStore((s) => s.addList);

    useEffect(() => {
        if (isAdding) inputRef.current?.focus();
    }, [isAdding]);

    const handleAdd = async () => {
        if (!title.trim()) return;
        setLoading(true);
        try {
            const res = await api.createList(boardId, { title: title.trim() });
            addList(res.data.data);
            setTitle("");
            inputRef.current?.focus();
        } catch {
        } finally {
            setLoading(false);
        }
    };

    if (!isAdding) {
        return (
            <button
                onClick={() => setIsAdding(true)}
                className="flex-shrink-0 w-64 h-fit flex items-center gap-2 px-4 py-3
                   bg-white/20 hover:bg-white/30 text-white rounded-xl
                   text-sm font-medium transition-colors"
            >
                <Plus size={16} /> Add another list
            </button>
        );
    }

    return (
        <div className="flex-shrink-0 w-64 bg-[#f1f2f4] rounded-xl p-2 h-fit">
            <input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd();
                    if (e.key === "Escape") {
                        setIsAdding(false);
                        setTitle("");
                    }
                }}
                placeholder="Enter list title..."
                className="w-full px-3 py-2 text-sm text-[#172b4d] bg-white
                   border-2 border-[#0052CC] rounded-lg focus:outline-none mb-2"
            />
            <div className="flex items-center gap-2">
                <button
                    onClick={handleAdd}
                    disabled={!title.trim() || loading}
                    className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#0065FF] text-white
                     text-xs font-medium rounded-lg disabled:opacity-50
                     transition-colors"
                >
                    Add list
                </button>
                <button
                    onClick={() => {
                        setIsAdding(false);
                        setTitle("");
                    }}
                    className="p-1.5 hover:bg-black/10 rounded-lg text-[#626f86]
                     transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
