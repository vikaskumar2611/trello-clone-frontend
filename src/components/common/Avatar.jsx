export default function Avatar({ member, size = "md", className = "" }) {
    const sizes = {
        xs: "w-5 h-5 text-[9px]",
        sm: "w-6 h-6 text-[10px]",
        md: "w-8 h-8 text-xs",
        lg: "w-10 h-10 text-sm",
    };

    const initials = member?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    if (member?.avatar_url) {
        return (
            <img
                src={member.avatar_url}
                alt={member.name}
                title={member.name}
                className={`${sizes[size]} rounded-full object-cover ${className}`}
            />
        );
    }

    return (
        <div
            title={member?.name}
            className={`${sizes[size]} rounded-full flex items-center justify-center
                  font-bold text-white flex-shrink-0 ${className}`}
            style={{ backgroundColor: member?.color || "#0052CC" }}
        >
            {initials}
        </div>
    );
}
