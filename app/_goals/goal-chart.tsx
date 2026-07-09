import {
  CHART_VIEW_HEIGHT,
  CHART_VIEW_WIDTH,
  CHART_Y_BASELINE,
  buildChartPoints,
  type GoalSimulationPoint,
} from "@/services/goal-math.service";

interface GoalChartProps {
  path: GoalSimulationPoint[];
  startLabel: string;
  endLabel: string;
}

export function GoalChart({ path, startLabel, endLabel }: GoalChartProps) {
  const points = buildChartPoints(path);
  if (points.length === 0) return null;

  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = [
    `${points[0].x},${CHART_Y_BASELINE}`,
    ...points.map((point) => `${point.x},${point.y}`),
    `${points[points.length - 1].x},${CHART_Y_BASELINE}`,
  ].join(" ");

  return (
    <svg viewBox={`0 0 ${CHART_VIEW_WIDTH} ${CHART_VIEW_HEIGHT}`} className="block h-auto w-full">
      <line
        x1={points[0].x}
        y1={CHART_Y_BASELINE}
        x2={points[points.length - 1].x}
        y2={CHART_Y_BASELINE}
        stroke="var(--rule)"
        strokeWidth={1.5}
      />
      <polygon points={areaPoints} fill="var(--blue)" fillOpacity={0.12} />
      <polyline points={linePoints} fill="none" stroke="var(--ink)" strokeWidth={2} />
      <text x={points[0].x} y={CHART_VIEW_HEIGHT - 8} fontSize={10.5} fill="var(--ink-faint)">
        {startLabel}
      </text>
      <text
        x={points[points.length - 1].x}
        y={CHART_VIEW_HEIGHT - 8}
        textAnchor="end"
        fontSize={10.5}
        fill="var(--ink-faint)"
      >
        {endLabel}
      </text>
    </svg>
  );
}
