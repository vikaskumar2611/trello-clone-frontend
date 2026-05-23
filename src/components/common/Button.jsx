import Spinner from "./Spinner.jsx";

export default function Button({
    children,
    onClick,
    variant = "primary",
    size = "md",
    isLoading = false,
    disabled = false,
    className = "",
    type = "button",
}) {
    const base =
        "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none";

    const variants = {
        primary: "bg-[#0052CC] hover:bg-[#0065FF] text-white",
        secondary: "bg-[#091e420f] hover:bg-[#091e4221] text-[#172b4d]",
        danger: "bg-[#EB5A46] hover:bg-[#cf513d] text-white",
        ghost: "bg-transparent hover:bg-[#091e420f] text-[#172b4d]",
        success: "bg-[#61BD4F] hover:bg-[#519839] text-white",
    };
    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-2.5 text-base",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`${base} ${variants[variant]} ${sizes[size]}
                  ${disabled || isLoading ? "opacity-60 cursor-not-allowed" : ""}
                  ${className}`}
        >
            {isLoading && <Spinner size="sm" light={variant === "primary"} />}
            {children}
        </button>
    );
}
