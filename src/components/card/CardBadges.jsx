import { Clock, AlignLeft, CheckSquare } from "lucide-react";
import { formatDueDate, getDueDateStatus } from "../../utils/dateHelpers.js";

export default function CardBadges({ card }) {
    const dueDateStatus = getDueDateStatus(card.due_date, card.due_completed);

    const dueBadgeStyle = {
        completed: "bg-green-100 text-green-700",
        overdue: "bg-red-100   text-red-700",
        "due-soon": "bg-yellow-100 text-yellow-700",
        upcoming: "bg-gray-100   text-gray-600",
    };

    // Only render if there's something to show
    const hasDue = !!card.due_date;
    const hasDesc = !!card.description;
    const hasChecklist = card.checklist_progress?.total > 0;

    if (!hasDue && !hasDesc && !hasChecklist) return null;

    return (
        // mt-2 gives space from title
        // flex-wrap so badges wrap cleanly
        // NO absolute positioning - stays in document flow
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {/* Due date */}
            {hasDue && (
                <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5
                      text-[10px] font-medium rounded
                      ${dueBadgeStyle[dueDateStatus] || dueBadgeStyle.upcoming}`}
                >
                    <Clock size={9} />
                    {formatDueDate(card.due_date)}
                </span>
            )}

            {/* Description indicator */}
            {hasDesc && (
                <span
                    title="Has description"
                    className="inline-flex items-center text-[#626f86]"
                >
                    <AlignLeft size={12} />
                </span>
            )}

            {/* Checklist progress */}
            {hasChecklist && (
                <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5
                      text-[10px] font-medium rounded
                      ${
                          card.checklist_progress.completed ===
                          card.checklist_progress.total
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100  text-gray-600"
                      }`}
                >
                    <CheckSquare size={9} />
                    {card.checklist_progress.completed}/
                    {card.checklist_progress.total}
                </span>
            )}
        </div>
    );
}
