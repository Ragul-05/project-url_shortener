function ToggleSwitch({ checked, onChange, disabled, label }) {
  return (
    <label className="toggle-switch" title={label}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
      />
      <span className="toggle-slider" />
    </label>
  );
}

export default ToggleSwitch;
