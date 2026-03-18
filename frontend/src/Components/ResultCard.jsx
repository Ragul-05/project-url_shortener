import { useState } from 'react';

function ResultCard({ result }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.shortUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="result-card" aria-live="polite">
      <div className="result-copy">
        <span className="result-label">Short URL</span>
        <a href={result.shortUrl} target="_blank" rel="noreferrer" className="result-link">
          {result.shortUrl}
        </a>
      </div>

      <button className="secondary-button" type="button" onClick={handleCopy}>
        {copied ? 'Copied' : 'Copy Link'}
      </button>
    </section>
  );
}

export default ResultCard;
