import { Suspense, lazy, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import Loader from '../Components/Loader';
import ErrorMessage from '../Components/ErrorMessage';
import UrlTable from '../Components/UrlTable';
import UrlCard from '../Components/UrlCard';
import SearchBar from '../Components/SearchBar';
import Pagination from '../Components/Pagination';
import Toast from '../Components/Toast';
import { deleteUrl, fetchUrlAnalytics, fetchUrls, updateUrlStatus } from '../services/urlService';

const AnalyticsModal = lazy(() => import('../Components/AnalyticsModal'));
const PAGE_SIZE = 6;

function Dashboard({ refreshKey }) {
  const [urls, setUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsError, setAnalyticsError] = useState('');
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const deferredSearchQuery = useDeferredValue(debouncedSearchQuery);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      setCurrentPage(1);
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const loadUrls = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetchUrls({
          search: deferredSearchQuery,
          page: currentPage,
          limit: PAGE_SIZE,
        });
        setUrls(response.map(mapUrlItem));
      } catch (requestError) {
        setError(requestError.message || 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };

    loadUrls();
  }, [refreshKey, deferredSearchQuery, currentPage]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const filteredUrls = useMemo(() => {
    const query = deferredSearchQuery.toLowerCase();

    if (!query) {
      return urls;
    }

    return urls.filter((url) => {
      const originalUrl = url.originalUrl.toLowerCase();
      const shortCode = url.shortCode.toLowerCase();
      return originalUrl.includes(query) || shortCode.includes(query);
    });
  }, [urls, deferredSearchQuery]);

  const paginatedUrls = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredUrls.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredUrls, currentPage]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredUrls.length / PAGE_SIZE)),
    [filteredUrls.length],
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleCopy = useCallback(async (shortUrl) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setToast({ type: 'success', message: 'Copy success' });
    } catch {
      setToast({ type: 'error', message: 'Something went wrong' });
    }
  }, []);

  const handleDelete = useCallback(async (id) => {
    setDeletingId(id);

    try {
      await deleteUrl(id);
      const response = await fetchUrls({
        search: deferredSearchQuery,
        page: currentPage,
        limit: PAGE_SIZE,
      });
      setUrls(response.map(mapUrlItem));
      setToast({ type: 'success', message: 'Delete success' });
    } catch (requestError) {
      setError(requestError.message || 'Something went wrong');
    } finally {
      setDeletingId(null);
    }
  }, [currentPage, deferredSearchQuery]);

  const handleToggleStatus = useCallback(async (id, isActive) => {
    setTogglingId(id);

    try {
      const updatedUrl = await updateUrlStatus(id, isActive);
      setUrls((currentUrls) =>
        currentUrls.map((url) => (url.id === id ? mapUrlItem(updatedUrl) : url)),
      );
    } catch (requestError) {
      setError(requestError.message || 'Something went wrong');
    } finally {
      setTogglingId(null);
    }
  }, []);

  const handleViewAnalytics = useCallback(async (id) => {
    setIsAnalyticsOpen(true);
    setIsAnalyticsLoading(true);
    setAnalyticsError('');
    setAnalytics(null);

    try {
      const response = await fetchUrlAnalytics(id);
      setAnalytics(mapAnalytics(response));
    } catch (requestError) {
      setAnalyticsError(requestError.message || 'Something went wrong');
    } finally {
      setIsAnalyticsLoading(false);
    }
  }, []);

  return (
    <section className="dashboard-panel">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h2>Manage your shortened URLs</h2>
          <p>Track links, copy them quickly, and clean up records with a minimal workflow.</p>
        </div>
        <div className="summary-chip">{filteredUrls.length} links</div>
      </div>

      <Toast toast={toast} />
      {error ? <ErrorMessage message={error} /> : null}
      {isLoading ? <Loader /> : null}
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {!isLoading && !error && filteredUrls.length === 0 ? (
        <div className="empty-state">
          <h3>No URLs found</h3>
          <p>Try a different search or create a new short URL to populate the dashboard.</p>
        </div>
      ) : null}

      {!isLoading && filteredUrls.length > 0 ? (
        <>
          <div className="desktop-only">
            <UrlTable
              urls={paginatedUrls}
              onCopy={handleCopy}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onViewAnalytics={handleViewAnalytics}
              deletingId={deletingId}
              togglingId={togglingId}
            />
          </div>

          <div className="mobile-only card-stack">
            {paginatedUrls.map((url) => (
              <UrlCard
                key={url.id}
                url={url}
                onCopy={handleCopy}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onViewAnalytics={handleViewAnalytics}
                deletingId={deletingId}
                togglingId={togglingId}
              />
            ))}
          </div>

          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : null}

      <Suspense fallback={isAnalyticsOpen ? <Loader /> : null}>
        <AnalyticsModal
          isOpen={isAnalyticsOpen}
          onClose={() => setIsAnalyticsOpen(false)}
          analytics={analytics}
          isLoading={isAnalyticsLoading}
          error={analyticsError}
        />
      </Suspense>
    </section>
  );
}

function mapUrlItem(url) {
  const now = Date.now();
  const expiryDate = url.expiryDate ? new Date(url.expiryDate) : null;
  const isExpired = Boolean(expiryDate && expiryDate.getTime() < now);
  const statusLabel = isExpired ? 'Expired' : url.isActive ? 'Active' : 'Disabled';

  return {
    ...url,
    formattedCreatedAt: new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(url.createdAt)),
    formattedExpiryDate: expiryDate
      ? new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).format(expiryDate)
      : 'No expiry',
    isExpired,
    statusLabel,
    statusTone: isExpired ? 'status-expired' : url.isActive ? 'status-active' : 'status-disabled',
    cardTone: isExpired ? 'card-expired' : url.isActive ? 'card-active' : 'card-disabled',
  };
}

function mapAnalytics(item) {
  const expiryDate = item.expiryDate ? new Date(item.expiryDate) : null;
  const lastClickedAt = item.lastClickedAt ? new Date(item.lastClickedAt) : null;
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
    formattedExpiryDate: expiryDate
      ? new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).format(expiryDate)
      : 'No expiry',
    statusLabel: isExpired ? 'Expired' : item.isActive ? 'Active' : 'Disabled',
  };
}

export default Dashboard;
