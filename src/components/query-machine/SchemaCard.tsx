import { KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SchemaColumn {
  name: string;
  type: string;
  pk?: boolean;
  fk?: boolean;
}

/**
 * A classic ER-diagram table box (name header, PK-flagged columns, type
 * column) — the same visual language MySQL Workbench / dbdiagram.io use.
 * Built reusable now so a future JOIN level can drop two of these side by
 * side and draw a relationship line between them without inventing a new
 * "what table am I looking at" convention.
 */
export function SchemaCard({ tableName, columns }: { tableName: string; columns: SchemaColumn[] }) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border shadow-[var(--shadow)]">
      <div className="bg-warn px-3 py-1.5 text-center font-mono text-[12px] font-bold text-white">
        {tableName}
      </div>
      <div className="bg-panel">
        {columns.map((col, i) => (
          <div
            key={col.name}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 text-[11px]",
              i > 0 && "border-t border-border",
              col.pk && "bg-warn/8",
            )}
          >
            {col.pk ? (
              <KeyRound className="h-3 w-3 flex-none text-warn" />
            ) : (
              <span className="w-3 flex-none" />
            )}
            <span className={cn("flex-1 font-mono", col.pk ? "font-bold text-text" : "text-text")}>
              {col.name}
            </span>
            <span className="font-mono text-text-muted italic">{col.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
