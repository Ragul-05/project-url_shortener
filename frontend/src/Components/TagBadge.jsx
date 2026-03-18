import { memo } from 'react';

function TagBadge({ label }) {
  return <span className="tag-badge">{label}</span>;
}

export default memo(TagBadge);
