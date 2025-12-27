import React from "react";

export default function Modal({ title, open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="modalBg" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div className="modalTitle">{title}</div>
          <button className="btn" onClick={onClose}>닫기</button>
        </div>
        {children}
      </div>
    </div>
  );
}
