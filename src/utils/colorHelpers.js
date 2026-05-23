export const BOARD_BACKGROUNDS = [
    { type: "color", value: "#0079BF", label: "Blue" },
    { type: "color", value: "#D29034", label: "Orange" },
    { type: "color", value: "#519839", label: "Green" },
    { type: "color", value: "#B04632", label: "Red" },
    { type: "color", value: "#89609E", label: "Purple" },
    { type: "color", value: "#CD5A91", label: "Pink" },
    { type: "color", value: "#4BBF6B", label: "Lime" },
    { type: "color", value: "#00AECC", label: "Sky" },
    { type: "color", value: "#838C91", label: "Grey" },
];

export const LABEL_COLORS = [
    { hex: "#61BD4F", name: "Green" },
    { hex: "#F2D600", name: "Yellow" },
    { hex: "#FF9F1A", name: "Orange" },
    { hex: "#EB5A46", name: "Red" },
    { hex: "#C377E0", name: "Purple" },
    { hex: "#0079BF", name: "Blue" },
    { hex: "#00C2E0", name: "Sky" },
    { hex: "#51E898", name: "Lime" },
    { hex: "#FF78CB", name: "Pink" },
    { hex: "#344563", name: "Black" },
];

export const COVER_COLORS = [
    "#EB5A46",
    "#F2D600",
    "#61BD4F",
    "#0079BF",
    "#C377E0",
    "#FF9F1A",
    "#00C2E0",
    "#51E898",
    "#FF78CB",
    "#344563",
];

// Get readable text color based on background
export const getTextColor = (bgHex) => {
    if (!bgHex) return "#172b4d";
    const hex = bgHex.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.5 ? "#172b4d" : "#ffffff";
};
