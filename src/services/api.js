import axiosInstance from "./axios.js";

// Boards
export const getBoards = () => axiosInstance.get("/boards");
export const getBoardById = (id) => axiosInstance.get(`/boards/${id}`);
export const createBoard = (data) => axiosInstance.post("/boards", data);
export const updateBoard = (id, data) =>
    axiosInstance.put(`/boards/${id}`, data);
export const deleteBoard = (id) => axiosInstance.delete(`/boards/${id}`);

// Lists
export const createList = (boardId, data) =>
    axiosInstance.post(`/lists/${boardId}/lists`, data);
export const updateList = (id, data) => axiosInstance.put(`/lists/${id}`, data);
export const deleteList = (id) => axiosInstance.delete(`/lists/${id}`);
export const deleteListPermanently = (id) =>
    axiosInstance.delete(`/lists/${id}/permanent`);
export const moveList = (id, data) =>
    axiosInstance.put(`/lists/${id}/move`, data);

// Cards
export const createCard = (listId, data) =>
    axiosInstance.post(`/lists/${listId}/cards`, data);
export const getCardById = (id) => axiosInstance.get(`/cards/${id}`);
export const updateCard = (id, data) => axiosInstance.put(`/cards/${id}`, data);
export const deleteCard = (id) => axiosInstance.delete(`/cards/${id}`);
export const deleteCardPermanently = (id) =>
    axiosInstance.delete(`/cards/${id}/permanent`);
export const moveCard = (id, data) =>
    axiosInstance.put(`/cards/${id}/move`, data);

// Card Labels
export const addCardLabel = (cardId, data) =>
    axiosInstance.post(`/cards/${cardId}/labels`, data);
export const removeCardLabel = (cardId, labelId) =>
    axiosInstance.delete(`/cards/${cardId}/labels/${labelId}`);

// Card Members
export const assignMember = (cardId, data) =>
    axiosInstance.post(`/cards/${cardId}/members`, data);
export const removeMember = (cardId, memberId) =>
    axiosInstance.delete(`/cards/${cardId}/members/${memberId}`);

// Labels
export const getBoardLabels = (boardId) =>
    axiosInstance.get(`/boards/${boardId}/labels`);
export const createLabel = (boardId, data) =>
    axiosInstance.post(`/boards/${boardId}/labels`, data);
export const updateLabel = (id, data) =>
    axiosInstance.put(`/labels/${id}`, data);
export const deleteLabel = (id) => axiosInstance.delete(`/labels/${id}`);

// Members
export const getAllMembers = () => axiosInstance.get("/members");
export const getBoardMembers = (boardId) =>
    axiosInstance.get(`/boards/${boardId}/members`);
export const addBoardMember = (boardId, data) =>
    axiosInstance.post(`/boards/${boardId}/members`, data);

// Checklists
export const createChecklist = (cardId, data) =>
    axiosInstance.post(`/cards/${cardId}/checklists`, data);
export const updateChecklist = (id, data) =>
    axiosInstance.put(`/checklists/${id}`, data);
export const deleteChecklist = (id) =>
    axiosInstance.delete(`/checklists/${id}`);
export const addChecklistItem = (checklistId, data) =>
    axiosInstance.post(`/checklists/${checklistId}/items`, data);
export const updateChecklistItem = (id, data) =>
    axiosInstance.put(`/checklists/items/${id}`, data);
export const deleteChecklistItem = (id) =>
    axiosInstance.delete(`/checklists/items/${id}`);

// Comments
export const getComments = (cardId) =>
    axiosInstance.get(`/cards/${cardId}/comments`);
export const addComment = (cardId, data) =>
    axiosInstance.post(`/cards/${cardId}/comments`, data);
export const updateComment = (id, data) =>
    axiosInstance.put(`/comments/${id}`, data);
export const deleteComment = (id) => axiosInstance.delete(`/comments/${id}`);

// Attachments
export const uploadAttachment = (cardId, formData) =>
    axiosInstance.post(`/cards/${cardId}/attachments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
export const deleteAttachment = (id) =>
    axiosInstance.delete(`/attachments/${id}`);

// Search
export const searchCards = (boardId, params) =>
    axiosInstance.get(`/boards/${boardId}/search`, { params });

// Archive
export const getArchivedLists = (boardId) =>
    axiosInstance.get(`/boards/${boardId}/archived-lists`);
export const getArchivedCards = (boardId) =>
    axiosInstance.get(`/boards/${boardId}/archived-cards`);
export const restoreList = (id) => axiosInstance.put(`/lists/${id}/restore`);
export const restoreCard = (id) => axiosInstance.put(`/cards/${id}/restore`);
