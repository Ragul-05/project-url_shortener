import { useEffect } from 'react';
import Loader from './Loader';
import ErrorMessage from './ErrorMessage';

function AnalyticsModal({ isOpen, onClose, analytics, isLoading, error }) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="analytics-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="URL analytics"
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">Analytics</span>
            <h3>URL Performance Overview</h3>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close modal">
            x
          </button>
        </div>

        {isLoading ? <Loader /> : null}
        {error ? <ErrorMessage message={error} /> : null}

        {!isLoading && !error && analytics ? (
          <div className="analytics-grid">
            <div className="analytics-stat">
              <span>Total Clicks</span>
              <strong>{analytics.totalClicks}</strong>
            </div>
            <div className="analytics-stat">
              <span>Last Accessed</span>
              <strong>{analytics.formattedLastClickedAt}</strong>
            </div>
            <div className="analytics-stat">
              <span>Status</span>
              <strong>{analytics.statusLabel}</strong>
            </div>
            <div className="analytics-stat">
              <span>Expiry</span>
              <strong>{analytics.formattedExpiryDate}</strong>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default AnalyticsModal;
