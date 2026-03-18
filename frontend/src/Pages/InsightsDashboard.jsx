import { useCallback, useEffect, useMemo, useState } from 'react';
import Loader from '../Components/Loader';
import ErrorMessage from '../Components/ErrorMessage';
import InsightCard from '../Components/InsightCard';
import TagBadge from '../Components/TagBadge';
import RiskIndicator from '../Components/RiskIndicator';
import ChartComponent from '../Components/ChartComponent';
import { fetchInsights, fetchMetadataByCategory, fetchUrlAnalytics } from '../services/urlService';

const insightCategories = ['e-commerce', 'social', 'education', 'documentation', 'content', 'general'];

function InsightsDashboard() {
  const [insights, setInsights] = useState(null);
  const [metadata, setMetadata] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsError, setAnalyticsError] = useState('');
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  useEffect(() => {
    const loadInsights = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [insightsResponse, metadataResponses] = await Promise.all([
          fetchInsights(),
          Promise.all(insightCategories.map((category) => fetchMetadataByCategory(category))),
        ]);

        setInsights(insightsResponse);
        setMetadata(mergeMetadata(metadataResponses.flat()));
      } catch {
        setError('Failed to load insights');
      } finally {
        setIsLoading(false);
      }
    };

    loadInsights();
  }, []);

  const topLink = useMemo(() => insights?.popularUrls?.[0] ?? null, [insights]);

  const totalClicks = useMemo(
    () => insights?.popularUrls?.reduce((sum, item) => sum + item.totalClicks, 0) ?? 0,
    [insights],
  );

  const metadataMap = useMemo(() => new Map(metadata.map((item) => [item.urlId, item])), [metadata]);

  const enrichedPopularUrls = useMemo(() => {
    return (insights?.popularUrls ?? []).map((item, index) => {
      const meta = metadataMap.get(item.urlId);
      return {
        ...item,
        isTopLink: index === 0,
        categoryLabel: meta?.category ?? item.category ?? 'general',
        riskScore: meta?.riskScore ?? 0,
        tags: meta?.tags ?? [item.category ?? 'general'],
      };
    });
  }, [insights, metadataMap]);

  const handleOpenAnalytics = useCallback(async (urlId) => {
    setIsAnalyticsOpen(true);
    setAnalytics(null);
    setAnalyticsError('');
    setIsAnalyticsLoading(true);

    try {
      const response = await fetchUrlAnalytics(urlId);
      setAnalytics(mapAnalytics(response));
    } catch {
      setAnalyticsError('Failed to load insights');
    } finally {
      setIsAnalyticsLoading(false);
    }
  }, []);

  return (
    <section className="dashboard-panel insights-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">AI Insights</span>
          <h2>Performance and risk intelligence</h2>
          <p>Visualize top links, AI categories, and suspicious activity indicators in one place.</p>
        </div>
      </div>

      {isLoading ? <Loader /> : null}
      {error ? <ErrorMessage message={error} /> : null}

      {!isLoading && !error && !insights ? (
        <div className="empty-state">
          <h3>No insights available</h3>
          <p>Create and interact with a few short URLs to generate AI-backed insights.</p>
        </div>
      ) : null}

      {!isLoading && !error && insights ? (
        <>
          <div className="insights-grid">
            <InsightCard
              title="Top performing link"
              value={topLink?.shortCode ?? 'N/A'}
              subtitle={topLink ? `${topLink.totalClicks} clicks` : 'No top link yet'}
              accent="primary"
            />
            <InsightCard
              title="Total click summary"
              value={totalClicks}
              subtitle={`${insights.totalUrls} tracked URLs`}
              accent="secondary"
            />
            <InsightCard
              title="Most recent activity"
              value={insights.clickTrend}
              subtitle={`Top category: ${insights.topCategory}`}
              accent="warning"
            />
          </div>

          <div className="insights-content-grid">
            <div className="insight-surface">
              <div className="surface-header">
                <h3>Top performing URLs</h3>
                <span className="surface-caption">Click any row for detailed analytics</span>
              </div>

              <div className="ai-url-list">
                {enrichedPopularUrls.map((item) => (
                  <button
                    key={item.urlId}
                    type="button"
                    className={`ai-url-row ${item.isTopLink ? 'ai-url-row-highlight' : ''}`}
                    onClick={() => handleOpenAnalytics(item.urlId)}
                  >
                    <div className="ai-url-main">
                      <div>
                        <strong className="ai-url-code">{item.shortCode}</strong>
                        <span className="ai-url-link">{item.shortUrl}</span>
                      </div>

                      <div className="ai-url-meta">
                        <TagBadge label={item.categoryLabel} />
                        <RiskIndicator riskScore={item.riskScore} />
                      </div>
                    </div>

                    <div className="ai-url-footer">
                      <span className="ai-clicks">{item.totalClicks} clicks</span>
                      <div className="tag-list">
                        {item.tags.slice(0, 3).map((tag) => (
                          <TagBadge key={`${item.urlId}-${tag}`} label={tag} />
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="insight-surface">
              <div className="surface-header">
                <h3>Click trends</h3>
                <span className="surface-caption">{insights.highRiskUrls} high-risk URLs flagged</span>
              </div>
              <ChartComponent items={enrichedPopularUrls} />
            </div>
          </div>
        </>
      ) : null}

      {isAnalyticsOpen ? (
        <div className="modal-backdrop" onClick={() => setIsAnalyticsOpen(false)} role="presentation">
          <div
            className="analytics-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Insight analytics"
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">Detailed Analytics</span>
                <h3>Selected URL insight</h3>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setIsAnalyticsOpen(false)}
                aria-label="Close modal"
              >
                x
              </button>
            </div>

            {isAnalyticsLoading ? <Loader /> : null}
            {analyticsError ? <ErrorMessage message={analyticsError} /> : null}

            {!isAnalyticsLoading && !analyticsError && analytics ? (
              <div className="analytics-grid">
                <div className="analytics-stat">
                  <span>Short URL</span>
                  <strong>{analytics.shortCode}</strong>
                </div>
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
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function mergeMetadata(items) {
  const uniqueItems = new Map();
  items.forEach((item) => uniqueItems.set(item.urlId, item));
  return [...uniqueItems.values()];
}

function mapAnalytics(item) {
  const lastClickedAt = item.lastClickedAt ? new Date(item.lastClickedAt) : null;
  const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
  const isExpired = Boolean(expiryDate && expiryDate.getTime() < Date.now());

  return {
    ...item,
    formattedLastClickedAt: lastClickedAt
      ? new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }).format(lastClickedAt)
      : 'No visits yet',
    statusLabel: isExpired ? 'Expired' : item.isActive ? 'Active' : 'Disabled',
  };
}

export default InsightsDashboard;
