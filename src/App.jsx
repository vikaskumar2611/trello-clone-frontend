import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import BoardPage from "./pages/BoardPage.jsx";

export default function App() {
    const [theme, setTheme] = useState(() => {
        if (typeof window === "undefined") return "light";
        const saved = localStorage.getItem("theme");
        if (saved === "light" || saved === "dark") return saved;
        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    });

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((current) => (current === "dark" ? "light" : "dark"));
    };

    return (
        <Routes>
            <Route
                path="/"
                element={<HomePage theme={theme} onToggleTheme={toggleTheme} />}
            />
            <Route
                path="/board/:boardId"
                element={
                    <BoardPage theme={theme} onToggleTheme={toggleTheme} />
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
