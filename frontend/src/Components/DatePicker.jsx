function DatePicker({ id, label, value, onChange, disabled }) {
  return (
    <label className="field-group date-field-group" htmlFor={id}>
      <span className="field-label">{label}</span>
      <input
        id={id}
        name={id}
        type="datetime-local"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="field-input date-field-input"
        disabled={disabled}
      />
    </label>
  );
}

export default DatePicker;
