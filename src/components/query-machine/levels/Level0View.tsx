import { ResizableShell, SectionHeader } from "../ResizableShell";
import { CommandPanel } from "../CommandPanel";
import { HoodPanel } from "../HoodPanel";
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
      hood={<HoodPanel />}
      output={
        <>
          <SectionHeader title="Output" hint="updates live" />
          <OutputPanel />
        </>
      }
    />
  );
}
