import { ResizableShell, SectionHeader } from "../ResizableShell";
import { CommandPanel } from "../CommandPanel";
import { PipelineHoodPanel } from "./filter/PipelineHoodPanel";
import { OutputPanel } from "../OutputPanel";

export function Level0View() {
  return (
    <ResizableShell
      layoutId="query-machine-layout-level0"
      command={
        <>
          <SectionHeader title="Command" hint="drag edges to resize" />
          <CommandPanel />
        </>
      }
      hood={<PipelineHoodPanel />}
      output={
        <>
          <SectionHeader title="Output" hint="updates live" />
          <OutputPanel />
        </>
      }
    />
  );
}
