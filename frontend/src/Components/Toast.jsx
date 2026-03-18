import { memo } from 'react';

function Toast({ toast }) {
  if (!toast) {
    return null;
  }

  return (
    <div className={`toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`} role="status">
      {toast.message}
    </div>
  );
}

export default memo(Toast);
