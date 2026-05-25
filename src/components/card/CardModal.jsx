import { useState, useEffect } from "react";
import {
    Tag,
    Users,
    CheckSquare,
    Calendar,
    Palette,
    Paperclip,
    Trash2,
    X,
} from "lucide-react";
import Modal from "../common/Modal.jsx";
import Avatar from "../common/Avatar.jsx";
import Spinner from "../common/Spinner.jsx";
import CardDescription from "../cardModal/CardDescription.jsx";
import CardChecklist from "../cardModal/CardChecklist.jsx";
import CardComments from "../cardModal/CardComments.jsx";
import CardLabelPicker from "../cardModal/CardLabelPicker.jsx";
import CardMemberPicker from "../cardModal/CardMemberPicker.jsx";
import CardDueDate from "../cardModal/CardDueDate.jsx";
import CardCoverPicker from "../cardModal/CardCoverPicker.jsx";
import CardAttachments from "../cardModal/CardAttachments.jsx";
import Badge from "../common/Badge.jsx";
import { getDueDateStatus, formatDueDate } from "../../utils/dateHelpers.js";
import { useCurrentBoardStore } from "../../store/currentBoardStore.js";
import * as api from "../../services/api.js";
import toast from "react-hot-toast";

const SIDEBAR_SECTIONS = {
    labels: { icon: Tag, label: "Labels" },
    members: { icon: Users, label: "Members" },
    due: { icon: Calendar, label: "Due Date" },
    check: { icon: CheckSquare, label: "Checklist" },
    cover: { icon: Palette, label: "Cover" },
    attach: { icon: Paperclip, label: "Attachment" },
};

