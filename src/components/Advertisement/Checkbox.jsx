export function Checkbox({ label, checked, onChange }) {
  return (
    <label style={{ cursor: "pointer", userSelect: "none" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ marginRight: 8 }}
      />
      {label}
    </label>
  );
}
