import { ResizableShell, SectionHeader } from "../ResizableShell";
import { GroupByCommandPanel } from "./group-by/GroupByCommandPanel";
import { GroupByHoodPanel } from "./group-by/GroupByHoodPanel";
import { GroupByOutputPanel } from "./group-by/GroupByOutputPanel";

export function GroupByView() {
  return (
    <ResizableShell
      layoutId="query-machine-layout-groupby"
      command={
        <>
          <SectionHeader title="Command" hint="drag edges to resize" />
          <GroupByCommandPanel />
        </>
      }
      hood={<GroupByHoodPanel />}
      output={
        <>
          <SectionHeader title="Output" hint="updates live" />
          <GroupByOutputPanel />
        </>
      }
    />
  );
}
