import { formatCurrencyCompactBRL } from "@/lib/utils";
import type { ChartPoint, ChartYAxisTick } from "@/types/bill-split";

interface HistoryChartProps {
  points: ChartPoint[];
  yAxisTicks: ChartYAxisTick[];
  selectedMonth: number;
  onSelectMonth: (month: number) => void;
}

export function HistoryChart({ points, yAxisTicks, selectedMonth, onSelectMonth }: HistoryChartProps) {
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <svg viewBox="0 0 640 200" className="block h-auto w-full">
      {yAxisTicks.map((tick) => (
        <g key={tick.value}>
          <line
            x1={58}
            y1={tick.y}
            x2={610}
            y2={tick.y}
            stroke="var(--rule-faint)"
            strokeWidth={1}
            strokeDasharray="2 4"
          />
          <text x={50} y={tick.y + 3.5} textAnchor="end" fontSize={10.5} fill="var(--ink-faint)">
            {formatCurrencyCompactBRL(tick.value)}
          </text>
        </g>
      ))}
      <polyline points={linePoints} fill="none" stroke="var(--ink)" strokeWidth={2} />
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
            {(isSelected || point.isCurrent) && (
              <circle
                cx={point.x}
                cy={point.y}
                r={9}
                fill="none"
                stroke="var(--red)"
                strokeWidth={2}
                strokeDasharray="3 2"
              />
            )}
            <circle cx={point.x} cy={point.y} r={point.isCurrent ? 4 : 3.5} fill="var(--ink)" />
            <text
              x={point.x}
              y={190}
              textAnchor="middle"
              fontSize={10.5}
              fontWeight={isSelected || point.isCurrent ? 700 : 400}
              fill={isSelected || point.isCurrent ? "var(--ink)" : "var(--ink-faint)"}
              style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
            >
              {point.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
