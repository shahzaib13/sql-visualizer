import { ResizableShell, SectionHeader } from "../ResizableShell";
import { AggregatesCommandPanel } from "./aggregates/AggregatesCommandPanel";
import { AggregatesHoodPanel } from "./aggregates/AggregatesHoodPanel";
import { AggregatesOutputPanel } from "./aggregates/AggregatesOutputPanel";

export function AggregatesView() {
  return (
    <ResizableShell
      layoutId="query-machine-layout-aggregates"
      command={
        <>
          <SectionHeader title="Command" hint="drag edges to resize" />
          <AggregatesCommandPanel />
        </>
      }
      hood={<AggregatesHoodPanel />}
      output={
        <>
          <SectionHeader title="Output" hint="updates live" />
          <AggregatesOutputPanel />
        </>
      }
    />
  );
}
