import React from "react";

const items = [
  { key: "dashboard", label: "대시보드" },

  // ✅ 본사/가맹점은 같은 영역이라 붙여두는게 UX 좋음
  { key: "headOffices", label: "본사 관리" },
  { key: "stores", label: "가맹점 관리" },

  { key: "products", label: "상품 관리" },
  { key: "orders", label: "발주 관리" },
  { key: "delivery", label: "배송 관리" },
];

export default function Sidebar({ route, onRoute }) {
  return (
    <div className="sidebar">
      <div className="brand">📦 마스터 관리</div>

      <div className="nav">
        {items.map((it) => (
          <a
            key={it.key}
            className={`navItem ${route === it.key ? "active" : ""}`}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onRoute(it.key);
            }}
          >
            <span style={{ width: 20, display: "inline-block" }}>•</span>
            {it.label}
          </a>
        ))}
      </div>
    </div>
  );
}
