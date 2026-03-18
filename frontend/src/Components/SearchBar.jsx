import { memo } from 'react';

function SearchBar({ value, onChange }) {
  return (
    <label className="search-shell" htmlFor="searchUrls">
      <svg viewBox="0 0 24 24" aria-hidden="true" className="search-icon">
        <path d="M10 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0-2a8 8 0 1 0 4.9 14.3l4.4 4.4 1.4-1.4-4.4-4.4A8 8 0 0 0 10 2z" />
      </svg>
      <input
        id="searchUrls"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="search-input"
        placeholder="Search by original URL or short code"
        autoComplete="off"
      />
    </label>
  );
}

export default memo(SearchBar);
