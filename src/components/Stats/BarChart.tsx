interface BarChartProps {
  title: string;
  bars: { key: string | number; label: string; value: number; tooltip: string; active?: boolean }[];
  /** Rótulos do eixo X exibidos (os demais ficam só no tooltip) */
  labelEvery?: number;
  onSelect?: (key: string | number) => void;
}

/** Gráfico de barras compacto: cada barra é um botão (filtro clicável, acessível por teclado). */
export function BarChart({ title, bars, labelEvery = 1, onSelect }: BarChartProps) {
  const max = Math.max(...bars.map(b => b.value), 1);
  const hasSelection = bars.some(b => b.active);

  return (
    <div className="stats-chart">
      <h3 className="stats-participants-title">{title}</h3>
      <div className="stats-chart-bars" role="group" aria-label={title}>
        {bars.map(bar => (
          <button
            key={bar.key}
            type="button"
            className={`stats-chart-bar ${bar.active ? 'stats-chart-bar--active' : ''} ${hasSelection && !bar.active ? 'stats-chart-bar--dim' : ''}`}
            title={bar.tooltip}
            aria-label={bar.tooltip}
            aria-pressed={bar.active ?? false}
            disabled={!onSelect}
            onClick={() => onSelect?.(bar.key)}
          >
            <span className="stats-chart-bar-fill" style={{ height: `${Math.max((bar.value / max) * 100, bar.value > 0 ? 4 : 0)}%` }} />
          </button>
        ))}
      </div>
      <div className="stats-chart-axis" aria-hidden="true">
        {bars.map((bar, i) => (
          <span key={bar.key} className="stats-chart-tick">
            {i % labelEvery === 0 ? bar.label : ''}
          </span>
        ))}
      </div>
    </div>
  );
}
