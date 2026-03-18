function Loader() {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader-spinner" aria-hidden="true" />
      <span>Generating your short URL...</span>
    </div>
  );
}

export default Loader;
