"use client";

import { useState } from "react";

export default function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-95"
      style={{
        background: copied ? "var(--accent)" : "var(--border)",
        color: copied ? "white" : "var(--foreground)",
      }}
    >
      {copied ? "✓ Copié" : `Copier ${label}`}
    </button>
  );
}
