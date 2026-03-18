import { memo } from 'react';

function RiskIndicator({ riskScore }) {
  const isSuspicious = riskScore >= 70;
  const label = isSuspicious ? 'Suspicious' : 'Safe';

  return (
    <span className={`risk-indicator ${isSuspicious ? 'risk-high' : 'risk-safe'}`}>
      {label} · {riskScore}
    </span>
  );
}

export default memo(RiskIndicator);
