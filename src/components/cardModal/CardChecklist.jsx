import { useState } from "react";
import { CheckSquare, Trash2, Plus, X } from "lucide-react";
import * as api from "../../services/api.js";

export default function CardChecklist({ cardId, checklists, onUpdate }) {
    const handleToggleItem = async (checklistId, itemId, isCompleted) => {
        try {
            await api.updateChecklistItem(itemId, {
                is_completed: !isCompleted,
            });
            const updated = checklists.map((ch) =>
                ch.id !== checklistId
                    ? ch
                    : {
                          ...ch,
                          items: ch.items.map((item) =>
                              item.id !== itemId
                                  ? item
                                  : { ...item, is_completed: !isCompleted },
                          ),
                      },
            );
            onUpdate(updated);
        } catch {}
    };

    const handleDeleteChecklist = async (checklistId) => {
        try {
            await api.deleteChecklist(checklistId);
            onUpdate(checklists.filter((ch) => ch.id !== checklistId));
        } catch {}
    };

    const handleDeleteItem = async (checklistId, itemId) => {
        try {
            await api.deleteChecklistItem(itemId);
            const updated = checklists.map((ch) =>
                ch.id !== checklistId
                    ? ch
                    : {
                          ...ch,
                          items: ch.items.filter((item) => item.id !== itemId),
                      },
            );
            onUpdate(updated);
        } catch {}
    };

    return (
        <div className="space-y-4">
            {checklists.map((checklist) => {
                const total = checklist.items.length;
                const completed = checklist.items.filter(
                    (i) => i.is_completed,
                ).length;
                const progress =
                    total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                    <div key={checklist.id}>
                        <div className="flex items-center gap-3 mb-2">
                            <CheckSquare
                                size={18}
                                className="text-[#44546f] flex-shrink-0"
                            />
                            <h3 className="text-sm font-semibold text-[#172b4d] flex-1">
                                {checklist.title}
                            </h3>
                            <button
                                onClick={() =>
                                    handleDeleteChecklist(checklist.id)
                                }
                                className="px-3 py-1 text-xs bg-[#091e420f] hover:bg-[#091e4221]
                           text-[#44546f] rounded-lg transition-colors"
                            >
                                Delete
                            </button>
                        </div>

                        <div className="ml-7">
                            {/* Progress bar */}
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs text-[#626f86] w-7 text-right">
                                    {progress}%
                                </span>
                                <div className="flex-1 bg-[#091e420f] rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500
                                ${progress === 100 ? "bg-[#61BD4F]" : "bg-[#0052CC]"}`}
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-1">
                                {checklist.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group flex items-start gap-2 p-1.5
                               hover:bg-[#091e420f] rounded-lg transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={item.is_completed}
                                            onChange={() =>
                                                handleToggleItem(
                                                    checklist.id,
                                                    item.id,
                                                    item.is_completed,
                                                )
                                            }
                                            className="mt-0.5 w-3.5 h-3.5 rounded border-[#8590a2]
                                 accent-[#0052CC] cursor-pointer flex-shrink-0"
                                        />
                                        <span
                                            className={`flex-1 text-xs leading-relaxed
                                  ${
                                      item.is_completed
                                          ? "line-through text-[#8590a2]"
                                          : "text-[#172b4d]"
                                  }`}
                                        >
                                            {item.title}
                                        </span>
                                        <button
                                            onClick={() =>
                                                handleDeleteItem(
                                                    checklist.id,
                                                    item.id,
                                                )
                                            }
                                            className="opacity-0 group-hover:opacity-100 p-0.5
                                 text-[#626f86] hover:text-red-500
                                 transition-all"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <AddChecklistItem
                                checklistId={checklist.id}
                                onAdd={(item) => {
                                    const updated = checklists.map((ch) =>
                                        ch.id !== checklist.id
                                            ? ch
                                            : {
                                                  ...ch,
                                                  items: [...ch.items, item],
                                              },
                                    );
                                    onUpdate(updated);
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function AddChecklistItem({ checklistId, onAdd }) {
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAdd = async () => {
        if (!title.trim()) return;
        setLoading(true);
        try {
            const res = await api.addChecklistItem(checklistId, {
                title: title.trim(),
            });
            onAdd(res.data.data);
            setTitle("");
        } catch {
        } finally {
            setLoading(false);
        }
    };

    if (!isAdding) {
        return (
            <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1.5 mt-2 px-3 py-1.5 text-xs
                   text-[#44546f] bg-[#091e420f] hover:bg-[#091e4221]
                   rounded-lg transition-colors"
            >
                <Plus size={12} /> Add an item
            </button>
        );
    }

    return (
        <div className="mt-2">
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd();
                    if (e.key === "Escape") {
                        setIsAdding(false);
                        setTitle("");
                    }
                }}
                placeholder="Add an item..."
                autoFocus
                className="w-full px-3 py-2 text-xs text-[#172b4d] bg-white
                   border-2 border-[#0052CC] rounded-lg focus:outline-none mb-2"
            />
            <div className="flex gap-2">
                <button
                    onClick={handleAdd}
                    disabled={!title.trim() || loading}
                    className="px-3 py-1.5 bg-[#0052CC] text-white text-xs
                     rounded-lg disabled:opacity-50"
                >
                    Add
                </button>
                <button
                    onClick={() => {
                        setIsAdding(false);
                        setTitle("");
                    }}
                    className="p-1.5 hover:bg-black/10 rounded-lg text-[#626f86]"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}
