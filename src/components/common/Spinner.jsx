export default function Spinner({ size = "md", light = false }) {
    const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
    const color = light
        ? "border-white/30 border-t-white"
        : "border-blue-200 border-t-blue-600";
    return (
        <div
            className={`${sizes[size]} border-4 ${color} rounded-full animate-spin`}
        />
    );
}
