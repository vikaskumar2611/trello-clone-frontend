import { useState } from "react";
import { Plus, Layout, Sun, Moon } from "lucide-react";
import BoardCard from "../components/board/BoardCard.jsx";
import CreateBoardModal from "../components/board/CreateBoardModal.jsx";
import Spinner from "../components/common/Spinner.jsx";
import { useBoards } from "../hooks/useBoards.js";

export default function HomePage({ theme, onToggleTheme }) {
    const { boards, isLoading } = useBoards();
    const [showCreate, setShowCreate] = useState(false);

    return (
        <div className="relative min-h-screen overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
                <div
                    className="absolute -top-24 -left-24 h-72 w-72 rounded-full blur-3xl opacity-70"
                    style={{ backgroundColor: "var(--ui-blob-1)" }}
                />
                <div
                    className="absolute top-1/3 -right-28 h-80 w-80 rounded-full blur-3xl opacity-60"
                    style={{ backgroundColor: "var(--ui-blob-2)" }}
                />
                <div
                    className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full blur-3xl opacity-60"
                    style={{ backgroundColor: "var(--ui-blob-3)" }}
                />
            </div>

            {/* Top Nav */}
            <nav
                className="relative z-10 h-14 flex items-center px-5 backdrop-blur-xl border-b"
                style={{
                    backgroundColor: "var(--ui-surface)",
                    borderColor: "var(--ui-surface-border)",
                    boxShadow: "var(--ui-soft-shadow)",
                }}
            >
                <div
                    className="flex items-center gap-2"
                    style={{ color: "var(--ui-ink)" }}
                >
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{
                            backgroundColor: "var(--ui-primary-strong)",
                            color: "var(--ui-on-primary)",
                        }}
                    >
                        <Layout size={18} />
                    </div>
                    <span className="font-semibold text-base tracking-tight">
                        Trello Studio
                    </span>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={onToggleTheme}
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{
                            backgroundColor: "var(--ui-surface-strong)",
                            color: "var(--ui-ink)",
                            border: "1px solid var(--ui-border)",
                        }}
                        aria-label="Toggle theme"
                    >
                        {theme === "dark" ? (
                            <Sun size={16} />
                        ) : (
                            <Moon size={16} />
                        )}
                    </button>
                </div>
            </nav>

            <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div
                        className="flex items-center gap-3"
                        style={{ color: "var(--ui-ink)" }}
                    >
                        <Layout size={18} />
                        <div>
                            <h2 className="font-semibold text-lg">
                                Your Boards
                            </h2>
                            <p
                                className="text-xs"
                                style={{ color: "var(--ui-muted)" }}
                            >
                                Pick up where you left off
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold
                       rounded-xl hover:-translate-y-0.5"
                        style={{
                            background:
                                "linear-gradient(120deg, var(--ui-primary-strong), var(--ui-primary))",
                            color: "var(--ui-on-primary)",
                            boxShadow: "var(--ui-shadow)",
                        }}
                    >
                        <Plus size={16} /> Create board
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <Spinner size="lg" />
                    </div>
                ) : boards.length === 0 ? (
                    <div
                        className="flex flex-col items-center justify-center h-60"
                        style={{ color: "var(--ui-muted)" }}
                    >
                        <Layout size={48} className="mb-4 opacity-30" />
                        <p className="text-base font-medium mb-1">
                            No boards yet
                        </p>
                        <p className="text-sm mb-4">
                            Create your first board to get started
                        </p>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl"
                            style={{
                                background:
                                    "linear-gradient(120deg, var(--ui-primary-strong), var(--ui-primary))",
                                color: "var(--ui-on-primary)",
                                boxShadow: "var(--ui-shadow)",
                            }}
                        >
                            <Plus size={16} /> Create board
                        </button>
                    </div>
                ) : (
                    <div
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4
                          lg:grid-cols-5 gap-4"
                    >
                        {boards.map((board) => (
                            <BoardCard key={board.id} board={board} />
                        ))}
                        {/* Create new board tile */}
                        <button
                            onClick={() => setShowCreate(true)}
                            className="h-28 rounded-2xl text-sm font-semibold flex flex-col items-center
                         justify-center gap-1 hover:-translate-y-1"
                            style={{
                                backgroundColor: "var(--ui-surface)",
                                border: "1px solid var(--ui-surface-border)",
                                color: "var(--ui-muted)",
                                boxShadow: "var(--ui-soft-shadow)",
                            }}
                        >
                            <Plus size={20} />
                            <span>Create new board</span>
                        </button>
                    </div>
                )}
            </main>

            <CreateBoardModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
            />
        </div>
    );
}
