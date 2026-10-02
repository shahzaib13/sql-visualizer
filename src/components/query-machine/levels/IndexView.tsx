import { ResizableShell, SectionHeader } from "../ResizableShell";
import { IndexCommandPanel } from "./index/IndexCommandPanel";
import { IndexHoodPanel } from "./index/IndexHoodPanel";
import { IndexOutputPanel } from "./index/IndexOutputPanel";

export function IndexView() {
  return (
    <ResizableShell
      layoutId="query-machine-layout-index"
      command={
        <>
          <SectionHeader title="Command" hint="drag edges to resize" />
          <IndexCommandPanel />
        </>
      }
      hood={<IndexHoodPanel />}
      output={
        <>
          <SectionHeader title="Output" hint="updates live" />
          <IndexOutputPanel />
        </>
      }
    />
  );
}
