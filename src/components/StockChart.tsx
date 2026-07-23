import React, { useState, useRef } from 'react';
import { ChartDataPoint, Timeframe, StockQuote } from '../types/stock';
import { getColorShade, formatCurrency } from '../utils/colorUtils';

interface StockChartProps {
  quote: StockQuote;
  chartData: ChartDataPoint[];
  selectedTimeframe: Timeframe;
  onSelectTimeframe: (tf: Timeframe) => void;
  isLoading: boolean;
}

const TIMEFRAMES: Timeframe[] = ['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'ALL'];

export const StockChart: React.FC<StockChartProps> = ({
  quote,
  chartData,
  selectedTimeframe,
  onSelectTimeframe,
  isLoading,
}) => {
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number; data: ChartDataPoint } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute performance percentage for current chart range
  const firstPrice = chartData[0]?.close || quote.previousClose || quote.regularMarketPrice;
  const currentHoverPrice = hoverPoint ? hoverPoint.data.close : quote.regularMarketPrice;
  const periodChange = currentHoverPrice - firstPrice;
  const periodChangePercent = firstPrice !== 0 ? (periodChange / firstPrice) * 100 : 0;
  
  const shade = getColorShade(periodChangePercent);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center text-white/40 text-sm">
        {isLoading ? 'Loading stock chart...' : 'No chart data available.'}
      </div>
    );
  }

  // Calculate Min / Max Bounds for SVG scaling
  const prices = chartData.map((d) => d.close);
  const minPrice = Math.min(...prices, quote.previousClose || Infinity);
  const maxPrice = Math.max(...prices, quote.previousClose || -Infinity);
  const priceMargin = (maxPrice - minPrice) * 0.08 || 1.0;
  const yMin = Math.max(0, minPrice - priceMargin);
  const yMax = maxPrice + priceMargin;
  const yRange = yMax - yMin || 1;

  // SVG Canvas dimensions
  const svgWidth = 800;
  const svgHeight = 360;
  const paddingRight = 60;
  const paddingBottom = 30;
  const paddingTop = 20;

  const chartW = svgWidth - paddingRight;
  const chartH = svgHeight - paddingBottom - paddingTop;

  // Build SVG Path string
  const points = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1 || 1)) * chartW;
    const y = paddingTop + chartH - ((d.close - yMin) / yRange) * chartH;
    return { x, y, data: d };
  });

  const pathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${chartW} ${paddingTop + chartH} L 0 ${paddingTop + chartH} Z`;

  // Previous Close Dashed Reference Y-coordinate
  const prevCloseY = paddingTop + chartH - ((quote.previousClose - yMin) / yRange) * chartH;

  // Mouse move handler for hover tooltip
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || points.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const normalizedX = (mouseX / rect.width) * svgWidth;

    // Find nearest point
    let closest = points[0];
    let minDistance = Infinity;
    for (const pt of points) {
      const dist = Math.abs(pt.x - normalizedX);
      if (dist < minDistance) {
        minDistance = dist;
        closest = pt;
      }
    }
    setHoverPoint(closest);
  };

  return (
    <div className="flex flex-col w-full" ref={containerRef}>
      {/* Timeframe Selector Pills */}
      <div className="flex items-center space-x-1 border-b border-white/10 pb-3 mb-4 select-none">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => onSelectTimeframe(tf)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              selectedTimeframe === tf
                ? 'bg-white/20 text-white shadow'
                : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* SVG Interactive Chart */}
      <div className="relative w-full h-[360px]">
        <svg
          className="w-full h-full cursor-crosshair overflow-visible"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverPoint(null)}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={shade.fillGradientStart} />
              <stop offset="100%" stopColor={shade.fillGradientEnd} />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const yVal = paddingTop + chartH * pct;
            const priceVal = yMax - pct * yRange;
            return (
              <g key={idx}>
                <line
                  x1="0"
                  y1={yVal}
                  x2={chartW}
                  y2={yVal}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="4 4"
                />
                <text
                  x={chartW + 8}
                  y={yVal + 4}
                  fill="rgba(255, 255, 255, 0.35)"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {priceVal.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Previous Close Reference Line */}
          {prevCloseY >= paddingTop && prevCloseY <= paddingTop + chartH && (
            <line
              x1="0"
              y1={prevCloseY}
              x2={chartW}
              y2={prevCloseY}
              stroke="rgba(255, 255, 255, 0.25)"
              strokeDasharray="3 3"
            />
          )}

          {/* Chart Fill Area */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Chart Stroke Line */}
          <path
            d={pathD}
            fill="none"
            stroke={shade.strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover Crosshair & Data Indicator */}
          {hoverPoint && (
            <g>
              {/* Vertical Crosshair Line */}
              <line
                x1={hoverPoint.x}
                y1={paddingTop}
                x2={hoverPoint.x}
                y2={paddingTop + chartH}
                stroke="rgba(255, 255, 255, 0.4)"
                strokeDasharray="3 3"
              />
              {/* Target Dot */}
              <circle
                cx={hoverPoint.x}
                cy={hoverPoint.y}
                r="5"
                fill={shade.strokeColor}
                stroke="#18181B"
                strokeWidth="2"
              />
            </g>
          )}

          {/* X Axis Time Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const ptIdx = Math.floor(pct * (chartData.length - 1));
            const pt = chartData[ptIdx];
            if (!pt) return null;
            const xVal = pct * chartW;
            return (
              <text
                key={idx}
                x={xVal}
                y={svgHeight - 8}
                fill="rgba(255, 255, 255, 0.4)"
                fontSize="10"
                textAnchor={idx === 0 ? 'start' : idx === 1 ? 'end' : 'middle'}
              >
                {pt.dateStr}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoverPoint && (
          <div
            style={{
              left: `${(hoverPoint.x / svgWidth) * 100}%`,
              transform: 'translate(-50%, -100%)',
            }}
            className="absolute top-8 pointer-events-none bg-[#1E1E22] border border-white/20 px-3 py-1.5 rounded-lg shadow-xl text-center z-10"
          >
            <div className="text-[10px] text-white/50">{hoverPoint.data.dateStr}</div>
            <div className="font-bold text-xs text-white font-mono">
              {formatCurrency(hoverPoint.data.close, quote.currency)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
