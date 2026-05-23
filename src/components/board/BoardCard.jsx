import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import * as api from "../../services/api.js";
import { useBoardStore } from "../../store/boardStore.js";
import toast from "react-hot-toast";

export default function BoardCard({ board }) {
    const navigate = useNavigate();
    const removeBoard = useBoardStore((s) => s.removeBoard);

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (!confirm(`Archive board "${board.title}"?`)) return;
        try {
            await api.deleteBoard(board.id);
            removeBoard(board.id);
            toast.success("Board archived");
        } catch {}
    };

    return (
        <div
            onClick={() => navigate(`/board/${board.id}`)}
            className="group relative rounded-xl cursor-pointer overflow-hidden
                 h-28 shadow-md hover:shadow-xl transition-all
                 hover:-translate-y-0.5"
            style={{ backgroundColor: board.background_color || "#0079BF" }}
        >
            {/* Hover overlay */}
            <div
                className="absolute inset-0 bg-black/10 opacity-0
                      group-hover:opacity-100 transition-opacity"
            />

            {/* Board title */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3
                    className="text-white font-bold text-sm leading-tight
                       drop-shadow line-clamp-2"
                >
                    {board.title}
                </h3>
                {(board.list_count > 0 || board.card_count > 0) && (
                    <p className="text-white/70 text-xs mt-0.5">
                        {board.list_count} lists · {board.card_count} cards
                    </p>
                )}
            </div>

            {/* Delete button */}
            <button
                onClick={handleDelete}
                className="absolute top-2 right-2 p-1.5 rounded-lg
                   bg-black/20 text-white opacity-0
                   group-hover:opacity-100 hover:bg-black/40
                   transition-all"
            >
                <Trash2 size={13} />
            </button>
        </div>
    );
}
