import {
    useSortable,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import ListHeader from "./ListHeader.jsx";
import AddCardButton from "../card/AddCardButton.jsx";
import CardItem from "../card/CardItem.jsx";

export default function ListColumn({ list, filteredCardIds }) {
    const {
        attributes,
        listeners,
        setNodeRef: setSortableRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: list.id,
        data: { type: "list" },
        transition: {
            duration: 220,
            easing: "cubic-bezier(0.2, 0, 0, 1)",
        },
    });

    // Also make this a droppable so cards can be dropped
    // onto the list itself (not just onto other cards)
    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
        id: `droppable-${list.id}`,
        data: { type: "list", listId: list.id },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const visibleCards = filteredCardIds
        ? list.cards.filter((c) => filteredCardIds.has(c.id))
        : list.cards;

    const cardIds = visibleCards.map((c) => c.id);

    // Combine refs
    const setRef = (node) => {
        setSortableRef(node);
        setDroppableRef(node);
    };

    return (
        <div
            ref={setRef}
            style={style}
            className={`flex-shrink-0 w-64 flex flex-col rounded-xl
                  bg-[#f1f2f4] max-h-full transition-all duration-150
                  ${isDragging ? "opacity-40 shadow-2xl scale-95" : ""}
                  ${
                      isOver && !isDragging
                          ? "ring-2 ring-[#0052CC] ring-offset-2"
                          : ""
                  }`}
        >
            {/* Drag handle on header only */}
            <ListHeader
                list={list}
                dragHandleProps={{ ...attributes, ...listeners }}
            />

            {/* Cards sortable area */}
            <SortableContext
                items={cardIds}
                strategy={verticalListSortingStrategy}
            >
                <div
                    className={`px-2 flex flex-col gap-2
                      overflow-y-auto overflow-x-hidden flex-1
                      max-h-[calc(100vh-260px)]
                      transition-colors duration-150
                      ${
                          isOver && visibleCards.length === 0
                              ? "min-h-[80px] bg-[#e8edf2] rounded-lg"
                              : "min-h-[8px]"
                      }`}
                >
                    {visibleCards.map((card) => (
                        <CardItem key={card.id} card={card} />
                    ))}

                    {/* Drop indicator for empty lists */}
                    {visibleCards.length === 0 && (
                        <div
                            className={`rounded-xl border-2 border-dashed
                          transition-all duration-150 flex items-center
                          justify-center text-xs
                          ${
                              isOver
                                  ? "border-[#0052CC] bg-blue-50 h-16 text-[#0052CC]"
                                  : "border-[#c1c7d0] h-8 text-transparent"
                          }`}
                        >
                            {isOver ? "Drop here" : ""}
                        </div>
                    )}
                </div>
            </SortableContext>

            {/* Add card - always at bottom */}
            <div className="px-2 pb-2 pt-1 flex-shrink-0">
                <AddCardButton listId={list.id} />
            </div>
        </div>
    );
}
