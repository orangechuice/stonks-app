import React, { useState, useRef, useEffect } from 'react';
import { ChartDataPoint, Timeframe, StockQuote } from '../types/stock';
import { getColorShade, formatCurrency } from '../utils/colorUtils';

interface StockChartProps {
  quote?: StockQuote | null;
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
  const [containerWidth, setContainerWidth] = useState<number>(800);

  // ResizeObserver to dynamically scale SVG chart width to 100% of container
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0] && entries[0].contentRect.width > 0) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!chartData || chartData.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* Timeframe Control Bar */}
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 10,
          padding: 4,
          gap: 3,
          marginBottom: 24,
          overflowX: 'auto',
          userSelect: 'none',
        }}>
          {TIMEFRAMES.map((tf) => {
            const isSelected = selectedTimeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => onSelectTimeframe(tf)}
                style={{
                  flex: '1 1 0%',
                  minWidth: 0,
                  padding: '8px 0',
                  fontSize: '13px',
                  fontWeight: 700,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                  borderRadius: '7px',
                  border: isSelected ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent',
                  backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.22)' : 'transparent',
                  color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {tf}
              </button>
            );
          })}
        </div>

        {/* Chart Unavailable Message */}
        <div style={{
          width: '100%',
          height: 300,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}>
          {isLoading ? (
            <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 14, fontWeight: 500 }}>
              Loading stock chart...
            </div>
          ) : (
            <>
              <div style={{
                fontSize: 18,
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.7)',
                letterSpacing: '-0.01em',
                marginBottom: 6,
              }}>
                Chart Unavailable
              </div>
              <div style={{
                fontSize: 14,
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.4)',
              }}>
                Stocks isn’t connected to the internet.
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Compute performance percentage for current chart range
  const firstPrice = chartData[0]?.close || quote?.previousClose || quote?.regularMarketPrice || 0;
  const currentHoverPrice = hoverPoint ? hoverPoint.data.close : (quote?.regularMarketPrice || firstPrice);
  const periodChange = currentHoverPrice - firstPrice;
  const periodChangePercent = firstPrice !== 0 ? (periodChange / firstPrice) * 100 : 0;
  
  const shade = getColorShade(periodChangePercent);

  // Calculate Min / Max Bounds for SVG scaling
  const prices = chartData.map((d) => d.close);
  const minPrice = Math.min(...prices, quote?.previousClose ?? Infinity);
  const maxPrice = Math.max(...prices, quote?.previousClose ?? -Infinity);
  const priceMargin = (maxPrice - minPrice) * 0.08 || 1.0;
  const yMin = Math.max(0, minPrice - priceMargin);
  const yMax = maxPrice + priceMargin;
  const yRange = yMax - yMin || 1;

  // Responsive SVG Canvas dimensions
  const svgWidth = Math.max(320, containerWidth);
  const svgHeight = 360;
  const paddingRight = 65;
  const paddingBottom = 30;
  const paddingTop = 20;

  const chartW = svgWidth - paddingRight;
  const chartH = svgHeight - paddingBottom - paddingTop;

  // Build SVG Path string dynamically stretching to 100% width
  const points = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1 || 1)) * chartW;
    const y = paddingTop + chartH - ((d.close - yMin) / yRange) * chartH;
    return { x, y, data: d };
  });

  const pathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${chartW} ${paddingTop + chartH} L 0 ${paddingTop + chartH} Z`;

  // Previous Close Dashed Reference Y-coordinate
  const prevCloseY = quote?.previousClose ? paddingTop + chartH - ((quote.previousClose - yMin) / yRange) * chartH : -999;

  // Mouse move handler for hover tooltip
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current || points.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const normalizedX = (mouseX / rect.width) * svgWidth;

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
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }} ref={containerRef}>
      {/* 100% Fully Responsive Segmented Timeframe Control Bar */}
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 10,
        padding: 4,
        gap: 3,
        marginBottom: 24,
        overflowX: 'auto',
        userSelect: 'none',
      }}>
        {TIMEFRAMES.map((tf) => {
          const isSelected = selectedTimeframe === tf;
          return (
            <button
              key={tf}
              onClick={() => onSelectTimeframe(tf)}
              style={{
                flex: '1 1 0%',
                minWidth: 0,
                padding: '8px 0',
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                borderRadius: '7px',
                border: isSelected ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid transparent',
                backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.22)' : 'transparent',
                color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                boxShadow: isSelected ? '0 2px 10px rgba(0, 0, 0, 0.35)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                }
              }}
            >
              {tf}
            </button>
          );
        })}
      </div>

      {/* SVG Interactive Dynamic Full-Width Chart */}
      <div style={{ position: 'relative', width: '100%', height: 360 }}>
        <svg
          style={{ width: '100%', height: '100%', cursor: 'crosshair', overflow: 'visible' }}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverPoint(null)}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={shade.fillGradientStart} />
              <stop offset="100%" stopColor={shade.fillGradientEnd} />
            </linearGradient>
          </defs>

          {/* Grid lines */}
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
                  fontSize="11"
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
              <line
                x1={hoverPoint.x}
                y1={paddingTop}
                x2={hoverPoint.x}
                y2={paddingTop + chartH}
                stroke="rgba(255, 255, 255, 0.4)"
                strokeDasharray="3 3"
              />
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
                fontSize="11"
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
              position: 'absolute',
              top: 32,
              left: `${(hoverPoint.x / svgWidth) * 100}%`,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none',
              backgroundColor: '#1E1E22',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '6px 12px',
              borderRadius: '8px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
              textAlign: 'center',
              zIndex: 10,
            }}
          >
            <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>{hoverPoint.data.dateStr}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#FFF', fontFamily: 'monospace' }}>
              {formatCurrency(hoverPoint.data.close, quote?.currency)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
