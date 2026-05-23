import { useState, useEffect } from "react";
import { Archive, RotateCcw, X, Search, Layers, Square } from "lucide-react";
import * as api from "../../services/api.js";
import { useCurrentBoardStore } from "../../store/currentBoardStore.js";
import Spinner from "../common/Spinner.jsx";
import toast from "react-hot-toast";

export default function ArchivePanel({ boardId, onClose }) {
    const [activeTab, setActiveTab] = useState("cards"); // 'cards' | 'lists'
    const [archivedCards, setArchivedCards] = useState([]);
    const [archivedLists, setArchivedLists] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [restoringId, setRestoringId] = useState(null); // track which item is restoring

    const { fetchBoard } = useCurrentBoardStore();

    // Fetch both on open
    useEffect(() => {
        fetchArchived();
    }, [boardId]);

    const fetchArchived = async () => {
        setIsLoading(true);
        try {
            const [cardsRes, listsRes] = await Promise.all([
                api.getArchivedCards(boardId),
                api.getArchivedLists(boardId),
            ]);
            setArchivedCards(cardsRes.data.data);
            setArchivedLists(listsRes.data.data);
        } catch {
            toast.error("Failed to load archived items");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestoreCard = async (card) => {
        setRestoringId(card.id);
        try {
            await api.restoreCard(card.id);
            setArchivedCards((prev) => prev.filter((c) => c.id !== card.id));
            // Refresh the board so restored card appears in correct list
            await fetchBoard(boardId);
            toast.success(`"${card.title}" restored to "${card.list_title}"`);
        } catch (err) {
            // Backend sends helpful message if list is also archived
            toast.error(
                err.response?.data?.message || "Failed to restore card",
            );
        } finally {
            setRestoringId(null);
        }
    };

    const handleRestoreList = async (list) => {
        setRestoringId(list.id);
        try {
            await api.restoreList(list.id);
            setArchivedLists((prev) => prev.filter((l) => l.id !== list.id));
            // Refresh board so restored list + cards appear
            await fetchBoard(boardId);
            toast.success(`"${list.title}" and its cards restored`);
        } catch {
            toast.error("Failed to restore list");
        } finally {
            setRestoringId(null);
        }
    };

    const handleDeleteCardPermanently = async (card) => {
        if (
            !confirm(
                `Permanently delete "${card.title}"? This cannot be undone.`,
            )
        )
            return;
        try {
            // Hard delete - directly via query would need a new endpoint
            // For now we just remove from UI and keep in DB as archived
            // (Trello also doesn't permanently delete easily)
            toast("Permanent delete coming soon - card remains archived", {
                icon: "ℹ️",
            });
        } catch {}
    };

    // Filter by search query
    const filteredCards = archivedCards.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    const filteredLists = archivedLists.filter((l) =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        // Panel slides in from the right
        <div className="fixed inset-0 z-40 flex justify-end">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* Panel */}
            <div
                className="relative bg-[#f1f2f4] w-full max-w-sm
                   h-full flex flex-col shadow-2xl
                   animate-slide-in-right overflow-hidden"
            >
                {/* Header */}
                <div
                    className="flex items-center gap-3 px-4 py-3.5
                        bg-white border-b border-gray-200 flex-shrink-0"
                >
                    <Archive size={18} className="text-[#44546f]" />
                    <h2 className="text-sm font-semibold text-[#172b4d] flex-1">
                        Archive
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg
                       text-[#626f86] hover:text-[#172b4d]
                       transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Search */}
                <div className="px-3 pt-3 pb-2 flex-shrink-0">
                    <div className="relative">
                        <Search
                            size={13}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2
                         text-[#8590a2] pointer-events-none"
                        />
                        <input
                            type="text"
                            placeholder="Search archived items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-xs text-[#172b4d]
                         bg-white border border-gray-200 rounded-lg
                         focus:outline-none focus:border-[#0052CC]
                         transition-colors"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex px-3 gap-1 flex-shrink-0 mb-2">
                    <button
                        onClick={() => setActiveTab("cards")}
                        className={`flex-1 flex items-center justify-center gap-1.5
                        py-2 rounded-lg text-xs font-semibold
                        transition-colors
                        ${
                            activeTab === "cards"
                                ? "bg-[#0052CC] text-white"
                                : "bg-white text-[#44546f] hover:bg-gray-100"
                        }`}
                    >
                        <Square size={12} />
                        Cards
                        {archivedCards.length > 0 && (
                            <span
                                className={`px-1.5 py-0.5 rounded-full text-[10px]
                                font-bold
                                ${
                                    activeTab === "cards"
                                        ? "bg-white/20 text-white"
                                        : "bg-[#091e420f] text-[#626f86]"
                                }`}
                            >
                                {archivedCards.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("lists")}
                        className={`flex-1 flex items-center justify-center gap-1.5
                        py-2 rounded-lg text-xs font-semibold
                        transition-colors
                        ${
                            activeTab === "lists"
                                ? "bg-[#0052CC] text-white"
                                : "bg-white text-[#44546f] hover:bg-gray-100"
                        }`}
                    >
                        <Layers size={12} />
                        Lists
                        {archivedLists.length > 0 && (
                            <span
                                className={`px-1.5 py-0.5 rounded-full text-[10px]
                                font-bold
                                ${
                                    activeTab === "lists"
                                        ? "bg-white/20 text-white"
                                        : "bg-[#091e420f] text-[#626f86]"
                                }`}
                            >
                                {archivedLists.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Content - scrollable */}
                <div className="flex-1 overflow-y-auto px-3 pb-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <Spinner />
                        </div>
                    ) : activeTab === "cards" ? (
                        // ── Archived Cards ────────────────────────────────
                        filteredCards.length === 0 ? (
                            <EmptyState
                                icon={
                                    <Square size={32} className="opacity-30" />
                                }
                                text={
                                    searchQuery
                                        ? "No archived cards match your search"
                                        : "No archived cards"
                                }
                            />
                        ) : (
                            <div className="space-y-2">
                                {filteredCards.map((card) => (
                                    <div
                                        key={card.id}
                                        className="bg-white rounded-xl p-3 shadow-sm
                               border border-gray-100"
                                    >
                                        {/* Cover color strip */}
                                        {card.cover_color && (
                                            <div
                                                className="w-full h-6 rounded-lg mb-2"
                                                style={{
                                                    backgroundColor:
                                                        card.cover_color,
                                                }}
                                            />
                                        )}

                                        <p
                                            className="text-xs font-semibold text-[#172b4d]
                                  leading-snug mb-1"
                                        >
                                            {card.title}
                                        </p>

                                        <div className="flex items-center gap-1 mb-2.5">
                                            <span className="text-[10px] text-[#8590a2]">
                                                in
                                            </span>
                                            <span
                                                className="text-[10px] font-medium
                                       text-[#626f86] bg-[#091e420f]
                                       px-1.5 py-0.5 rounded"
                                            >
                                                {card.list_title}
                                            </span>
                                            <span className="text-[10px] text-[#8590a2] ml-auto">
                                                {formatDate(card.updated_at)}
                                            </span>
                                        </div>

                                        <div className="flex gap-1.5">
                                            <button
                                                onClick={() =>
                                                    handleRestoreCard(card)
                                                }
                                                disabled={
                                                    restoringId === card.id
                                                }
                                                className="flex-1 flex items-center justify-center
                                   gap-1.5 py-1.5 bg-[#0052CC]
                                   hover:bg-[#0065FF] text-white
                                   text-[11px] font-semibold rounded-lg
                                   disabled:opacity-50 transition-colors"
                                            >
                                                {restoringId === card.id ? (
                                                    <Spinner size="sm" light />
                                                ) : (
                                                    <RotateCcw size={11} />
                                                )}
                                                Restore
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : // ── Archived Lists ────────────────────────────────
                    filteredLists.length === 0 ? (
                        <EmptyState
                            icon={<Layers size={32} className="opacity-30" />}
                            text={
                                searchQuery
                                    ? "No archived lists match your search"
                                    : "No archived lists"
                            }
                        />
                    ) : (
                        <div className="space-y-2">
                            {filteredLists.map((list) => (
                                <div
                                    key={list.id}
                                    className="bg-white rounded-xl p-3 shadow-sm
                               border border-gray-100"
                                >
                                    <p className="text-xs font-semibold text-[#172b4d] mb-1">
                                        {list.title}
                                    </p>

                                    <div className="flex items-center gap-2 mb-2.5">
                                        <span className="text-[10px] text-[#8590a2]">
                                            {list.card_count} card
                                            {list.card_count !== "1"
                                                ? "s"
                                                : ""}{" "}
                                            will be restored
                                        </span>
                                        <span className="text-[10px] text-[#8590a2] ml-auto">
                                            {formatDate(list.updated_at)}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => handleRestoreList(list)}
                                        disabled={restoringId === list.id}
                                        className="w-full flex items-center justify-center
                                 gap-1.5 py-1.5 bg-[#0052CC]
                                 hover:bg-[#0065FF] text-white
                                 text-[11px] font-semibold rounded-lg
                                 disabled:opacity-50 transition-colors"
                                    >
                                        {restoringId === list.id ? (
                                            <Spinner size="sm" light />
                                        ) : (
                                            <RotateCcw size={11} />
                                        )}
                                        Restore List & Cards
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer - refresh button */}
                <div
                    className="px-3 py-2.5 border-t border-gray-200
                        bg-white flex-shrink-0"
                >
                    <button
                        onClick={fetchArchived}
                        disabled={isLoading}
                        className="w-full py-2 text-xs font-medium text-[#44546f]
                       hover:bg-[#091e420f] rounded-lg transition-colors
                       flex items-center justify-center gap-1.5"
                    >
                        <RotateCcw size={12} />
                        Refresh
                    </button>
                </div>
            </div>
        </div>
    );
}

function EmptyState({ icon, text }) {
    return (
        <div
            className="flex flex-col items-center justify-center
                    h-40 text-[#626f86] text-center"
        >
            {icon}
            <p className="text-xs mt-3">{text}</p>
        </div>
    );
}
