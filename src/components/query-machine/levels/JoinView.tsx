import { ResizableShell, SectionHeader } from "../ResizableShell";
import { JoinCommandPanel } from "./join/JoinCommandPanel";
import { JoinHoodPanel } from "./join/JoinHoodPanel";
import { JoinOutputPanel } from "./join/JoinOutputPanel";

export function JoinView() {
  return (
    <ResizableShell
      layoutId="query-machine-layout-join"
      command={
        <>
          <SectionHeader title="Command" hint="drag edges to resize" />
          <JoinCommandPanel />
        </>
      }
      hood={<JoinHoodPanel />}
      output={
        <>
          <SectionHeader title="Output" hint="updates live" />
          <JoinOutputPanel />
        </>
      }
    />
  );
}
