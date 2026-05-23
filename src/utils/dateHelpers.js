import { format, isPast, isWithinInterval, addDays, parseISO } from "date-fns";

export const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    return format(date, "MMM d");
};

export const isOverdue = (dateStr, completed) => {
    if (!dateStr || completed) return false;
    const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    return isPast(date);
};

export const isDueSoon = (dateStr, completed) => {
    if (!dateStr || completed) return false;
    const date = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    return isWithinInterval(date, {
        start: new Date(),
        end: addDays(new Date(), 2),
    });
};

export const getDueDateStatus = (dateStr, completed) => {
    if (!dateStr) return null;
    if (completed) return "completed";
    if (isOverdue(dateStr, completed)) return "overdue";
    if (isDueSoon(dateStr, completed)) return "due-soon";
    return "upcoming";
};
