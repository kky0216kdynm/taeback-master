import React, { useEffect, useState } from "react";
import Card from "../components/Card.jsx";
import { api } from "../api.js";

export default function Dashboard() {
  const [headOffices, setHeadOffices] = useState(0);

  useEffect(() => {
    (async () => {
      const r = await api("/master/head-offices");
      setHeadOffices(r.headOffices?.length || 0);
    })().catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="h1">대시보드</h1>
      <div className="sub">마스터 데이터 관리 현황</div>

      <div className="grid4">
        <Card title="전체 본사" value={headOffices} small="등록된 본사 수" />
        <Card title="가맹점 등록" value="엑셀/수동" small="인증코드 자동 생성" />
        <Card title="상품 등록" value="엑셀/수동" small="재고 없음, 품절만" />
        <Card title="운영 DB 반영" value="ON" small="업로드 즉시 DB 저장" />
      </div>
    </div>
  );
}
