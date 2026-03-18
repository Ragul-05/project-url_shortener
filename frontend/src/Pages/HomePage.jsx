import { useState } from 'react';
import Navbar from '../Components/Navbar';
import UrlForm from '../Components/UrlForm';
import ResultCard from '../Components/ResultCard';
import Loader from '../Components/Loader';
import ErrorMessage from '../Components/ErrorMessage';
import Dashboard from './Dashboard';
import InsightsDashboard from './InsightsDashboard';
import { shortenUrl } from '../services/urlService';

function HomePage() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleShorten = async (formValues) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await shortenUrl(formValues);
      setResult(response);
      setRefreshKey((currentKey) => currentKey + 1);
    } catch (requestError) {
      setResult(null);
      setError(requestError.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <div className="page-shell">
        <Navbar />

        <section className="hero-panel">
          <div className="hero-copy">
            <span className="eyebrow">Enterprise URL Shortener</span>
            <h1>Shorten long links and manage them from one focused workspace.</h1>
            <p>
              Create compact URLs, copy them instantly, and review link performance in
              a clean enterprise dashboard.
            </p>
          </div>

          <div className="hero-card">
            <div className="card-header">
              <div>
                <h2>Create Short Link</h2>
                <p>Paste your long URL and generate a shareable short link instantly.</p>
              </div>
              <div className="status-chip">Live API</div>
            </div>

            <UrlForm onSubmit={handleShorten} isLoading={isLoading} />

            {isLoading && <Loader />}
            {error && <ErrorMessage message={error} />}
            {result && !isLoading && <ResultCard result={result} />}
          </div>
        </section>

        <Dashboard refreshKey={refreshKey} />
        <InsightsDashboard />
      </div>
    </main>
  );
}

export default HomePage;
