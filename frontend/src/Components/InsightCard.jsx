import { memo } from 'react';

function InsightCard({ title, value, subtitle, accent = 'primary' }) {
  return (
    <article className={`insight-card insight-${accent}`}>
      <span className="insight-title">{title}</span>
      <strong className="insight-value">{value}</strong>
      <p className="insight-subtitle">{subtitle}</p>
    </article>
  );
}

export default memo(InsightCard);
