import { ResizableShell, SectionHeader } from "../ResizableShell";
import { SetOpsCommandPanel } from "./set-ops/SetOpsCommandPanel";
import { SetOpsHoodPanel } from "./set-ops/SetOpsHoodPanel";
import { SetOpsOutputPanel } from "./set-ops/SetOpsOutputPanel";

export function SetOpsView() {
  return (
    <ResizableShell
      layoutId="query-machine-layout-setops"
      command={
        <>
          <SectionHeader title="Command" hint="drag edges to resize" />
          <SetOpsCommandPanel />
        </>
      }
      hood={<SetOpsHoodPanel />}
      output={
        <>
          <SectionHeader title="Output" hint="updates live" />
          <SetOpsOutputPanel />
        </>
      }
    />
  );
}
