import React from "react";
import Table from "../components/Table.jsx";

export default function Orders() {
  // ✅ 지금은 UI만 먼저 (샘플 데이터)
  const rows = [
    { id: 1, order_no: "ORD001", store: "강남점", product: "프리미엄 쌀 20kg", qty: 10, amount: 450000, status: "대기", date: "2024-12-26" },
    { id: 2, order_no: "ORD002", store: "해운대점", product: "생수 2L (박스)", qty: 20, amount: 170000, status: "승인", date: "2024-12-25" },
  ];

  const columns = [
    { key: "order_no", label: "주문번호" },
    { key: "store", label: "가맹점" },
    { key: "product", label: "상품명" },
    { key: "qty", label: "수량" },
    { key: "amount", label: "금액", render: (r) => `${r.amount.toLocaleString()}원` },
    { key: "status", label: "상태" },
    { key: "date", label: "주문일" },
    { key: "manage", label: "관리", render: () => <button className="btn">상세</button> },
  ];

  return (
    <div>
      <h1 className="h1">발주 관리</h1>
      <div className="sub">가맹점 발주 현황을 관리합니다</div>

      <div style={{ marginTop: 16 }}>
        <Table columns={columns} rows={rows} />
      </div>
    </div>
  );
}
