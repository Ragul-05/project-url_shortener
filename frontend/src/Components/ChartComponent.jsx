import { memo, useMemo } from 'react';

function ChartComponent({ items }) {
  const chartBars = useMemo(() => {
    const maxClicks = Math.max(...items.map((item) => item.totalClicks), 1);
    return items.map((item) => ({
      ...item,
      height: Math.max(20, (item.totalClicks / maxClicks) * 150),
    }));
  }, [items]);

  if (!items.length) {
    return (
      <div className="chart-empty">
        <p>No insights available</p>
      </div>
    );
  }

  return (
    <div className="chart-shell">
      {chartBars.map((item) => (
        <div key={item.urlId} className="chart-bar-group" title={`${item.shortCode}: ${item.totalClicks} clicks`}>
          <div className="chart-bar" style={{ height: `${item.height}px` }} />
          <span className="chart-value">{item.totalClicks}</span>
          <span className="chart-label">{item.shortCode}</span>
        </div>
      ))}
    </div>
  );
}

export default memo(ChartComponent);
