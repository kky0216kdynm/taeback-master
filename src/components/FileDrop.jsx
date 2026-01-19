import React, { useRef } from "react";

export default function FileDrop({
  onFile,
  hint = "CSV 또는 엑셀 파일을 드래그하거나 클릭해서 업로드",
  accept = ".csv,.xlsx,.xls",
  sub = ".csv / .xlsx / .xls"
}) {
  const ref = useRef(null);

  return (
    <>
      <input
        ref={ref}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = ""; // 같은 파일 다시 선택 가능하게
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
        <div className="small" style={{ marginTop: 8 }}>{sub}</div>
      </div>
    </>
  );
}
