import { memo } from 'react';

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination-bar">
      <button
        type="button"
        className="pagination-button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>

      <div className="pagination-meta">
        <span>Page</span>
        <strong>{currentPage}</strong>
        <span>of {totalPages}</span>
      </div>

      <button
        type="button"
        className="pagination-button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}

export default memo(Pagination);
