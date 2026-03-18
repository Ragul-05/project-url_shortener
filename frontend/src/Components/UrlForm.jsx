import { useState } from 'react';
import DatePicker from './DatePicker';

const urlPattern = /^(https?:\/\/)([\w-]+\.)+[\w-]+([/?#].*)?$/i;

function UrlForm({ onSubmit, isLoading }) {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [validationError, setValidationError] = useState('');

  const validate = (value) => {
    if (!value.trim()) {
      return 'Invalid URL';
    }

    if (!urlPattern.test(value.trim())) {
      return 'Invalid URL';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedUrl = url.trim();
    const nextError = validate(trimmedUrl);

    if (nextError) {
      setValidationError(nextError);
      return;
    }

    setValidationError('');
    await onSubmit({
      originalUrl: trimmedUrl,
      customCode: customAlias.trim() || undefined,
      expiryDate: expiryDate || undefined,
    });
  };

  const handleChange = (event) => {
    const nextValue = event.target.value;
    setUrl(nextValue);

    if (validationError) {
      setValidationError(validate(nextValue));
    }
  };

  return (
    <form className="url-form" onSubmit={handleSubmit} noValidate>
      <label className="field-group" htmlFor="originalUrl">
        <span className="field-label">Long URL</span>
        <input
          id="originalUrl"
          name="originalUrl"
          type="url"
          value={url}
          onChange={handleChange}
          placeholder="https://example.com/very/long/link"
          className={validationError ? 'field-input has-error' : 'field-input'}
          autoComplete="off"
          disabled={isLoading}
        />
      </label>

      <div className="form-grid">
        <label className="field-group" htmlFor="customAlias">
          <span className="field-label">Custom alias</span>
          <input
            id="customAlias"
            name="customAlias"
            type="text"
            value={customAlias}
            onChange={(event) => setCustomAlias(event.target.value)}
            placeholder="my-brand-link"
            className="field-input"
            autoComplete="off"
            disabled={isLoading}
          />
        </label>

        <DatePicker
          id="expiryDate"
          label="Expiry date"
          value={expiryDate}
          onChange={setExpiryDate}
          disabled={isLoading}
        />
      </div>

      {validationError ? <p className="field-error">{validationError}</p> : null}

      <button className="primary-button" type="submit" disabled={isLoading}>
        {isLoading ? 'Shortening...' : 'Shorten URL'}
      </button>
    </form>
  );
}

export default UrlForm;
