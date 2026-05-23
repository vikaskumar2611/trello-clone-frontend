import { useState } from "react";
import { Calendar } from "lucide-react";
import * as api from "../../services/api.js";
import { getDueDateStatus, formatDueDate } from "../../utils/dateHelpers.js";

export default function CardDueDate({
    cardId,
    dueDate,
    dueCompleted,
    onUpdate,
}) {
    const [loading, setLoading] = useState(false);

    const handleDateChange = async (e) => {
        setLoading(true);
        try {
            const newDate = e.target.value
                ? new Date(e.target.value).toISOString()
                : null;
            await api.updateCard(cardId, { due_date: newDate });
            onUpdate({ due_date: newDate });
        } catch {
        } finally {
            setLoading(false);
        }
    };

    const handleToggleComplete = async () => {
        setLoading(true);
        try {
            await api.updateCard(cardId, { due_completed: !dueCompleted });
            onUpdate({ due_completed: !dueCompleted });
        } catch {
        } finally {
            setLoading(false);
        }
    };

    const status = getDueDateStatus(dueDate, dueCompleted);
    const statusStyle = {
        completed: "bg-green-100 text-green-700",
        overdue: "bg-red-100 text-red-700",
        "due-soon": "bg-yellow-100 text-yellow-700",
        upcoming: "bg-gray-100 text-gray-600",
    };

    return (
        <div>
            <p className="text-xs font-semibold text-[#44546f] uppercase tracking-wide mb-2">
                Due Date
            </p>

            <input
                type="datetime-local"
                value={
                    dueDate ? new Date(dueDate).toISOString().slice(0, 16) : ""
                }
                onChange={handleDateChange}
                disabled={loading}
                className="w-full px-3 py-2 text-xs text-[#172b4d] bg-white
                   border-2 border-[#dfe1e6] focus:border-[#0052CC]
                   rounded-lg focus:outline-none mb-2 transition-colors"
            />

            {dueDate && (
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="due-complete"
                        checked={dueCompleted}
                        onChange={handleToggleComplete}
                        disabled={loading}
                        className="w-3.5 h-3.5 accent-[#0052CC] cursor-pointer"
                    />
                    <label
                        htmlFor="due-complete"
                        className={`text-xs font-medium px-2 py-0.5 rounded cursor-pointer
                        ${statusStyle[status]}`}
                    >
                        {dueCompleted
                            ? "Complete"
                            : `Due ${formatDueDate(dueDate)}`}
                    </label>
                </div>
            )}
        </div>
    );
}
