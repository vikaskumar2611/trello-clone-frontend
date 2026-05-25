import Modal from "./Modal.jsx";
import Button from "./Button.jsx";

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = "Delete",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    isLoading = false,
}) {
    return (
        <Modal isOpen={isOpen} onClose={onCancel} maxWidth="max-w-sm">
            <div className="p-5">
                <h3 className="text-sm font-semibold text-[#172b4d]">
                    {title}
                </h3>
                {message && (
                    <p className="text-xs text-[#626f86] mt-2 leading-relaxed">
                        {message}
                    </p>
                )}
                <div className="flex justify-end gap-2 mt-4">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={onConfirm}
                        isLoading={isLoading}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