export default function CardModal({ cardId, onClose }) {
    const [card, setCard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSection, setActiveSection] = useState(null);
    const [editingTitle, setEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState("");

    const { updateCardInStore, removeCard } = useCurrentBoardStore();

    const getChecklistProgress = (checklists = []) => {
        let total = 0;
        let completed = 0;
        for (const checklist of checklists) {
            total += checklist.items.length;
            completed += checklist.items.filter((i) => i.is_completed).length;
        }
        return { total, completed };
    };

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.getCardById(cardId);
                setCard(res.data.data);
                setTitleValue(res.data.data.title);
            } catch {
                toast.error("Could not load card");
                onClose();
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [cardId]);

    const handleTitleSave = async () => {
        if (!titleValue.trim() || titleValue === card.title) {
            setTitleValue(card.title);
            setEditingTitle(false);
            return;
        }
        try {
            await api.updateCard(cardId, { title: titleValue.trim() });
            setCard((c) => ({ ...c, title: titleValue.trim() }));
            updateCardInStore(cardId, { title: titleValue.trim() });
            setEditingTitle(false);
        } catch {}
    };

    const handleArchive = async () => {
        if (!confirm("Archive this card?")) return;
        try {
            await api.deleteCard(cardId);
            removeCard(cardId);
            toast.success("Card archived");
            onClose();
        } catch {}
    };

    const handleAddChecklist = async () => {
        try {
            const res = await api.createChecklist(cardId, {
                title: "Checklist",
            });
            setCard((c) => {
                const updatedChecklists = [...c.checklists, res.data.data];
                updateCardInStore(cardId, {
                    checklist_progress: getChecklistProgress(updatedChecklists),
                });
                return {
                    ...c,
                    checklists: updatedChecklists,
                };
            });
        } catch {}
        setActiveSection(null);
    };

    if (isLoading) {
        return (
            <Modal isOpen onClose={onClose}>
                <div className="flex items-center justify-center h-48">
                    <Spinner size="lg" />
                </div>
            </Modal>
        );
    }

    if (!card) return null;

    const dueDateStatus = getDueDateStatus(card.due_date, card.due_completed);

    return (
        <Modal isOpen onClose={onClose} maxWidth="max-w-2xl">
            {/* Cover */}
            {(card.cover_color || card.cover_image) && (
                <div
                    className="w-full h-10 rounded-t-xl flex-shrink-0"
                    style={{
                        backgroundColor: card.cover_color || undefined,
                        backgroundImage: card.cover_image
                            ? `url(${card.cover_image})`
                            : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />
            )}

            <div className="p-5 pt-4">
                {/* Title */}
                <div className="flex gap-3 mb-4">
                    <div className="flex-shrink-0 mt-1">
                        <div className="w-4 h-4 border-2 border-[#8590a2] rounded" />
                    </div>
                    <div className="flex-1 min-w-0">
                        {editingTitle ? (
                            <textarea
                                value={titleValue}
                                onChange={(e) => setTitleValue(e.target.value)}
                                onBlur={handleTitleSave}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleTitleSave();
                                    }
                                    if (e.key === "Escape") {
                                        setTitleValue(card.title);
                                        setEditingTitle(false);
                                    }
                                }}
                                autoFocus
                                rows={2}
                                className="w-full text-lg font-semibold text-[#172b4d] bg-white
                           border-2 border-[#0052CC] rounded-xl px-3 py-1.5
                           focus:outline-none resize-none"
                            />
                        ) : (
                            <h2
                                onClick={() => setEditingTitle(true)}
                                className="text-lg font-semibold text-[#172b4d] leading-snug
                           cursor-text hover:bg-[#091e420f] rounded-xl
                           px-3 py-1.5 -mx-3 transition-colors"
                            >
                                {card.title}
                            </h2>
                        )}
                        <p className="text-xs text-[#626f86] mt-1 px-3 -mx-3">
                            in list{" "}
                            <span className="font-medium">
                                {card.list_title}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Meta row - labels, members, due date chips */}
                {(card.labels?.length > 0 ||
                    card.members?.length > 0 ||
                    card.due_date) && (
                    <div className="flex flex-wrap gap-4 mb-5 ml-7">
                        {card.labels?.length > 0 && (
                            <div>
                                <p className="text-[10px] font-semibold text-[#44546f] uppercase mb-1.5">
                                    Labels
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {card.labels.map((l) => (
                                        <span
                                            key={l.id}
                                            className="px-3 py-1 rounded text-xs font-semibold text-white"
                                            style={{ backgroundColor: l.color }}
                                        >
                                            {l.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {card.members?.length > 0 && (
                            <div>
                                <p className="text-[10px] font-semibold text-[#44546f] uppercase mb-1.5">
                                    Members
                                </p>
                                <div className="flex gap-1">
                                    {card.members.map((m) => (
                                        <Avatar
                                            key={m.id}
                                            member={m}
                                            size="md"
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {card.due_date && (
                            <div>
                                <p className="text-[10px] font-semibold text-[#44546f] uppercase mb-1.5">
                                    Due Date
                                </p>
                                <div
                                    className="flex items-center gap-1.5 cursor-pointer"
                                    onClick={() => setActiveSection("due")}
                                >
                                    <input
                                        type="checkbox"
                                        checked={card.due_completed}
                                        onChange={async (e) => {
                                            e.stopPropagation();
                                            await api.updateCard(cardId, {
                                                due_completed:
                                                    !card.due_completed,
                                            });
                                            const updated = {
                                                due_completed:
                                                    !card.due_completed,
                                            };
                                            setCard((c) => ({
                                                ...c,
                                                ...updated,
                                            }));
                                            updateCardInStore(cardId, updated);
                                        }}
                                        className="w-3.5 h-3.5 accent-[#0052CC] cursor-pointer"
                                    />
                                    <Badge variant={dueDateStatus}>
                                        {formatDueDate(card.due_date)}
                                    </Badge>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Main body + sidebar */}
                <div className="flex gap-4">
                    {/* Left - main content */}
                    <div className="flex-1 min-w-0 space-y-5">
                        <CardDescription
                            cardId={cardId}
                            description={card.description}
                            onUpdate={(desc) =>
                                setCard((c) => ({ ...c, description: desc }))
                            }
                        />

                        {card.checklists?.length > 0 && (
                            <CardChecklist
                                cardId={cardId}
                                checklists={card.checklists}
                                onUpdate={(updated) => {
                                    setCard((c) => ({
                                        ...c,
                                        checklists: updated,
                                    }));
                                    updateCardInStore(cardId, {
                                        checklist_progress:
                                            getChecklistProgress(updated),
                                    });
                                }}
                            />
                        )}

                        {card.attachments?.length > 0 && (
                            <CardAttachments
                                cardId={cardId}
                                attachments={card.attachments}
                                onUpdate={(updated) =>
                                    setCard((c) => ({
                                        ...c,
                                        attachments: updated,
                                    }))
                                }
                            />
                        )}

                        <CardComments
                            cardId={cardId}
                            comments={card.comments || []}
                            onUpdate={(updated) =>
                                setCard((c) => ({ ...c, comments: updated }))
                            }
                        />
                    </div>

                    {/* Right sidebar */}
                    <div className="relative w-36 flex-shrink-0 space-y-1">
                        <p className="text-[10px] font-semibold text-[#44546f] uppercase mb-2">
                            Add to card
                        </p>

                        {Object.entries(SIDEBAR_SECTIONS).map(
                            ([key, { icon: Icon, label }]) => (
                                <button
                                    key={key}
                                    onClick={() =>
                                        key === "check"
                                            ? handleAddChecklist()
                                            : setActiveSection(
                                                  activeSection === key
                                                      ? null
                                                      : key,
                                              )
                                    }
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs
                            font-medium rounded-lg transition-colors text-left
                            ${
                                activeSection === key
                                    ? "bg-[#091e4221] text-[#172b4d]"
                                    : "bg-[#091e420f] hover:bg-[#091e4221] text-[#44546f]"
                            }`}
                                >
                                    <Icon size={13} />
                                    {label}
                                </button>
                            ),
                        )}

                        <div className="pt-2">
                            <p className="text-[10px] font-semibold text-[#44546f] uppercase mb-2">
                                Actions
                            </p>
                            <button
                                onClick={handleArchive}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs
                           font-medium rounded-lg bg-[#091e420f]
                           hover:bg-red-50 hover:text-red-600
                           text-[#44546f] transition-colors"
                            >
                                <Trash2 size={13} /> Archive
                            </button>
                        </div>

                        {/* Active section panel */}
                        {activeSection && (
                            <div
                                className="p-3 bg-white rounded-xl border border-gray-200
                                                            shadow-lg w-64 absolute top-0 right-full mr-3
                                                            max-h-[70vh] overflow-y-auto"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-[#172b4d]">
                                        {SIDEBAR_SECTIONS[activeSection]?.label}
                                    </span>
                                    <button
                                        onClick={() => setActiveSection(null)}
                                        className="p-0.5 hover:bg-gray-100 rounded"
                                    >
                                        <X
                                            size={13}
                                            className="text-[#626f86]"
                                        />
                                    </button>
                                </div>

                                {activeSection === "labels" && (
                                    <CardLabelPicker
                                        cardId={cardId}
                                        cardLabels={card.labels || []}
                                        onUpdate={(updated) => {
                                            setCard((c) => ({
                                                ...c,
                                                labels: updated,
                                            }));
                                            updateCardInStore(cardId, {
                                                labels: updated,
                                            });
                                        }}
                                    />
                                )}

                                {activeSection === "members" && (
                                    <CardMemberPicker
                                        cardId={cardId}
                                        cardMembers={card.members || []}
                                        onUpdate={(updated) => {
                                            setCard((c) => ({
                                                ...c,
                                                members: updated,
                                            }));
                                            updateCardInStore(cardId, {
                                                members: updated,
                                            });
                                        }}
                                    />
                                )}

                                {activeSection === "due" && (
                                    <CardDueDate
                                        cardId={cardId}
                                        dueDate={card.due_date}
                                        dueCompleted={card.due_completed}
                                        onUpdate={(updated) => {
                                            setCard((c) => ({
                                                ...c,
                                                ...updated,
                                            }));
                                            updateCardInStore(cardId, updated);
                                        }}
                                    />
                                )}

                                {activeSection === "cover" && (
                                    <CardCoverPicker
                                        cardId={cardId}
                                        coverColor={card.cover_color}
                                        onUpdate={(updated) => {
                                            setCard((c) => ({
                                                ...c,
                                                ...updated,
                                            }));
                                            updateCardInStore(cardId, updated);
                                        }}
                                    />
                                )}

                                {activeSection === "attach" && (
                                    <CardAttachments
                                        cardId={cardId}
                                        attachments={card.attachments || []}
                                        onUpdate={(updated) =>
                                            setCard((c) => ({
                                                ...c,
                                                attachments: updated,
                                            }))
                                        }
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
