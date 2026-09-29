import { KeyRound, Link2 } from "lucide-react";
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
 * Reusable so the JOIN level can drop two of these side by side; `highlight`
 * marks the shared join-key column in both so the relationship reads without
 * needing a fragile hand-drawn connector line between two independent cards.
 */
export function SchemaCard({
  tableName,
  columns,
  highlight,
}: {
  tableName: string;
  columns: SchemaColumn[];
  highlight?: string[];
}) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-border shadow-[var(--shadow)]">
      <div className="bg-warn px-3 py-1.5 text-center font-mono text-[12px] font-bold text-white">
        {tableName}
      </div>
      <div className="bg-panel">
        {columns.map((col, i) => {
          const isHighlighted = highlight?.includes(col.name);
          return (
            <div
              key={col.name}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-[11px] transition-colors",
                i > 0 && "border-t border-border",
                col.pk && "bg-warn/8",
                isHighlighted && "bg-accent/14",
              )}
            >
              {col.pk ? (
                <KeyRound className="h-3 w-3 flex-none text-warn" />
              ) : col.fk ? (
                <Link2 className="h-3 w-3 flex-none text-accent" />
              ) : (
                <span className="w-3 flex-none" />
              )}
              <span
                className={cn(
                  "flex-1 font-mono",
                  col.pk || isHighlighted ? "font-bold text-text" : "text-text",
                  isHighlighted && "text-accent",
                )}
              >
                {col.name}
              </span>
              <span className="font-mono text-text-muted italic">{col.type}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
