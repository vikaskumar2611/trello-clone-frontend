import { useState, useCallback, useRef } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    rectIntersection,
    closestCenter,
    pointerWithin,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import ListColumn from "../list/ListColumn.jsx";
import CardItem from "../card/CardItem.jsx";
import AddListButton from "../list/AddListButton.jsx";
import { getPositionBetween } from "../../utils/position.js";
import { useCurrentBoardStore } from "../../store/currentBoardStore.js";
import * as api from "../../services/api.js";

// Custom collision detection:
// - If dragging a LIST  -> use rectIntersection (better for horizontal)
// - If dragging a CARD  -> use closestCorners (better for vertical cards)
function customCollisionDetection(args) {
    const { active } = args;
    const activeType = active.data.current?.type;

    if (activeType === "list") {
        return rectIntersection(args);
    }

    // For cards: first check if pointer is within a list container
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
        return pointerCollisions;
    }

    // Fallback to closestCorners for cards
    return closestCorners(args);
}

export default function BoardContent({ board, filteredCardIds }) {
    const { moveCardLocal, moveListLocal } = useCurrentBoardStore();

    const [activeCard, setActiveCard] = useState(null);
    const [activeList, setActiveList] = useState(null);

    // Track the LIVE order of lists during drag
    // We need this because board.lists in store updates async
    const liveListOrder = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px movement before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    // Find which list a card belongs to (using live board state)
    const findListByCardId = useCallback(
        (cardId) =>
            board.lists.find((l) => l.cards.some((c) => c.id === cardId)),
        [board.lists],
    );

    const findListById = useCallback(
        (listId) => board.lists.find((l) => l.id === listId),
        [board.lists],
    );

    // ── Drag Start ─────────────────────────────────────────────
    const handleDragStart = ({ active }) => {
        const type = active.data.current?.type;

        if (type === "card") {
            const list = findListByCardId(active.id);
            const card = list?.cards.find((c) => c.id === active.id);
            setActiveCard(card || null);
            setActiveList(null);
        }

        if (type === "list") {
            const list = findListById(active.id);
            setActiveList(list || null);
            setActiveCard(null);
            // Initialize live order tracking
            liveListOrder.current = [...board.lists];
        }
    };

    // ── Drag Over ──────────────────────────────────────────────
    // This fires CONSTANTLY during drag - use it for visual feedback
    const handleDragOver = ({ active, over }) => {
        if (!over) return;

        const activeType = active.data.current?.type;

        // For list dragging - update live order for visual feedback
        if (activeType === "list") {
            const lists = liveListOrder.current || board.lists;
            const overIsAList = lists.some((l) => l.id === over.id);
            if (!overIsAList) return;

            const oldIdx = lists.findIndex((l) => l.id === active.id);
            const newIdx = lists.findIndex((l) => l.id === over.id);

            if (oldIdx !== newIdx) {
                liveListOrder.current = arrayMove([...lists], oldIdx, newIdx);
            }
            return;
        }

        // For card dragging across lists - move card visually
        if (activeType === "card") {
            const sourceList = findListByCardId(active.id);
            if (!sourceList) return;

            // Figure out destination list
            let destListId = null;

            // over could be a list itself
            if (findListById(over.id)) {
                destListId = over.id;
            } else {
                // over is a card - find which list it belongs to
                const overList = findListByCardId(over.id);
                if (overList) destListId = overList.id;
            }

            if (!destListId || destListId === sourceList.id) return;

            // Move card visually to new list immediately
            const destList = findListById(destListId);
            const destCards = destList?.cards || [];
            const overCardIdx = destCards.findIndex((c) => c.id === over.id);

            let newPos;
            if (overCardIdx === -1) {
                // Dropped on empty list or list header
                const lastCard = destCards[destCards.length - 1];
                newPos = getPositionBetween(lastCard?.position ?? null, null);
            } else {
                const prevCard = destCards[overCardIdx - 1];
                const thisCard = destCards[overCardIdx];
                newPos = getPositionBetween(
                    prevCard?.position ?? null,
                    thisCard?.position ?? null,
                );
            }

            moveCardLocal(active.id, sourceList.id, destListId, newPos);
        }
    };

    // ── Drag End ───────────────────────────────────────────────
    const handleDragEnd = async ({ active, over }) => {
        setActiveCard(null);
        setActiveList(null);

        if (!over) {
            liveListOrder.current = null;
            return;
        }

        const activeType = active.data.current?.type;

        // ── Finalize List Reorder ─────────────────────────────
        if (activeType === "list") {
            const finalOrder = liveListOrder.current || board.lists;
            liveListOrder.current = null;

            const oldIdx = board.lists.findIndex((l) => l.id === active.id);
            const newIdx = finalOrder.findIndex((l) => l.id === active.id);

            if (oldIdx === newIdx) return;

            // Calculate position based on neighbors in the FINAL order
            const prevList = finalOrder[newIdx - 1];
            const nextList = finalOrder[newIdx + 1];

            const newPos = getPositionBetween(
                prevList?.position ?? null,
                nextList?.position ?? null,
            );

            moveListLocal(active.id, newPos);

            try {
                await api.moveList(active.id, { position: newPos });
            } catch {
                // Will be corrected on next board fetch
            }
            return;
        }

        // ── Finalize Card Move ────────────────────────────────
        if (activeType === "card") {
            // Card has already been moved visually in onDragOver
            // Now we just need to persist the final position to the backend

            // Find where the card is NOW (after visual move)
            const currentList = findListByCardId(active.id);
            if (!currentList) return;

            const cardIdx = currentList.cards.findIndex(
                (c) => c.id === active.id,
            );
            const card = currentList.cards[cardIdx];
            const prevCard = currentList.cards[cardIdx - 1];
            const nextCard = currentList.cards[cardIdx + 1];

            // Recalculate clean position based on actual neighbors
            const newPos = getPositionBetween(
                prevCard?.position ?? null,
                nextCard?.position ?? null,
            );

            // Only update if position actually needs to change
            if (newPos !== card.position) {
                moveCardLocal(
                    active.id,
                    currentList.id,
                    currentList.id,
                    newPos,
                );
            }

            try {
                await api.moveCard(active.id, {
                    list_id: currentList.id,
                    position: newPos,
                });
            } catch {
                // Will be corrected on next board fetch
            }
        }
    };

    // ── Drag Cancel ────────────────────────────────────────────
    const handleDragCancel = () => {
        setActiveCard(null);
        setActiveList(null);
        liveListOrder.current = null;
    };

    const listIds = board.lists.map((l) => l.id);

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={customCollisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <SortableContext
                items={listIds}
                strategy={horizontalListSortingStrategy}
            >
                <div className="flex items-start gap-3 p-3 board-scroll h-full">
                    {board.lists.map((list) => (
                        <ListColumn
                            key={list.id}
                            list={list}
                            filteredCardIds={filteredCardIds}
                        />
                    ))}
                    <AddListButton boardId={board.id} />
                </div>
            </SortableContext>

            {/* Drag Overlay - what user sees while dragging */}
            {createPortal(
                <DragOverlay
                    dropAnimation={{
                        sideEffects: defaultDropAnimationSideEffects({
                            styles: { active: { opacity: "0.4" } },
                        }),
                    }}
                >
                    {activeCard && (
                        <div className="w-64 rotate-2 scale-105">
                            <CardItem card={activeCard} isDragOverlay />
                        </div>
                    )}
                    {activeList && (
                        <div
                            className="w-64 bg-[#f1f2f4] rounded-xl shadow-2xl
                         rotate-1 scale-105 opacity-95 p-2"
                        >
                            <div className="px-2 py-1.5">
                                <p className="text-sm font-semibold text-[#172b4d]">
                                    {activeList.title}
                                </p>
                                <p className="text-[10px] text-[#626f86] mt-0.5">
                                    {activeList.cards?.length ?? 0} cards
                                </p>
                            </div>
                            {/* Show first 3 cards as preview */}
                            <div className="px-2 space-y-1.5 mt-1">
                                {activeList.cards?.slice(0, 3).map((card) => (
                                    <div
                                        key={card.id}
                                        className="bg-white rounded-lg px-2.5 py-2
                               text-xs text-[#172b4d] shadow-sm"
                                    >
                                        {card.title}
                                    </div>
                                ))}
                                {activeList.cards?.length > 3 && (
                                    <p className="text-[10px] text-[#626f86] px-1">
                                        +{activeList.cards.length - 3} more
                                        cards
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </DragOverlay>,
                document.body,
            )}
        </DndContext>
    );
}
