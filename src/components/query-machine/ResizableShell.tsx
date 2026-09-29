"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from "react-resizable-panels";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useAppStore } from "@/store/useAppStore";

function ResizeHandle() {
  return (
    <PanelResizeHandle className="group relative w-[7px] flex-none bg-border transition-colors data-[resize-handle-state=hover]:bg-accent/40 data-[resize-handle-state=drag]:bg-accent/60">
      <span className="pointer-events-none absolute top-1/2 left-1/2 h-8 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-text-muted opacity-30 transition-opacity group-hover:opacity-100 group-data-[resize-handle-state=drag]:bg-accent group-data-[resize-handle-state=drag]:opacity-100" />
    </PanelResizeHandle>
  );
}

export function SectionHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-none items-center justify-between gap-2.5 border-b border-border px-4 py-2.5">
      <h2 className="text-[12.5px] font-bold tracking-wide text-text-muted uppercase">{title}</h2>
      <span className="text-[11px] text-text-muted">{hint}</span>
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
  const hoodOpen = useAppStore((s) => s.hoodOpen);
  const hoodPanelRef = useRef<ImperativePanelHandle>(null);

  useEffect(() => {
    const panel = hoodPanelRef.current;
    if (!panel) return;
    if (hoodOpen && panel.isCollapsed()) panel.expand();
    if (!hoodOpen && !panel.isCollapsed()) panel.collapse();
  }, [hoodOpen]);

  return (
    <PanelGroup direction="horizontal" className="h-full!" autoSaveId={layoutId}>
      <Panel defaultSize={28} minSize={22} maxSize={42} className="flex flex-col bg-panel">
        {command}
      </Panel>

      <ResizeHandle />

      <Panel
        ref={hoodPanelRef}
        collapsible
        collapsedSize={0}
        minSize={0}
        defaultSize={40}
        className="bg-panel"
        onCollapse={() => useAppStore.setState({ hoodOpen: false })}
        onExpand={() => useAppStore.setState({ hoodOpen: true })}
      >
        {hood}
      </Panel>

      <ResizeHandle />

      <Panel defaultSize={32} minSize={22} maxSize={45} className="flex flex-col bg-panel">
        {output}
      </Panel>
    </PanelGroup>
  );
}

function MobileShell({ command, hood, output }: ResizableShellProps) {
  const hoodOpen = useAppStore((s) => s.hoodOpen);

  return (
    <div className="scrollbar-thin flex h-full flex-col overflow-y-auto">
      <section className="flex max-h-[85vh] flex-col border-b border-border bg-panel">{command}</section>
      {hoodOpen && (
        <section className="flex max-h-[85vh] flex-col border-b border-border bg-panel">{hood}</section>
      )}
      <section className="flex max-h-[85vh] flex-col bg-panel">{output}</section>
    </div>
  );
}

export function ResizableShell(props: ResizableShellProps) {
  const isDesktop = useMediaQuery("(min-width: 900px)");
  return isDesktop ? <DesktopShell {...props} /> : <MobileShell {...props} />;
}
