import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import Table from "../components/Table.jsx";

export default function HeadOffices() {
  const [rows, setRows] = useState([]);

  async function load() {
    const r = await api("/master/head-offices");
    setRows(r.headOffices || []);
  }

  useEffect(() => { load().catch(console.error); }, []);

  const cols = [
    { key: "name", label: "본사명" },
    { key: "code", label: "본사코드" },
    { key: "address", label: "주소" },
    { key: "phone", label: "연락처" },
    { key: "created_at", label: "생성일" }
  ];

  return (
    <div>
      <h1 className="h1">본사 관리</h1>
      <div className="sub">본사 목록을 확인합니다</div>

      <div style={{ marginTop: 16 }}>
        <Table columns={cols} rows={rows} />
      </div>
    </div>
  );
}
