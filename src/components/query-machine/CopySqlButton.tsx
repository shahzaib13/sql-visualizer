"use client";

import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopySqlButton({ sql }: { sql: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
    } catch {
      window.prompt("Copy this SQL query:", sql);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy executable SQL to clipboard"
      className="flex items-center gap-1 rounded-md border border-border bg-panel px-2 py-1 font-mono text-[10.5px] font-semibold text-text-muted hover:border-accent hover:text-text transition-colors shadow-xs"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-ok" />
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-ok">
            Copied!
          </motion.span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span>Copy SQL</span>
        </>
      )}
    </button>
  );
}
