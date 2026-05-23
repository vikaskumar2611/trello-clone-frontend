import { useState } from "react";
import { Check } from "lucide-react";
import Avatar from "../common/Avatar.jsx";
import * as api from "../../services/api.js";
import { useCurrentBoardStore } from "../../store/currentBoardStore.js";

export default function CardMemberPicker({ cardId, cardMembers, onUpdate }) {
    const members = useCurrentBoardStore((s) => s.members);
    const [loading, setLoading] = useState(null);

    const isAssigned = (memberId) => cardMembers.some((m) => m.id === memberId);

    const handleToggle = async (member) => {
        setLoading(member.id);
        try {
            if (isAssigned(member.id)) {
                await api.removeMember(cardId, member.id);
                onUpdate(cardMembers.filter((m) => m.id !== member.id));
            } else {
                await api.assignMember(cardId, { member_id: member.id });
                onUpdate([...cardMembers, member]);
            }
        } catch {
        } finally {
            setLoading(null);
        }
    };

    return (
        <div>
            <p className="text-xs font-semibold text-[#44546f] uppercase tracking-wide mb-2">
                Members
            </p>
            <div className="space-y-1">
                {members.map((member) => {
                    const assigned = isAssigned(member.id);
                    return (
                        <button
                            key={member.id}
                            onClick={() => handleToggle(member)}
                            disabled={loading === member.id}
                            className="w-full flex items-center gap-2 p-1.5 rounded-lg
                         hover:bg-[#091e420f] transition-colors"
                        >
                            <Avatar member={member} size="sm" />
                            <span className="flex-1 text-xs text-[#172b4d] text-left font-medium">
                                {member.name}
                            </span>
                            {assigned && (
                                <Check size={14} className="text-[#0052CC]" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
