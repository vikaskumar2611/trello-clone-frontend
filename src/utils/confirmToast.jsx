import toast from "react-hot-toast";

export const confirmToast = ({
    message,
    confirmText = "Delete",
    cancelText = "Cancel",
    onConfirm,
}) => {
    const id = toast.custom(
        (t) => (
            <div className={t.visible ? "animate-enter" : "animate-leave"}>
                <button
                    className="absolute inset-0 bg-black/40"
                    onClick={() => toast.dismiss(id)}
                    aria-label="Close"
                />
                <div
                    className="relative bg-white border border-gray-200 shadow-2xl
                        rounded-xl px-4 py-3 w-[320px] text-sm text-[#172b4d]"
                >
                    <div className="text-sm font-semibold">Confirm</div>
                    <div className="text-xs text-[#626f86] mt-1 leading-relaxed">
                        {message}
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-3">
                        <button
                            onClick={() => toast.dismiss(id)}
                            className="px-3 py-1.5 text-xs rounded-lg
                                bg-[#091e420f] hover:bg-[#091e4221]
                                text-[#172b4d] transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(id);
                                onConfirm?.();
                            }}
                            className="px-3 py-1.5 text-xs rounded-lg
                                bg-[#EB5A46] hover:bg-[#cf513d]
                                text-white transition-colors"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        ),
        {
            duration: Infinity,
            style: {
                position: "fixed",
                inset: 0,
                display: "grid",
                placeItems: "center",
                zIndex: 9999,
                pointerEvents: "auto",
            },
        },
    );

    return id;
};
