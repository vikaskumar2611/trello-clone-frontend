import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import * as api from "../services/api.js";

export const useBoardStore = create(
    immer((set) => ({
        boards: [],
        isLoading: false,
        error: null,

        fetchBoards: async () => {
            set((s) => {
                s.isLoading = true;
                s.error = null;
            });
            try {
                const res = await api.getBoards();
                set((s) => {
                    s.boards = res.data.data;
                    s.isLoading = false;
                });
            } catch (err) {
                set((s) => {
                    s.error = err.message;
                    s.isLoading = false;
                });
            }
        },

        addBoard: (board) =>
            set((s) => {
                s.boards.unshift(board);
            }),

        removeBoard: (id) =>
            set((s) => {
                s.boards = s.boards.filter((b) => b.id !== id);
            }),

        updateBoardInList: (id, updates) =>
            set((s) => {
                const idx = s.boards.findIndex((b) => b.id === id);
                if (idx !== -1) Object.assign(s.boards[idx], updates);
            }),
    })),
);
