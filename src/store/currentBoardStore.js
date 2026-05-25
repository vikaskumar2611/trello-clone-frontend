import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import * as api from "../services/api.js";
import { getPositionBetween } from "../utils/position.js";

export const useCurrentBoardStore = create(
    immer((set, get) => ({
        board: null,
        members: [],
        labels: [],
        isLoading: false,
        error: null,

        // Fetch
        fetchBoard: async (boardId) => {
            set((s) => {
                s.isLoading = true;
                s.error = null;
            });
            try {
                const res = await api.getBoardById(boardId);
                const { lists, members, labels, ...board } = res.data.data;
                set((s) => {
                    s.board = { ...board, lists };
                    s.members = members;
                    s.labels = labels;
                    s.isLoading = false;
                });
            } catch (err) {
                set((s) => {
                    s.error = err.message;
                    s.isLoading = false;
                });
            }
        },

        // Lists
        addList: (list) =>
            set((s) => {
                s.board.lists.push({ ...list, cards: [] });
            }),

        updateBoardInStore: (updates) =>
            set((s) => {
                if (s.board) Object.assign(s.board, updates);
            }),

        updateListInStore: (listId, updates) =>
            set((s) => {
                const list = s.board.lists.find((l) => l.id === listId);
                if (list) Object.assign(list, updates);
            }),

        removeList: (listId) =>
            set((s) => {
                s.board.lists = s.board.lists.filter((l) => l.id !== listId);
            }),

        // Cards
        addCard: (listId, card) =>
            set((s) => {
                const list = s.board.lists.find((l) => l.id === listId);
                if (list) list.cards.push(card);
            }),

        updateCardInStore: (cardId, updates) =>
            set((s) => {
                for (const list of s.board.lists) {
                    const card = list.cards.find((c) => c.id === cardId);
                    if (card) {
                        Object.assign(card, updates);
                        break;
                    }
                }
            }),

        removeCard: (cardId) =>
            set((s) => {
                for (const list of s.board.lists) {
                    const idx = list.cards.findIndex((c) => c.id === cardId);
                    if (idx !== -1) {
                        list.cards.splice(idx, 1);
                        break;
                    }
                }
            }),

        // Drag & Drop
        // Called during drag for instant visual feedback
        moveCardLocal: (cardId, fromListId, toListId, newPosition) =>
            set((s) => {
                const fromList = s.board.lists.find((l) => l.id === fromListId);
                const toList = s.board.lists.find((l) => l.id === toListId);
                if (!fromList || !toList) return;

                const cardIdx = fromList.cards.findIndex(
                    (c) => c.id === cardId,
                );
                if (cardIdx === -1) return;

                // Remove from source
                const [card] = fromList.cards.splice(cardIdx, 1);

                // Update card metadata
                card.list_id = toListId;
                card.position = newPosition;

                if (fromListId === toListId) {
                    // Same list reorder - insert at correct sorted position
                    const insertAt = fromList.cards.findIndex(
                        (c) => c.position > newPosition,
                    );
                    if (insertAt === -1) fromList.cards.push(card);
                    else fromList.cards.splice(insertAt, 0, card);
                } else {
                    // Different list - insert at correct sorted position in dest
                    const insertAt = toList.cards.findIndex(
                        (c) => c.position > newPosition,
                    );
                    if (insertAt === -1) toList.cards.push(card);
                    else toList.cards.splice(insertAt, 0, card);
                }
            }),

        moveListLocal: (listId, newPosition) =>
            set((s) => {
                const list = s.board.lists.find((l) => l.id === listId);
                if (!list) return;
                list.position = newPosition;
                // Re-sort lists by position
                s.board.lists.sort((a, b) => a.position - b.position);
            }),

        // Labels
        addLabelToStore: (label) =>
            set((s) => {
                s.labels.push(label);
            }),

        addLabelToCard: (cardId, label) =>
            set((s) => {
                for (const list of s.board.lists) {
                    const card = list.cards.find((c) => c.id === cardId);
                    if (card) {
                        if (!card.labels) card.labels = [];
                        if (!card.labels.find((l) => l.id === label.id))
                            card.labels.push(label);
                        break;
                    }
                }
            }),

        removeLabelFromCard: (cardId, labelId) =>
            set((s) => {
                for (const list of s.board.lists) {
                    const card = list.cards.find((c) => c.id === cardId);
                    if (card) {
                        card.labels = card.labels.filter(
                            (l) => l.id !== labelId,
                        );
                        break;
                    }
                }
            }),

        // Members
        addBoardMember: (member) =>
            set((s) => {
                if (!s.members.find((m) => m.id === member.id)) {
                    s.members.push(member);
                }
            }),

        addMemberToCard: (cardId, member) =>
            set((s) => {
                for (const list of s.board.lists) {
                    const card = list.cards.find((c) => c.id === cardId);
                    if (card) {
                        if (!card.members) card.members = [];
                        if (!card.members.find((m) => m.id === member.id))
                            card.members.push(member);
                        break;
                    }
                }
            }),

        removeMemberFromCard: (cardId, memberId) =>
            set((s) => {
                for (const list of s.board.lists) {
                    const card = list.cards.find((c) => c.id === cardId);
                    if (card) {
                        card.members = card.members.filter(
                            (m) => m.id !== memberId,
                        );
                        break;
                    }
                }
            }),
    })),
);
