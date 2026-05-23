import { useState } from "react";
import { AlignLeft } from "lucide-react";
import Button from "../common/Button.jsx";
import * as api from "../../services/api.js";

export default function CardDescription({ cardId, description, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(description || "");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.updateCard(cardId, { description: value });
            onUpdate(value);
            setIsEditing(false);
        } catch {
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-2">
                <AlignLeft size={18} className="text-[#44546f] flex-shrink-0" />
                <h3 className="text-sm font-semibold text-[#172b4d]">
                    Description
                </h3>
            </div>

            <div className="ml-7">
                {isEditing ? (
                    <div>
                        <textarea
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="Add a more detailed description..."
                            rows={4}
                            autoFocus
                            className="w-full px-3 py-2 text-sm text-[#172b4d] bg-white
                         border-2 border-[#0052CC] rounded-xl focus:outline-none
                         resize-none"
                        />
                        <div className="flex gap-2 mt-2">
                            <Button
                                onClick={handleSave}
                                isLoading={loading}
                                size="sm"
                            >
                                Save
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setIsEditing(false);
                                    setValue(description || "");
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => setIsEditing(true)}
                        className={`min-h-[60px] px-3 py-2 rounded-xl text-sm cursor-text
                        hover:bg-[#091e420f] transition-colors
                        ${
                            description
                                ? "text-[#172b4d]"
                                : "text-[#8590a2] italic"
                        }`}
                    >
                        {description || "Add a more detailed description..."}
                    </div>
                )}
            </div>
        </div>
    );
}
