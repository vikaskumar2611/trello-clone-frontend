import { useState } from "react";
import { MessageSquare, Pencil, Trash2, X, Check } from "lucide-react";
import Avatar from "../common/Avatar.jsx";
import { formatDueDate } from "../../utils/dateHelpers.js";
import * as api from "../../services/api.js";

const DEFAULT_MEMBER = {
    id: "a0000000-0000-0000-0000-000000000001",
    name: "Alice Johnson",
    color: "#0052CC",
};

export default function CardComments({ cardId, comments, onUpdate }) {
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!newComment.trim()) return;
        setLoading(true);
        try {
            const res = await api.addComment(cardId, {
                content: newComment.trim(),
            });
            onUpdate([...comments, res.data.data]);
            setNewComment("");
        } catch {
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (commentId) => {
        try {
            await api.deleteComment(commentId);
            onUpdate(comments.filter((c) => c.id !== commentId));
        } catch {}
    };

    const handleUpdate = async (commentId, content) => {
        try {
            await api.updateComment(commentId, { content });
            onUpdate(
                comments.map((c) =>
                    c.id === commentId ? { ...c, content } : c,
                ),
            );
        } catch {}
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-3">
                <MessageSquare
                    size={18}
                    className="text-[#44546f] flex-shrink-0"
                />
                <h3 className="text-sm font-semibold text-[#172b4d]">
                    Activity
                </h3>
            </div>

            {/* New comment */}
            <div className="flex gap-2 ml-7 mb-4">
                <Avatar
                    member={DEFAULT_MEMBER}
                    size="sm"
                    className="flex-shrink-0 mt-0.5"
                />
                <div className="flex-1">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.ctrlKey || e.metaKey))
                                handleAdd();
                        }}
                        placeholder="Write a comment... (Ctrl+Enter to save)"
                        rows={2}
                        className="w-full px-3 py-2 text-sm text-[#172b4d] bg-white
                       border-2 border-[#dfe1e6] focus:border-[#0052CC]
                       rounded-xl focus:outline-none resize-none transition-colors"
                    />
                    {newComment.trim() && (
                        <button
                            onClick={handleAdd}
                            disabled={loading}
                            className="mt-1.5 px-3 py-1.5 bg-[#0052CC] hover:bg-[#0065FF]
                         text-white text-xs font-medium rounded-lg
                         disabled:opacity-50 transition-colors"
                        >
                            Save
                        </button>
                    )}
                </div>
            </div>

            {/* Comments list */}
            <div className="space-y-3 ml-7">
                {comments.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        onDelete={() => handleDelete(comment.id)}
                        onUpdate={(content) =>
                            handleUpdate(comment.id, content)
                        }
                    />
                ))}
            </div>
        </div>
    );
}

function CommentItem({ comment, onDelete, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(comment.content);

    const handleSave = async () => {
        if (!value.trim()) return;
        await onUpdate(value.trim());
        setIsEditing(false);
    };

    return (
        <div className="group flex gap-2">
            <Avatar
                member={comment.member}
                size="sm"
                className="flex-shrink-0 mt-0.5"
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-semibold text-[#172b4d]">
                        {comment.member?.name}
                    </span>
                    <span className="text-[10px] text-[#8590a2]">
                        {formatDueDate(comment.created_at)}
                    </span>
                </div>

                {isEditing ? (
                    <div>
                        <textarea
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            rows={2}
                            autoFocus
                            className="w-full px-3 py-2 text-xs text-[#172b4d] bg-white
                         border-2 border-[#0052CC] rounded-xl
                         focus:outline-none resize-none"
                        />
                        <div className="flex gap-1.5 mt-1">
                            <button
                                onClick={handleSave}
                                className="px-2 py-1 bg-[#0052CC] text-white text-[10px]
                           rounded-lg"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setValue(comment.content);
                                }}
                                className="p-1 hover:bg-black/10 rounded-lg text-[#626f86]"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p
                            className="text-xs text-[#172b4d] bg-white rounded-xl
                          px-3 py-2 shadow-sm border border-gray-100"
                        >
                            {comment.content}
                        </p>
                        <div className="flex gap-2 mt-1">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-[10px] text-[#626f86] hover:text-[#172b4d]
                           underline transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={onDelete}
                                className="text-[10px] text-[#626f86] hover:text-red-500
                           underline transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
