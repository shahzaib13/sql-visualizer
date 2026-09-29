"use client";

import { useEffect, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from "react-resizable-panels";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useQueryStore } from "@/store/useQueryStore";
import { CommandPanel } from "./CommandPanel";
import { HoodPanel } from "./HoodPanel";
import { OutputPanel } from "./OutputPanel";
import { TopBar } from "./TopBar";

function ResizeHandle() {
  return (
    <PanelResizeHandle className="group relative w-[7px] flex-none bg-border transition-colors data-[resize-handle-state=hover]:bg-accent/40 data-[resize-handle-state=drag]:bg-accent/60">
      <span className="pointer-events-none absolute top-1/2 left-1/2 h-8 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-text-muted opacity-30 transition-opacity group-hover:opacity-100 group-data-[resize-handle-state=drag]:bg-accent group-data-[resize-handle-state=drag]:opacity-100" />
    </PanelResizeHandle>
  );
}

function SectionHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-none items-center justify-between gap-2.5 border-b border-border px-4 py-2.5">
      <h2 className="text-[12.5px] font-bold tracking-wide text-text-muted uppercase">{title}</h2>
      <span className="text-[11px] text-text-muted">{hint}</span>
    </div>
  );
}

function DesktopLayout() {
  const hoodOpen = useQueryStore((s) => s.hoodOpen);
  const hoodPanelRef = useRef<ImperativePanelHandle>(null);

  useEffect(() => {
    const panel = hoodPanelRef.current;
    if (!panel) return;
    if (hoodOpen && panel.isCollapsed()) panel.expand();
    if (!hoodOpen && !panel.isCollapsed()) panel.collapse();
  }, [hoodOpen]);

  return (
    <PanelGroup direction="horizontal" className="h-full!" autoSaveId="query-machine-layout">
      <Panel defaultSize={28} minSize={22} maxSize={42} className="flex flex-col bg-panel">
        <SectionHeader title="Command" hint="drag edges to resize" />
        <CommandPanel />
      </Panel>

      <ResizeHandle />

      <Panel
        ref={hoodPanelRef}
        collapsible
        collapsedSize={0}
        minSize={0}
        defaultSize={40}
        className="bg-panel"
        onCollapse={() => useQueryStore.setState({ hoodOpen: false })}
        onExpand={() => useQueryStore.setState({ hoodOpen: true })}
      >
        <HoodPanel />
      </Panel>

      <ResizeHandle />

      <Panel defaultSize={32} minSize={22} maxSize={45} className="flex flex-col bg-panel">
        <SectionHeader title="Output" hint="updates live" />
        <OutputPanel />
      </Panel>
    </PanelGroup>
  );
}

function MobileLayout() {
  const hoodOpen = useQueryStore((s) => s.hoodOpen);

  return (
    <div className="scrollbar-thin flex h-full flex-col overflow-y-auto">
      <section className="flex max-h-[85vh] flex-col border-b border-border bg-panel">
        <SectionHeader title="Command" hint="" />
        <CommandPanel />
      </section>

      {hoodOpen && (
        <section className="flex max-h-[85vh] flex-col border-b border-border bg-panel">
          <HoodPanel />
        </section>
      )}

      <section className="flex max-h-[85vh] flex-col bg-panel">
        <SectionHeader title="Output" hint="" />
        <OutputPanel />
      </section>
    </div>
  );
}

export function QueryMachine() {
  const isDesktop = useMediaQuery("(min-width: 900px)");

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg text-text">
      <TopBar />
      <div className="min-h-0 flex-1">{isDesktop ? <DesktopLayout /> : <MobileLayout />}</div>
    </div>
  );
}
