import { useEffect } from "react";
import { useCurrentBoardStore } from "../store/currentBoardStore.js";

export const useBoard = (boardId) => {
    const store = useCurrentBoardStore();

    useEffect(() => {
        if (boardId) store.fetchBoard(boardId);
    }, [boardId]);

    return store;
};
