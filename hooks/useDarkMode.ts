"use client";

import { useEffect, useState } from "react";

export function useDarkMode(): [boolean, () => void] {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("theme");
        const dark = stored === "dark";
        setIsDark(dark);
        document.documentElement.classList.toggle("dark", dark);
    }, []);

    function toggle() {
        setIsDark((prev) => {
            const next = !prev;
            document.documentElement.classList.toggle("dark", next);
            localStorage.setItem("theme", next ? "dark" : "light");
            return next;
        });
    }

    return [isDark, toggle];
}
