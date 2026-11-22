// pagina_inma/src/components/charts.jsx — gráficos SVG sencillos y accesibles.
import { eur } from '../lib/format';

export function BarChart({ data, height = 170, label = 'Ventas por día' }) {
  const W = 600, H = height, pad = { t: 14, b: 26, l: 8, r: 8 };
  const max = Math.max(1, ...data.map((d) => d.value));
  const bw = (W - pad.l - pad.r) / data.length;
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label}: ${eur(total)} en total`}>
      {data.map((d, i) => {
        const h = Math.max(d.value > 0 ? 4 : 0, ((H - pad.t - pad.b) * d.value) / max);
        const x = pad.l + i * bw + bw * 0.14;
        const isToday = i === data.length - 1;
        return (
          <g key={d.day}>
            <rect className={`bar${isToday ? ' today' : ''}`} x={x} y={H - pad.b - h} width={bw * 0.72} height={h} rx={7}><title>{`${d.day}: ${eur(d.value)}`}</title></rect>
            {(i % 2 === 0 || isToday) && <text x={x + bw * 0.36} y={H - 8} textAnchor="middle">{d.day.slice(8)}/{d.day.slice(5, 7)}</text>}
          </g>
        );
      })}
    </svg>
  );
}
