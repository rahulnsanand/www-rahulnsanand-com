"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type FooterAccentContextValue = {
  text: string;
  setText: (text: string) => void;
};

const FooterAccentContext = createContext<FooterAccentContextValue | null>(null);

function useFooterAccentContext() {
  const context = useContext(FooterAccentContext);
  if (!context) {
    throw new Error("Footer accent components must be used inside FooterAccentProvider.");
  }

  return context;
}

export function FooterAccentProvider({ children }: { children: ReactNode }) {
  const [text, setText] = useState("");
  const value = useMemo(() => ({ text, setText }), [text]);

  return <FooterAccentContext.Provider value={value}>{children}</FooterAccentContext.Provider>;
}

export function FooterAccentText({ text }: { text: string }) {
  const { setText } = useFooterAccentContext();

  useEffect(() => {
    setText(text);

    return () => {
      setText("");
    };
  }, [setText, text]);

  return null;
}

export function SiteFooterAccent() {
  const { text } = useFooterAccentContext();
  const currentYear = new Date().getFullYear();

  return (
    <>
      {text ? (
        <div className="site-footer-accent-text" aria-hidden="true">
          {text}
        </div>
      ) : null}
      <p className="site-footer-meta">
        {`© ${currentYear} Rahul NS Anand · Website License · rahulnsanand.com`}
      </p>
    </>
  );
}
