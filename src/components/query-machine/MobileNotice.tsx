"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy, Laptop, Monitor, Smartphone, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@/lib/useMediaQuery";

import { useTranslation } from "@/lib/i18n/useTranslation";

export function MobileNotice() {
  const isMobileOrTablet = useMediaQuery("(max-width: 1023px)");
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
      const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
      window.addEventListener("resize", handleResize);

      const saved = sessionStorage.getItem("sqlviz_mobile_notice_dismissed");
      if (saved === "true") {
        setDismissed(true);
      }
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("sqlviz_mobile_notice_dismissed", "true");
    }
  };

  const handleReopen = () => {
    setDismissed(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("sqlviz_mobile_notice_dismissed");
    }
  };

  const handleCopy = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // fallback
    }
  };

  if (!isMobileOrTablet) return null;

  return (
    <>
      {/* Floating pill when dismissed so user always knows and can re-open */}
      {dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-14 left-1/2 z-40 -translate-x-1/2"
        >
          <button
            type="button"
            onClick={handleReopen}
            className="flex items-center gap-2 rounded-full border border-warn/40 bg-panel/95 px-3 py-1 font-mono text-[11px] font-bold text-warn shadow-lg backdrop-blur-md transition-transform hover:scale-105"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>{t.mobileNotice.pill}</span>
          </button>
        </motion.div>
      )}

      {/* Main Full-Screen Overlay Modal */}
      <AnimatePresence>
        {!dismissed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-bg/85 p-4 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.92, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 16, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-accent/40 bg-panel p-6 shadow-2xl sm:p-7"
            >
              {/* Subtle Ambient Radial Glow */}
              <div
                className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-accent/20 blur-3xl"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-flow/20 blur-3xl"
                aria-hidden="true"
              />

              {/* Close / Dismiss Button */}
              <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-4 right-4 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-panel-2 hover:text-text"
                title="Dismiss and preview anyway"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Visual Devices Graphic */}
              <div className="relative mb-5 flex items-center justify-center gap-3 pt-2">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/40 bg-accent/10 shadow-[0_0_20px_-3px_rgba(56,189,248,0.25)]">
                  <Monitor className="h-7 w-7 text-accent" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-ok text-[9px] font-bold text-black">
                    ✓
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="h-[2px] w-6 bg-border" />
                  <span className="font-mono text-[9px] font-bold text-text-muted uppercase">VS</span>
                  <div className="h-[2px] w-6 bg-border" />
                </div>

                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-warn/40 bg-warn/10">
                  <Smartphone className="h-7 w-7 text-warn" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-warn text-[8px] font-bold text-black">
                    ⏳
                  </span>
                </div>
              </div>

              {/* Status Pill */}
              <div className="mb-3 flex justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-warn/40 bg-warn/10 px-3 py-1 font-mono text-[10px] font-bold text-warn tracking-wide uppercase">
                  <Sparkles className="h-3 w-3" />
                  {t.mobileNotice.badge}
                </span>
              </div>

              {/* Heading */}
              <h2 className="text-center text-lg font-bold tracking-tight text-text sm:text-xl">
                {t.mobileNotice.title}
              </h2>

              {/* Friendly message */}
              <p className="mt-2 text-center text-[12px] leading-relaxed text-text-muted">
                {t.mobileNotice.desc1}
              </p>
              <p className="mt-1 text-center text-[11.5px] leading-relaxed text-text-muted">
                {t.mobileNotice.desc2}
              </p>

              {/* Feature Highlights Grid */}
              <div className="mt-4 rounded-xl border border-border bg-panel-2 p-3 text-left">
                <div className="flex items-center gap-2.5 text-[11.5px] text-text">
                  <Laptop className="h-4 w-4 flex-none text-accent" />
                  <span>
                    <strong className="font-semibold text-text">Best on Wide Screens:</strong> Query pipeline side-by-side dekhne ke liye minimum 1024px screen zaroori hai.
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between border-t border-border pt-2 font-mono text-[10px] text-text-muted">
                  <span>{t.mobileNotice.screenNotice} <b className="text-text font-bold">{dimensions.width}px × {dimensions.height}px</b></span>
                  <span className="text-ok font-semibold">{t.mobileNotice.recommendedWidth}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-mono text-[12px] font-bold text-accent-ink shadow-md transition-all hover:brightness-110 active:scale-[0.98]"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 stroke-[3]" />
                      {t.mobileNotice.linkCopied}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      {t.mobileNotice.copyLink}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full rounded-xl border border-border bg-panel py-2 text-center font-mono text-[11px] font-semibold text-text-muted transition-colors hover:bg-panel-2 hover:text-text"
                >
                  {t.mobileNotice.dismiss}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
