import { memo } from 'react';
import ToggleSwitch from './ToggleSwitch';

function UrlCard({ url, onCopy, onDelete, onToggleStatus, onViewAnalytics, deletingId, togglingId }) {
  return (
    <article className={`url-card ${url.cardTone}`}>
      <div className="url-card-top">
        <div>
          <p className="card-meta-label">Original URL</p>
          <p className="card-original-url" title={url.originalUrl}>
            {url.originalUrl}
          </p>
        </div>
        <div className="card-highlight">
          <span className={`status-badge ${url.statusTone}`}>{url.statusLabel}</span>
          <span className="metric-badge">{url.clickCount} clicks</span>
        </div>
      </div>

      <div className="card-info-grid">
        <div>
          <p className="card-meta-label">Short URL</p>
          <a href={url.shortUrl} target="_blank" rel="noreferrer" className="url-link">
            {url.shortUrl}
          </a>
        </div>

        <div>
          <p className="card-meta-label">Created</p>
          <p className="card-meta-value">{url.formattedCreatedAt}</p>
        </div>
      </div>

      <div className="card-status-row">
        <div>
          <p className="card-meta-label">Expiry</p>
          <p className="card-meta-value">{url.formattedExpiryDate}</p>
        </div>
        <ToggleSwitch
          checked={url.isActive}
          onChange={(checked) => onToggleStatus(url.id, checked)}
          disabled={togglingId === url.id || url.isExpired}
          label={`Toggle ${url.shortCode}`}
        />
      </div>

      <div className="card-actions">
        <button type="button" className="secondary-button small-button" onClick={() => onViewAnalytics(url.id)}>
          View Analytics
        </button>
        <button type="button" className="secondary-button small-button" onClick={() => onCopy(url.shortUrl)}>
          Copy Link
        </button>
        <button
          type="button"
          className="ghost-danger-button"
          onClick={() => onDelete(url.id)}
          disabled={deletingId === url.id}
        >
          {deletingId === url.id ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </article>
  );
}

export default memo(UrlCard);
