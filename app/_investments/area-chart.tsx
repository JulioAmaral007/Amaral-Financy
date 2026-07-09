import {
  CHART_VIEW_HEIGHT,
  CHART_VIEW_WIDTH,
  CHART_Y_BASELINE,
  buildChartPoints,
} from "@/services/investment-math.service";

interface AreaChartProps {
  values: number[];
  startLabel: string;
  endLabel: string;
  endLabelStrong?: boolean;
}

/**
 * Gráfico de área do papel timbrado: linha a tinta sobre preenchimento azul
 * apagado. O `aspectRatio` explícito é obrigatório — sem ele o WebKit ignora o
 * viewBox e estica o SVG na vertical no mobile.
 */
export function AreaChart({ values, startLabel, endLabel, endLabelStrong = false }: AreaChartProps) {
  const points = buildChartPoints(values);
  if (points.length === 0) return null;

  const first = points[0];
  const last = points[points.length - 1];
  const linePoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const areaPoints = [
    `${first.x},${CHART_Y_BASELINE}`,
    ...points.map((point) => `${point.x},${point.y}`),
    `${last.x},${CHART_Y_BASELINE}`,
  ].join(" ");

  return (
    <svg
      viewBox={`0 0 ${CHART_VIEW_WIDTH} ${CHART_VIEW_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      className="block h-auto w-full"
      style={{ aspectRatio: `${CHART_VIEW_WIDTH} / ${CHART_VIEW_HEIGHT}` }}
    >
      <line
        x1={first.x}
        y1={CHART_Y_BASELINE}
        x2={last.x}
        y2={CHART_Y_BASELINE}
        stroke="var(--rule)"
        strokeWidth={1.5}
      />
      <polygon points={areaPoints} fill="var(--blue)" fillOpacity={0.12} />
      <polyline points={linePoints} fill="none" stroke="var(--ink)" strokeWidth={2} />
      <text x={first.x} y={CHART_VIEW_HEIGHT - 8} fontSize={10.5} fill="var(--ink-faint)">
        {startLabel}
      </text>
      <text
        x={last.x}
        y={CHART_VIEW_HEIGHT - 8}
        textAnchor="end"
        fontSize={10.5}
        fontWeight={endLabelStrong ? 700 : 400}
        fill={endLabelStrong ? "var(--ink)" : "var(--ink-faint)"}
      >
        {endLabel}
      </text>
    </svg>
  );
}
