import { memo } from 'react';
import ToggleSwitch from './ToggleSwitch';

function UrlTable({ urls, onCopy, onDelete, onToggleStatus, onViewAnalytics, deletingId, togglingId }) {
  return (
    <div className="table-shell">
      <table className="url-table">
        <thead>
          <tr>
            <th>Original URL</th>
            <th>Short URL</th>
            <th>Status</th>
            <th>Clicks</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {urls.map((url) => (
            <tr key={url.id}>
              <td>
                <span className="url-cell original-url" title={url.originalUrl}>
                  {url.originalUrl}
                </span>
              </td>
              <td>
                <a
                  href={url.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="url-link"
                >
                  {url.shortCode}
                </a>
              </td>
              <td>
                <div className="status-cell">
                  <span className={`status-badge ${url.statusTone}`}>{url.statusLabel}</span>
                  <ToggleSwitch
                    checked={url.isActive}
                    onChange={(checked) => onToggleStatus(url.id, checked)}
                    disabled={togglingId === url.id || url.isExpired}
                    label={`Toggle ${url.shortCode}`}
                  />
                </div>
              </td>
              <td>
                <span className="metric-badge">{url.clickCount}</span>
              </td>
              <td>{url.formattedCreatedAt}</td>
              <td>
                <div className="table-actions">
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => onViewAnalytics(url.id)}
                    aria-label={`View analytics for ${url.shortCode}`}
                    title="View analytics"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 19h16v2H4zM7 10h2v7H7zM11 6h2v11h-2zM15 12h2v5h-2z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => onCopy(url.shortUrl)}
                    aria-label={`Copy short URL for ${url.shortCode}`}
                    title="Copy short URL"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9 9h10v12H9z" />
                      <path d="M5 3h10v2H7v10H5z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    className="icon-button danger-button"
                    onClick={() => onDelete(url.id)}
                    disabled={deletingId === url.id}
                    aria-label={`Delete ${url.shortCode}`}
                    title="Delete URL"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9 3h6l1 2h4v2H4V5h4z" />
                      <path d="M7 9h2v9H7zM11 9h2v9h-2zM15 9h2v9h-2z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(UrlTable);
