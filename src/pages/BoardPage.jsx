import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import BoardHeader from "../components/board/BoardHeader.jsx";
import BoardContent from "../components/board/BoardContent.jsx";
import FilterBar from "../components/board/FilterBar.jsx";
import Spinner from "../components/common/Spinner.jsx";
import { useBoard } from "../hooks/useBoard.js";
import * as api from "../services/api.js";

export default function BoardPage({ theme, onToggleTheme }) {
    const { boardId } = useParams();
    const { board, members, labels, isLoading, error } = useBoard(boardId);

    const [filters, setFilters] = useState({
        q: "",
        labels: [],
        members: [],
        due: "",
    });
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    // Use a ref to cancel previous debounce timer
    const debounceTimer = useRef(null);

    useEffect(() => {
        const hasFilters =
            filters.q.trim() ||
            filters.labels.length ||
            filters.members.length ||
            filters.due;

        // If no filters at all - clear results immediately, no loading
        if (!hasFilters) {
            setSearchResults(null);
            setIsSearching(false);
            // Cancel any pending debounce
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            return;
        }

        // Show loading only when there ARE filters
        setIsSearching(true);

        // Clear previous timer
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(async () => {
            try {
                const params = {};
                if (filters.q.trim()) params.q = filters.q.trim();
                if (filters.labels.length)
                    params.labels = filters.labels.join(",");
                if (filters.members.length)
                    params.members = filters.members.join(",");
                if (filters.due) params.due = filters.due;

                const res = await api.searchCards(boardId, params);
                const ids = new Set(res.data.data.cards.map((c) => c.id));
                setSearchResults(ids);
            } catch {
                setSearchResults(null);
            } finally {
                setIsSearching(false);
            }
        }, 350);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [filters, boardId]);

    if (isLoading) {
        return (
            <div
                className="h-screen flex items-center justify-center"
                style={{ backgroundColor: "var(--ui-board-overlay)" }}
            >
                <Spinner size="lg" light />
            </div>
        );
    }

    if (error || !board) {
        return (
            <div
                className="h-screen flex flex-col items-center justify-center"
                style={{
                    backgroundColor: "var(--ui-surface)",
                    color: "var(--ui-ink)",
                }}
            >
                <p className="text-lg font-semibold mb-2">Board not found</p>
                <a
                    href="/"
                    className="text-sm hover:underline"
                    style={{ color: "var(--ui-primary)" }}
                >
                    Back to boards
                </a>
            </div>
        );
    }

    return (
        <div
            className="h-screen flex flex-col overflow-hidden relative"
            style={{
                backgroundColor: board.background_color || "#0079BF",
                backgroundImage: board.background_image
                    ? `url(${board.background_image})`
                    : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div
                className="pointer-events-none absolute inset-0"
                style={{ backgroundColor: "var(--ui-board-overlay)" }}
            />

            <div className="relative z-10 flex flex-col h-full">
                <BoardHeader
                    board={board}
                    members={members}
                    theme={theme}
                    onToggleTheme={onToggleTheme}
                />

                <FilterBar
                    boardId={boardId}
                    members={members}
                    labels={labels}
                    filters={filters}
                    onFilterChange={setFilters}
                />

                {/* Only show search status bar when actively filtering */}
                {(isSearching || searchResults !== null) && (
                    <div
                        className="px-4 py-1.5 bg-black/20 text-white text-xs
                        flex items-center gap-2 flex-shrink-0"
                    >
                        {isSearching ? (
                            <>
                                <Spinner size="sm" light />
                                <span>Searching...</span>
                            </>
                        ) : (
                            <span>
                                {searchResults?.size ?? 0} matching card
                                {searchResults?.size !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                )}

                <div className="flex-1 overflow-hidden">
                    <BoardContent
                        board={board}
                        filteredCardIds={searchResults}
                    />
                </div>
            </div>
        </div>
    );
}
