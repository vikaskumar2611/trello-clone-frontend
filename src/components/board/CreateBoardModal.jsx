import { useState } from "react";
import Modal from "../common/Modal.jsx";
import Button from "../common/Button.jsx";
import Input from "../common/Input.jsx";
import { BOARD_BACKGROUNDS } from "../../utils/colorHelpers.js";
import { useBoardStore } from "../../store/boardStore.js";
import * as api from "../../services/api.js";
import toast from "react-hot-toast";

export default function CreateBoardModal({ isOpen, onClose }) {
    const [title, setTitle] = useState("");
    const [bg, setBg] = useState(BOARD_BACKGROUNDS[0].value);
    const [loading, setLoading] = useState(false);
    const addBoard = useBoardStore((s) => s.addBoard);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        setLoading(true);
        try {
            const res = await api.createBoard({
                title: title.trim(),
                background_color: bg,
            });
            addBoard(res.data.data);
            toast.success("Board created!");
            setTitle("");
            onClose();
        } catch {
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-sm">
            <div className="p-5">
                <h2 className="text-base font-semibold text-[#172b4d] mb-4 text-center">
                    Create Board
                </h2>

                {/* Preview */}
                <div
                    className="w-full h-24 rounded-xl mb-4 flex items-center
                     justify-center transition-colors"
                    style={{ backgroundColor: bg }}
                >
                    <span className="text-white font-bold text-sm opacity-80">
                        {title || "Board Title"}
                    </span>
                </div>

                {/* Background picker */}
                <p className="text-xs font-semibold text-[#44546f] mb-2">
                    Background
                </p>
                <div className="grid grid-cols-5 gap-2 mb-4">
                    {BOARD_BACKGROUNDS.map((b) => (
                        <button
                            key={b.value}
                            onClick={() => setBg(b.value)}
                            className={`h-8 rounded-lg transition-transform
                          hover:scale-110
                          ${bg === b.value ? "ring-2 ring-offset-1 ring-[#0052CC]" : ""}`}
                            style={{ backgroundColor: b.value }}
                        />
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <Input
                        label="Board Title"
                        placeholder="My awesome board"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoFocus
                    />
                    <Button
                        type="submit"
                        isLoading={loading}
                        disabled={!title.trim()}
                        className="w-full"
                    >
                        Create
                    </Button>
                </form>
            </div>
        </Modal>
    );
}
