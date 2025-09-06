import "./Switch.css";

export default function Switch({ checked, onChange, label, id }) {
  return (
    <div className="switch__wrapper">
      <label htmlFor={id} className="switch__label input__label">
        {label} <span className="asterisk">*</span>
      </label>
      <label className="switch">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="slider" />
      </label>
    </div>
  );
}
