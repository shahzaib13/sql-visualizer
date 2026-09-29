import { ResizableShell, SectionHeader } from "../ResizableShell";
import { HavingCommandPanel } from "./having/HavingCommandPanel";
import { HavingHoodPanel } from "./having/HavingHoodPanel";
import { HavingOutputPanel } from "./having/HavingOutputPanel";

export function HavingView() {
  return (
    <ResizableShell
      layoutId="query-machine-layout-having"
      command={
        <>
          <SectionHeader title="Command" hint="drag edges to resize" />
          <HavingCommandPanel />
        </>
      }
      hood={<HavingHoodPanel />}
      output={
        <>
          <SectionHeader title="Output" hint="updates live" />
          <HavingOutputPanel />
        </>
      }
    />
  );
}
