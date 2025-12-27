import React from "react";
import Table from "../components/Table.jsx";
import Card from "../components/Card.jsx";

export default function Delivery() {
  const rows = [
    { id: 1, track: "TRK20241226001", order_no: "ORD002", store: "해운대점", address: "부산시 해운대구 해운대로 456", driver: "최배송", eta: "16:30", status: "배송중" },
  ];

  const columns = [
    { key: "track", label: "운송장번호" },
    { key: "order_no", label: "주문번호" },
    { key: "store", label: "가맹점" },
    { key: "address", label: "배송지" },
    { key: "driver", label: "기사님" },
    { key: "eta", label: "예상시간" },
    { key: "status", label: "상태" },
    { key: "manage", label: "관리", render: () => <button className="btn">상세보기</button> },
  ];

  return (
    <div>
      <h1 className="h1">배송 관리</h1>
      <div className="sub">배송 현황을 확인하고 관리합니다</div>

      <div className="grid4" style={{ marginTop: 16 }}>
        <Card title="준비중" value="0" />
        <Card title="픽업완료" value="0" />
        <Card title="배송중" value="1" />
        <Card title="배송완료" value="0" />
      </div>

      <div style={{ marginTop: 16 }}>
        <Table columns={columns} rows={rows} />
      </div>
    </div>
  );
}
