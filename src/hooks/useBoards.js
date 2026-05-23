import { useEffect } from "react";
import { useBoardStore } from "../store/boardStore.js";

export const useBoards = () => {
    const { boards, isLoading, error, fetchBoards, addBoard, removeBoard } =
        useBoardStore();

    useEffect(() => {
        fetchBoards();
    }, []);

    return { boards, isLoading, error, fetchBoards, addBoard, removeBoard };
};
