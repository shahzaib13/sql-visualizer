"use client";

import type { ReactNode } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useMediaQuery } from "@/lib/useMediaQuery";

function ResizeHandle() {
  return (
    <PanelResizeHandle className="group relative w-[7px] flex-none bg-border transition-colors data-[resize-handle-state=hover]:bg-accent/40 data-[resize-handle-state=drag]:bg-accent/60">
      <span className="pointer-events-none absolute top-1/2 left-1/2 h-8 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-text-muted opacity-30 transition-opacity group-hover:opacity-100 group-data-[resize-handle-state=drag]:bg-accent group-data-[resize-handle-state=drag]:opacity-100" />
    </PanelResizeHandle>
  );
}

import { useTranslation } from "@/lib/i18n/useTranslation";

export function SectionHeader({ title, hint }: { title: string; hint: string }) {
  const { locale, t } = useTranslation();

  const localizedHint =
    locale === "ur"
      ? hint === "Tweaks & controls"
        ? t.headers.commandDeckHint
        : hint === "Visual execution pipeline"
          ? t.headers.underTheHoodHint
          : hint === "Live query output"
            ? t.headers.outputViewHint
            : hint
      : hint;

  return (
    <div className="flex flex-none items-center justify-between gap-2.5 border-b border-border px-4 py-2.5">
      <h2 className="text-[12.5px] font-bold tracking-wide text-text-muted uppercase">{title}</h2>
      <span className="text-[11px] text-text-muted">{localizedHint}</span>
    </div>
  );
}

interface ResizableShellProps {
  layoutId: string;
  command: ReactNode;
  hood: ReactNode;
  output: ReactNode;
}

function DesktopShell({ layoutId, command, hood, output }: ResizableShellProps) {
  return (
    <PanelGroup direction="horizontal" className="h-full!" autoSaveId={layoutId}>
      <Panel defaultSize={28} minSize={20} maxSize={42} className="flex flex-col min-h-0 overflow-hidden bg-panel">
        <div id="tour-command-panel" className="flex h-full flex-col min-h-0">
          {command}
        </div>
      </Panel>

      <ResizeHandle />

      <Panel defaultSize={42} minSize={25} maxSize={60} className="flex flex-col min-h-0 overflow-hidden bg-panel">
        <div id="tour-hood-panel" className="flex h-full flex-col min-h-0">
          {hood}
        </div>
      </Panel>

      <ResizeHandle />

      <Panel defaultSize={30} minSize={20} maxSize={45} className="flex flex-col min-h-0 overflow-hidden bg-panel">
        <div id="tour-output-panel" className="flex h-full flex-col min-h-0">
          {output}
        </div>
      </Panel>
    </PanelGroup>
  );
}

function MobileShell({ command, hood, output }: ResizableShellProps) {
  return (
    <div className="scrollbar-thin flex h-full flex-col overflow-y-auto">
      <section id="tour-command-panel-mobile" className="flex max-h-[85vh] flex-col border-b border-border bg-panel">{command}</section>
      <section id="tour-hood-panel-mobile" className="flex max-h-[85vh] flex-col border-b border-border bg-panel">{hood}</section>
      <section id="tour-output-panel-mobile" className="flex max-h-[85vh] flex-col bg-panel">{output}</section>
    </div>
  );
}

export function ResizableShell(props: ResizableShellProps) {
  const isDesktop = useMediaQuery("(min-width: 900px)");
  return isDesktop ? <DesktopShell {...props} /> : <MobileShell {...props} />;
}
