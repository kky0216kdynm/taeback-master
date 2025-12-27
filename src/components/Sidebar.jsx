import React from "react";

const items = [
  { key: "dashboard", label: "대시보드" },
  { key: "headOffices", label: "본사 관리" },
  { key: "products", label: "상품 관리" },
  { key: "orders", label: "발주 관리" },     
  { key: "delivery", label: "배송 관리" }   
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
