import React, { useRef } from "react";

export default function FileDrop({ onFile, hint = "엑셀 파일을 드래그하거나 클릭해서 업로드" }) {
  const ref = useRef(null);

  return (
    <>
      <input
        ref={ref}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <div
        className="drop"
        onClick={() => ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
      >
        {hint}
        <div className="small" style={{ marginTop: 8 }}>.xlsx / .xls</div>
      </div>
    </>
  );
}
