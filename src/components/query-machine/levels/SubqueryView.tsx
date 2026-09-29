import { ResizableShell, SectionHeader } from "../ResizableShell";
import { SubqueryCommandPanel } from "./subquery/SubqueryCommandPanel";
import { SubqueryHoodPanel } from "./subquery/SubqueryHoodPanel";
import { SubqueryOutputPanel } from "./subquery/SubqueryOutputPanel";

export function SubqueryView() {
  return (
    <ResizableShell
      layoutId="query-machine-layout-subquery"
      command={
        <>
          <SectionHeader title="Command" hint="drag edges to resize" />
          <SubqueryCommandPanel />
        </>
      }
      hood={<SubqueryHoodPanel />}
      output={
        <>
          <SectionHeader title="Output" hint="updates live" />
          <SubqueryOutputPanel />
        </>
      }
    />
  );
}
