import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
    isOpen,
    onClose,
    children,
    maxWidth = "max-w-2xl",
}) {
    // Close on Escape key
    useEffect(() => {
        const handler = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    // Lock body scroll when modal open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center
                 bg-black/50 overflow-y-auto py-12 px-4"
            onClick={onClose}
        >
            <div
                className={`relative bg-[#f1f2f4] rounded-xl w-full ${maxWidth}
                    shadow-2xl my-auto`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 rounded-lg
                     hover:bg-black/10 text-gray-500 hover:text-gray-700
                     transition-colors z-10"
                >
                    <X size={18} />
                </button>
                {children}
            </div>
        </div>
    );
}
