import { forwardRef } from "react";

const Input = forwardRef(({ label, error, className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1">
        {label && (
            <label className="text-xs font-semibold text-[#44546f] uppercase tracking-wide">
                {label}
            </label>
        )}
        <input
            ref={ref}
            className={`w-full px-3 py-2 text-sm bg-white border-2 rounded-lg
                  border-[#dfe1e6] focus:border-[#0052CC] focus:outline-none
                  placeholder:text-[#8590a2] transition-colors ${className}`}
            {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
));

Input.displayName = "Input";
export default Input;
