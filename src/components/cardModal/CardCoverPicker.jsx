import { useState } from "react";
import { COVER_COLORS } from "../../utils/colorHelpers.js";
import * as api from "../../services/api.js";

export default function CardCoverPicker({ cardId, coverColor, onUpdate }) {
    const [loading, setLoading] = useState(null);

    const handleSelectColor = async (color) => {
        setLoading(color);
        try {
            const newColor = coverColor === color ? null : color;
            await api.updateCard(cardId, { cover_color: newColor });
            onUpdate({ cover_color: newColor });
        } catch {
        } finally {
            setLoading(null);
        }
    };

    return (
        <div>
            <p className="text-xs font-semibold text-[#44546f] uppercase tracking-wide mb-2">
                Colors
            </p>
            <div className="grid grid-cols-5 gap-1.5">
                {COVER_COLORS.map((color) => (
                    <button
                        key={color}
                        onClick={() => handleSelectColor(color)}
                        disabled={!!loading}
                        className={`h-8 rounded-lg transition-all hover:scale-105
                        ${
                            coverColor === color
                                ? "ring-2 ring-offset-1 ring-[#0052CC]"
                                : ""
                        }`}
                        style={{ backgroundColor: color }}
                    />
                ))}
            </div>
            {coverColor && (
                <button
                    onClick={() => handleSelectColor(coverColor)}
                    className="mt-2 w-full py-1.5 text-xs text-[#44546f]
                     bg-[#091e420f] hover:bg-[#091e4221]
                     rounded-lg transition-colors"
                >
                    Remove Cover
                </button>
            )}
        </div>
    );
}
