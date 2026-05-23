import { useState, useEffect, useRef } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import Avatar from "../common/Avatar.jsx";
import { LABEL_COLORS } from "../../utils/colorHelpers.js";
import { useCurrentBoardStore } from "../../store/currentBoardStore.js";
import * as api from "../../services/api.js";
import toast from "react-hot-toast";

export default function FilterBar({
    boardId,
    members,
    labels,
    filters,
    onFilterChange,
}) {
    const [showLabelDropdown, setShowLabelDropdown] = useState(false);
    const [showMemberDropdown, setShowMemberDropdown] = useState(false);
    const [newLabelName, setNewLabelName] = useState("");
    const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0].hex);
    const [isCreatingLabel, setIsCreatingLabel] = useState(false);

    const addLabelToStore = useCurrentBoardStore((s) => s.addLabelToStore);

    const toggleLabel = (labelId) => {
        const current = filters.labels || [];
        const updated = current.includes(labelId)
            ? current.filter((id) => id !== labelId)
            : [...current, labelId];
        onFilterChange({ ...filters, labels: updated });
    };

    const toggleMember = (memberId) => {
        const current = filters.members || [];
        const updated = current.includes(memberId)
            ? current.filter((id) => id !== memberId)
            : [...current, memberId];
        onFilterChange({ ...filters, members: updated });
    };

    const clearAll = () =>
        onFilterChange({ q: "", labels: [], members: [], due: "" });

    const hasFilters =
        filters.q ||
        filters.labels?.length ||
        filters.members?.length ||
        filters.due;

    const handleCreateLabel = async () => {
        if (!boardId || !newLabelName.trim()) return;
        setIsCreatingLabel(true);
        try {
            const res = await api.createLabel(boardId, {
                name: newLabelName.trim(),
                color: newLabelColor,
            });
            addLabelToStore(res.data.data);
            setNewLabelName("");
            toast.success("Label created");
        } catch {
            toast.error("Failed to create label");
        } finally {
            setIsCreatingLabel(false);
        }
    };

    return (
        <div
            className="relative z-10 flex items-center gap-2 px-4 py-2
                bg-black/15 backdrop-blur-sm flex-wrap"
        >
            {/* Search */}
            <div className="relative">
                <Search
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2
                                      text-white/60 pointer-events-none"
                />
                <input
                    type="text"
                    placeholder="Search cards..."
                    value={filters.q || ""}
                    onChange={(e) =>
                        onFilterChange({ ...filters, q: e.target.value })
                    }
                    className="pl-8 pr-3 py-1.5 bg-white/20 text-white text-xs
                     placeholder:text-white/60 rounded-lg border border-white/20
                     focus:outline-none focus:bg-white/30 w-36 sm:w-48
                     transition-all"
                />
            </div>

            {/* Label filter */}
            <div className="relative">
                <button
                    onClick={() => {
                        setShowLabelDropdown((v) => !v);
                        setShowMemberDropdown(false);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                      font-medium text-white border transition-colors
                      ${
                          filters.labels?.length
                              ? "bg-white/30 border-white/50"
                              : "bg-white/10 border-white/20 hover:bg-white/20"
                      }`}
                >
                    Labels
                    {filters.labels?.length > 0 && (
                        <span className="bg-white/30 rounded-full px-1.5 text-[10px]">
                            {filters.labels.length}
                        </span>
                    )}
                    <ChevronDown size={12} />
                </button>

                {showLabelDropdown && (
                    <div
                        className="absolute top-full mt-1 left-0 bg-white rounded-xl
                                                    shadow-xl border border-gray-200 p-2 z-20 min-w-[160px]"
                    >
                        {labels.map((label) => (
                            <button
                                key={label.id}
                                onClick={() => toggleLabel(label.id)}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg
                            text-xs hover:bg-gray-50 transition-colors
                            ${filters.labels?.includes(label.id) ? "bg-blue-50" : ""}`}
                            >
                                <span
                                    className="w-8 h-4 rounded flex-shrink-0"
                                    style={{ backgroundColor: label.color }}
                                />
                                <span className="text-[#172b4d] font-medium truncate">
                                    {label.name}
                                </span>
                                {filters.labels?.includes(label.id) && (
                                    <span className="ml-auto text-blue-600 text-[10px] font-bold">
                                        ✓
                                    </span>
                                )}
                            </button>
                        ))}

                        <div className="mt-2 pt-2 border-t border-gray-100">
                            <p className="text-[10px] font-semibold text-[#44546f] uppercase mb-1.5">
                                New label
                            </p>
                            <input
                                value={newLabelName}
                                onChange={(e) =>
                                    setNewLabelName(e.target.value)
                                }
                                placeholder="Label name"
                                className="w-full px-2 py-1.5 text-xs text-[#172b4d]
                                 border border-gray-200 rounded-lg
                                 focus:outline-none focus:border-[#0052CC]"
                            />
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {LABEL_COLORS.map((c) => (
                                    <button
                                        key={c.hex}
                                        onClick={() => setNewLabelColor(c.hex)}
                                        className={`w-5 h-5 rounded-full border-2
                                        ${
                                            newLabelColor === c.hex
                                                ? "border-[#0052CC]"
                                                : "border-transparent"
                                        }`}
                                        style={{ backgroundColor: c.hex }}
                                        aria-label={c.name}
                                    />
                                ))}
                            </div>
                            <button
                                onClick={handleCreateLabel}
                                disabled={
                                    isCreatingLabel || !newLabelName.trim()
                                }
                                className="w-full mt-2 py-1.5 text-xs font-semibold
                                 rounded-lg bg-[#0052CC] text-white
                                 disabled:opacity-50"
                            >
                                {isCreatingLabel
                                    ? "Creating..."
                                    : "Create label"}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Member filter */}
            <div className="relative">
                <button
                    onClick={() => {
                        setShowMemberDropdown((v) => !v);
                        setShowLabelDropdown(false);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                      font-medium text-white border transition-colors
                      ${
                          filters.members?.length
                              ? "bg-white/30 border-white/50"
                              : "bg-white/10 border-white/20 hover:bg-white/20"
                      }`}
                >
                    Members
                    {filters.members?.length > 0 && (
                        <span className="bg-white/30 rounded-full px-1.5 text-[10px]">
                            {filters.members.length}
                        </span>
                    )}
                    <ChevronDown size={12} />
                </button>

                {showMemberDropdown && (
                    <div
                        className="absolute top-full mt-1 left-0 bg-white rounded-xl
                                                    shadow-xl border border-gray-200 p-2 z-20 min-w-[180px]"
                    >
                        {members.map((member) => (
                            <button
                                key={member.id}
                                onClick={() => toggleMember(member.id)}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg
                            text-xs hover:bg-gray-50 transition-colors
                            ${filters.members?.includes(member.id) ? "bg-blue-50" : ""}`}
                            >
                                <Avatar member={member} size="sm" />
                                <span className="text-[#172b4d] font-medium truncate">
                                    {member.name}
                                </span>
                                {filters.members?.includes(member.id) && (
                                    <span className="ml-auto text-blue-600 font-bold">
                                        ✓
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Due date filter */}
            <div className="relative">
                <select
                    value={filters.due || ""}
                    onChange={(e) =>
                        onFilterChange({ ...filters, due: e.target.value })
                    }
                    className="appearance-none px-3 py-1.5 pr-7 bg-white/10
                   text-white text-xs rounded-lg border border-white/20
                   hover:bg-white/20 focus:outline-none focus:bg-white/20
                   cursor-pointer"
                >
                    <option className="text-[#172b4d]" value="">
                        Due Date
                    </option>
                    <option className="text-[#172b4d]" value="overdue">
                        Overdue
                    </option>
                    <option className="text-[#172b4d]" value="due_soon">
                        Due Soon
                    </option>
                    <option className="text-[#172b4d]" value="has_due">
                        Has Due Date
                    </option>
                    <option className="text-[#172b4d]" value="no_due">
                        No Due Date
                    </option>
                </select>
                <ChevronDown
                    size={12}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2
                   text-white/80 pointer-events-none"
                />
            </div>

            {/* Clear filters */}
            {hasFilters && (
                <button
                    onClick={clearAll}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs
                     text-white/80 hover:text-white hover:bg-white/10
                     transition-colors"
                >
                    <X size={12} /> Clear
                </button>
            )}
        </div>
    );
}
