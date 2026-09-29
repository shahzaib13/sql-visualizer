import { Lightbulb } from "lucide-react";

export interface TheoryKeyword {
  term: string;
  note: string;
}

/**
 * Sits above the SQL block on every level's command panel. A beginner opening
 * this for the first time doesn't know what the query is *for* — this spells
 * out the goal in plain English, then breaks down each keyword used on this
 * level, so tooltip-hunting isn't required to follow along.
 */
export function TheoryCard({ goal, keywords }: { goal: string; keywords: TheoryKeyword[] }) {
  return (
    <div className="mb-3.5 rounded-xl border border-border bg-panel-2 p-3.5">
      <p className="mb-2 flex items-center gap-1.5 text-[10.5px] font-bold tracking-wide text-text-muted uppercase">
        <Lightbulb className="h-3 w-3" />
        What this query does
      </p>
      <p className="text-[11.5px] leading-relaxed text-text">{goal}</p>

      <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
        {keywords.map((k) => (
          <div key={k.term} className="flex items-start gap-2 text-[11px] leading-snug">
            <span className="mt-px flex-none rounded bg-code-kw/15 px-1.5 py-0.5 font-mono text-[10.5px] font-bold text-code-kw">
              {k.term}
            </span>
            <span className="text-text-muted">{k.note}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
