function SettingRow({ title, text, checked, onChange }) {
  return (
    <label className="setting-row">
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} />
    </label>
  );
}

export default SettingRow;
