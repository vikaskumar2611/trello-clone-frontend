import { useState } from "react";
import { Tag, Plus, Check } from "lucide-react";
import * as api from "../../services/api.js";
import { useCurrentBoardStore } from "../../store/currentBoardStore.js";

export default function CardLabelPicker({ cardId, cardLabels, onUpdate }) {
    const labels = useCurrentBoardStore((s) => s.labels);
    const [loading, setLoading] = useState(null); // label id being toggled

    const isAttached = (labelId) => cardLabels.some((l) => l.id === labelId);

    const handleToggle = async (label) => {
        setLoading(label.id);
        try {
            if (isAttached(label.id)) {
                await api.removeCardLabel(cardId, label.id);
                onUpdate(cardLabels.filter((l) => l.id !== label.id));
            } else {
                await api.addCardLabel(cardId, { label_id: label.id });
                onUpdate([...cardLabels, label]);
            }
        } catch {
        } finally {
            setLoading(null);
        }
    };

    return (
        <div>
            <p className="text-xs font-semibold text-[#44546f] uppercase tracking-wide mb-2">
                Labels
            </p>
            <div className="space-y-1">
                {labels.map((label) => {
                    const attached = isAttached(label.id);
                    return (
                        <button
                            key={label.id}
                            onClick={() => handleToggle(label)}
                            disabled={loading === label.id}
                            className="w-full flex items-center gap-2 p-1.5 rounded-lg
                         hover:bg-[#091e420f] transition-colors"
                        >
                            <span
                                className="flex-1 h-7 rounded-lg flex items-center px-3 text-xs
                           font-semibold text-white"
                                style={{ backgroundColor: label.color }}
                            >
                                {label.name}
                            </span>
                            <div
                                className={`w-5 h-5 rounded border-2 flex items-center
                               justify-center flex-shrink-0 transition-colors
                               ${
                                   attached
                                       ? "bg-[#0052CC] border-[#0052CC]"
                                       : "border-[#8590a2]"
                               }`}
                            >
                                {attached && (
                                    <Check size={11} className="text-white" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
