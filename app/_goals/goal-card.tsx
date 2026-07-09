import { Badge } from "@/components/ui/badge";
import { HatchBar } from "@/components/ui/receipt";
import { cn } from "@/lib/utils";
import type { GoalView } from "@/services/goal.service";

/** Category tone → ink/blue/red/green outline for the round monogram badge. */
export const CATEGORY_BADGE_CLASSES: Record<string, string> = {
  primary: "border-ink text-ink",
  blue: "border-blue text-blue",
  purple: "border-red text-red",
  amber: "border-green text-green",
  danger: "border-red text-red",
  neutral: "border-ink text-ink",
};

interface GoalCardProps {
  goal: GoalView;
  onOpen: () => void;
  onRemove: () => void;
}

export function GoalCard({ goal, onOpen, onRemove }: GoalCardProps) {
  return (
    <div
      onClick={onOpen}
      className="flex cursor-pointer items-center gap-4 border-b border-dashed border-rule-faint px-1 py-4"
    >
      <div
        className={cn(
          "flex h-9 w-9 flex-none -rotate-3 items-center justify-center rounded-full border-2 text-[12px] font-bold opacity-90",
          CATEGORY_BADGE_CLASSES[goal.categoryTone]
        )}
      >
        {goal.categoryGlyph}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-bold text-ink">{goal.name}</div>
        <div className="text-[11.5px] text-ink-faint">
          {goal.timeLabel} · {goal.currentValueFormatted} de {goal.targetValueFormatted}
        </div>
      </div>
      <Badge tone={goal.priorityTone}>{goal.priorityLabel}</Badge>
      <div className="hidden w-[170px] flex-none sm:block">
        <HatchBar pct={goal.sim.progressPct} />
      </div>
      <span className="w-[56px] flex-none text-right text-[13.5px] font-bold text-ink">
        {goal.progressPctLabel}
      </span>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
        className="flex-none cursor-pointer px-1 text-[17px] leading-none text-ink-faint hover:text-ink"
      >
        ×
      </button>
    </div>
  );
}
