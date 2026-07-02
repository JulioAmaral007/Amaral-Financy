import type { ChartPoint } from "@/types/bill-split";

interface HistoryChartProps {
  points: ChartPoint[];
  selectedMonth: number;
  onSelectMonth: (month: number) => void;
}

export function HistoryChart({ points, selectedMonth, onSelectMonth }: HistoryChartProps) {
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="mb-6 rounded-2xl border border-border/7 bg-surface px-6 pb-5 pt-7">
      <svg viewBox="0 0 640 200" className="block h-auto w-full">
        <line x1={30} y1={170} x2={610} y2={170} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
        <polyline points={linePoints} fill="none" stroke="var(--primary)" strokeWidth={2.5} />
        {points.map((point) => {
          const isSelected = point.month === selectedMonth;
          return (
            <g
              key={point.month}
              role="button"
              tabIndex={0}
              aria-label={`Ver quanto cada salário pagou em ${point.label}`}
              aria-pressed={isSelected}
              className="cursor-pointer outline-none"
              onClick={() => onSelectMonth(point.month)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectMonth(point.month);
                }
              }}
            >
              <circle cx={point.x} cy={point.y} r={12} fill="transparent" />
              {isSelected && <circle cx={point.x} cy={point.y} r={8} fill="none" stroke="#eafff2" strokeWidth={1.5} />}
              <circle
                cx={point.x}
                cy={point.y}
                r={point.isCurrent ? 5 : 3.5}
                fill={point.isCurrent ? "#eafff2" : "var(--primary)"}
              />
              <text
                x={point.x}
                y={188}
                textAnchor="middle"
                fontSize={11}
                fontWeight={isSelected ? 700 : 400}
                fill={isSelected ? "#eafff2" : "rgba(243,245,243,0.45)"}
              >
                {point.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
