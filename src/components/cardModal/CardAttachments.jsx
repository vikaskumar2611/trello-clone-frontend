import { useState, useRef } from "react";
import { Paperclip, Trash2, ExternalLink } from "lucide-react";
import * as api from "../../services/api.js";
import toast from "react-hot-toast";

export default function CardAttachments({ cardId, attachments, onUpdate }) {
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("attachment", file);
        setUploading(true);

        try {
            const res = await api.uploadAttachment(cardId, formData);
            onUpdate([res.data.data, ...attachments]);
            toast.success("File uploaded");
        } catch {
        } finally {
            setUploading(false);
            fileRef.current.value = "";
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.deleteAttachment(id);
            onUpdate(attachments.filter((a) => a.id !== id));
            toast.success("Attachment removed");
        } catch {}
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return "";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div>
            <div className="flex items-center gap-3 mb-3">
                <Paperclip size={18} className="text-[#44546f] flex-shrink-0" />
                <h3 className="text-sm font-semibold text-[#172b4d] flex-1">
                    Attachments
                </h3>
                <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="px-3 py-1 text-xs bg-[#091e420f] hover:bg-[#091e4221]
                     text-[#44546f] rounded-lg transition-colors disabled:opacity-50"
                >
                    {uploading ? "Uploading..." : "+ Add"}
                </button>
                <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    onChange={handleUpload}
                />
            </div>

            <div className="ml-7 space-y-2">
                {attachments.map((att) => (
                    <div
                        key={att.id}
                        className="flex items-center gap-3 p-2 bg-white rounded-xl
                       border border-gray-100 group"
                    >
                        {/* File type icon / preview */}
                        <div
                            className="w-12 h-10 rounded-lg bg-[#091e420f] flex items-center
                            justify-center flex-shrink-0 overflow-hidden"
                        >
                            {att.mime_type?.startsWith("image/") ? (
                                <img
                                    src={att.file_url}
                                    alt={att.filename}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Paperclip
                                    size={16}
                                    className="text-[#626f86]"
                                />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#172b4d] truncate">
                                {att.filename}
                            </p>
                            <p className="text-[10px] text-[#8590a2]">
                                {formatFileSize(att.file_size)}
                            </p>
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <a
                                href={att.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-[#626f86] hover:text-[#0052CC]
                           hover:bg-[#091e420f] rounded-lg transition-colors"
                            >
                                <ExternalLink size={13} />
                            </a>
                            <button
                                onClick={() => handleDelete(att.id)}
                                className="p-1.5 text-[#626f86] hover:text-red-500
                           hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
