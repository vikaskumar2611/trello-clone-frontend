export default function Badge({
    children,
    variant = "default",
    className = "",
}) {
    const variants = {
        default: "bg-[#091e420f] text-[#44546f]",
        overdue: "bg-[#FFEDEB] text-[#AE2A19]",
        "due-soon": "bg-[#FFF7D6] text-[#7F5F01]",
        completed: "bg-[#DCFFF1] text-[#216E4E]",
        upcoming: "bg-[#091e420f] text-[#44546f]",
    };

    return (
        <span
            className={`inline-flex items-center gap-1 px-2 py-0.5
                      text-xs font-medium rounded
                      ${variants[variant]} ${className}`}
        >
            {children}
        </span>
    );
}
