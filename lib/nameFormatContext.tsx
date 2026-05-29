"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { NameFormat } from "@/lib/formatName";

type NameFormatContextValue = [NameFormat, () => void];

const NameFormatContext = createContext<NameFormatContextValue>([
  "LF",
  () => {},
]);

export function NameFormatProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [format, setFormat] = useState<NameFormat>("LF");

  useEffect(() => {
    const stored = localStorage.getItem("nameFormat");
    if (stored === "FL") setFormat("FL");
  }, []);

  function toggle() {
    setFormat((prev) => {
      const next: NameFormat = prev === "FL" ? "LF" : "FL";
      localStorage.setItem("nameFormat", next);
      return next;
    });
  }

  return (
    <NameFormatContext.Provider value={[format, toggle]}>
      {children}
    </NameFormatContext.Provider>
  );
}

export function useNameFormat(): NameFormatContextValue {
  return useContext(NameFormatContext);
}
