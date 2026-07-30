import React, { useState, useRef, useEffect } from 'react';
import { ChartDataPoint, Timeframe, StockQuote, CustomDateRange } from '../types/stock';
import { getColorShade, formatCurrency } from '../utils/colorUtils';
import { DateRangePickerModal } from './DateRangePickerModal';
import { Calendar } from 'lucide-react';

interface StockChartProps {
  quote?: StockQuote | null;
  chartData: ChartDataPoint[];
  selectedTimeframe: Timeframe;
  onSelectTimeframe: (tf: Timeframe) => void;
  isLoading: boolean;
  customRange?: CustomDateRange;
  onApplyCustomRange?: (range: CustomDateRange) => void;
}

const TIMEFRAMES: Timeframe[] = ['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'ALL', 'CUSTOM'];

export const StockChart: React.FC<StockChartProps> = ({
  quote,
  chartData,
  selectedTimeframe,
  onSelectTimeframe,
  isLoading,
  customRange = {
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  },
  onApplyCustomRange,
}) => {
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number; data: ChartDataPoint } | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
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

  const handleTimeframeClick = (tf: Timeframe) => {
    onSelectTimeframe(tf);
    if (tf === 'CUSTOM') {
      setIsDatePickerOpen(true);
    }
  };

  const handleApplyRange = (range: CustomDateRange) => {
    if (onApplyCustomRange) {
      onApplyCustomRange(range);
    }
  };

  const formatCustomBadgeLabel = () => {
    if (!customRange.startDate || !customRange.endDate) return 'Custom';
    const s = new Date(customRange.startDate + 'T00:00:00');
    const e = new Date(customRange.endDate + 'T00:00:00');
    const sStr = s.toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' });
    const eStr = e.toLocaleDateString([], { month: 'short', day: 'numeric', year: '2-digit' });
    if (customRange.startDate === customRange.endDate) {
      return `${sStr} (1 Day)`;
    }
    return `${sStr} – ${eStr}`;
  };

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
          marginBottom: 16,
          overflowX: 'auto',
          userSelect: 'none',
        }}>
          {TIMEFRAMES.map((tf) => {
            const isSelected = selectedTimeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => handleTimeframeClick(tf)}
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                {tf === 'CUSTOM' ? (
                  <>
                    <Calendar size={13} />
                    <span>{isSelected ? formatCustomBadgeLabel() : 'CUSTOM'}</span>
                  </>
                ) : (
                  tf
                )}
              </button>
            );
          })}
        </div>

        {/* Date Picker Modal */}
        <DateRangePickerModal
          isOpen={isDatePickerOpen}
          onClose={() => setIsDatePickerOpen(false)}
          currentRange={customRange}
          onApplyRange={handleApplyRange}
        />

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
                Stocks isn’t connected to the internet or no market data found for date range.
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

  // Build SVG Path strings dynamically stretching to 100% width
  const points = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1 || 1)) * chartW;
    const y = paddingTop + chartH - ((d.close - yMin) / yRange) * chartH;
    return { x, y, data: d };
  });

  const fullPathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${fullPathD} L ${chartW} ${paddingTop + chartH} L 0 ${paddingTop + chartH} Z`;

  // Extended hours segmentation for 1D timeframe
  const is1DWithExtended = selectedTimeframe === '1D' && chartData.some(d => d.isExtendedHours);

  // Group points by session
  const prePoints: typeof points = [];
  const regPoints: typeof points = [];
  const postPoints: typeof points = [];

  points.forEach(p => {
    if (p.data.session === 'pre') prePoints.push(p);
    else if (p.data.session === 'post') postPoints.push(p);
    else regPoints.push(p);
  });

  // Ensure continuous line connection between sessions
  const preLinePoints = prePoints.length > 0
    ? [...prePoints, ...(regPoints.length > 0 ? [regPoints[0]] : [])]
    : [];
  const regLinePoints = regPoints;
  const postLinePoints = postPoints.length > 0
    ? [...(regPoints.length > 0 ? [regPoints[regPoints.length - 1]] : []), ...postPoints]
    : [];

  const prePathD = preLinePoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const regPathD = regLinePoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const postPathD = postLinePoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  // Market Open (9:30 AM) and Market Close (4:00 PM) X positions
  const marketOpenX = regPoints.length > 0 ? regPoints[0].x : null;
  const marketCloseX = regPoints.length > 0 ? regPoints[regPoints.length - 1].x : null;

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
        marginBottom: selectedTimeframe === 'CUSTOM' ? 12 : 24,
        overflowX: 'auto',
        userSelect: 'none',
      }}>
        {TIMEFRAMES.map((tf) => {
          const isSelected = selectedTimeframe === tf;
          return (
            <button
              key={tf}
              onClick={() => handleTimeframeClick(tf)}
              style={{
                flex: '1 1 0%',
                minWidth: 0,
                padding: '8px 4px',
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
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
              {tf === 'CUSTOM' ? (
                <>
                  <Calendar size={13} />
                  <span>CUSTOM</span>
                </>
              ) : (
                tf
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Date Range Active Info Bar */}
      {selectedTimeframe === 'CUSTOM' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          padding: '8px 14px',
          borderRadius: 8,
          backgroundColor: 'rgba(10, 132, 255, 0.12)',
          border: '1px solid rgba(10, 132, 255, 0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#0A84FF' }}>
            <Calendar size={15} />
            <span>Range: {formatCustomBadgeLabel()}</span>
          </div>
          <button
            onClick={() => setIsDatePickerOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#0A84FF',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Change Dates
          </button>
        </div>
      )}

      {/* Date Range Picker Modal */}
      <DateRangePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        currentRange={customRange}
        onApplyRange={handleApplyRange}
      />


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
            return (
              <line
                key={idx}
                x1="0"
                y1={yVal}
                x2={chartW}
                y2={yVal}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Vertical Market Session Boundaries (Market Open 9:30 AM & Market Close 4:00 PM) */}
          {is1DWithExtended && (
            <>
              {marketOpenX != null && prePoints.length > 0 && (
                <line
                  x1={marketOpenX}
                  y1={paddingTop}
                  x2={marketOpenX}
                  y2={paddingTop + chartH}
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeDasharray="2 2"
                />
              )}
              {marketCloseX != null && postPoints.length > 0 && (
                <line
                  x1={marketCloseX}
                  y1={paddingTop}
                  x2={marketCloseX}
                  y2={paddingTop + chartH}
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeDasharray="2 2"
                />
              )}
            </>
          )}

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

          {/* Chart Stroke Lines */}
          {is1DWithExtended ? (
            <>
              {/* Pre-Market Segment (Dashed) */}
              {prePathD && (
                <path
                  d={prePathD}
                  fill="none"
                  stroke={shade.strokeColor}
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  opacity="0.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Regular Market Hours Segment (Solid) */}
              {regPathD && (
                <path
                  d={regPathD}
                  fill="none"
                  stroke={shade.strokeColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Post-Market / After Hours Segment (Dashed) */}
              {postPathD && (
                <path
                  d={postPathD}
                  fill="none"
                  stroke={shade.strokeColor}
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  opacity="0.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </>
          ) : (
            /* Single Solid Line for non-extended charts */
            <path
              d={fullPathD}
              fill="none"
              stroke={shade.strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

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
        </svg>

        {/* Y Axis Price Labels (HTML overlay to prevent text squishing/stretching on resize) */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const yVal = paddingTop + chartH * pct;
          const priceVal = yMax - pct * yRange;
          return (
            <div
              key={`y-label-${idx}`}
              style={{
                position: 'absolute',
                top: yVal,
                left: `${(chartW / svgWidth) * 100}%`,
                paddingLeft: 8,
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.35)',
                fontSize: 11,
                fontFamily: 'JetBrains Mono, monospace',
                pointerEvents: 'none',
                userSelect: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {priceVal.toFixed(2)}
            </div>
          );
        })}

        {/* X Axis Time Labels (HTML overlay to prevent text squishing/stretching on resize) */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const ptIdx = Math.floor(pct * (chartData.length - 1));
          const pt = chartData[ptIdx];
          if (!pt) return null;
          const leftPct = ((pct * chartW) / svgWidth) * 100;
          const transform = idx === 0 ? 'none' : idx === 4 ? 'translateX(-100%)' : 'translateX(-50%)';
          return (
            <div
              key={`x-label-${idx}`}
              style={{
                position: 'absolute',
                bottom: 8,
                left: `${leftPct}%`,
                transform,
                color: 'rgba(255, 255, 255, 0.4)',
                fontSize: 11,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                pointerEvents: 'none',
                userSelect: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {pt.dateStr}
            </div>
          );
        })}

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
            <div style={{ fontSize: 11, color: 'rgba(255, 255, 255, 0.5)' }}>
              {hoverPoint.data.dateStr}
              {hoverPoint.data.session === 'post' ? ' (After Hours)' : hoverPoint.data.session === 'pre' ? ' (Pre-Market)' : ''}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#FFF', fontFamily: 'monospace' }}>
              {formatCurrency(hoverPoint.data.close, quote?.currency)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
