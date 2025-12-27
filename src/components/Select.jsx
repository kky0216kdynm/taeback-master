import React from "react";

export default function Select({ value, onChange, options, placeholder = "선택" }) {
  return (
    <select className="input" value={value || ""} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
