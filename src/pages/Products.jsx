import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import Table from "../components/Table.jsx";
import Modal from "../components/Modal.jsx";
import FileDrop from "../components/FileDrop.jsx";
import Select from "../components/Select.jsx";

export default function Products() {
  const [headOffices, setHeadOffices] = useState([]);
  const [headOfficeId, setHeadOfficeId] = useState("");
  const [rows, setRows] = useState([]);
  const [openUpload, setOpenUpload] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    (async () => {
      const r = await api("/master/head-offices");
      const hos = r.headOffices || [];
      setHeadOffices(hos);
      if (hos[0]) setHeadOfficeId(String(hos[0].id));
    })().catch(console.error);
  }, []);

  async function loadProducts(hid) {
    if (!hid) return;
    const r = await api(`/master/products?headOfficeId=${hid}`);
    setRows(r.products || []);
  }

  useEffect(() => {
    loadProducts(headOfficeId).catch(console.error);
  }, [headOfficeId]);

  const headOfficeOptions = useMemo(
    () => headOffices.map((h) => ({ value: String(h.id), label: `${h.name} (${h.code})` })),
    [headOffices]
  );

  const cols = [
    { key: "name", label: "상품명" },
    { key: "category", label: "카테고리" },
    { key: "price", label: "가격", render: (r) => `${Number(r.price).toLocaleString()}원` },
    {
      key: "status",
      label: "상태",
      render: (r) => (
        <span className={`pill ${r.status === "ACTIVE" ? "pillGreen" : "pillRed"}`}>
          {r.status === "ACTIVE" ? "판매중" : "품절"}
        </span>
      )
    },
    {
      key: "actions",
      label: "관리",
      render: (r) => (
        <button className="btn" onClick={async () => {
          const next = r.status === "ACTIVE" ? "SOLD_OUT" : "ACTIVE";
          await api(`/master/products/${r.id}/status`, {
            method: "PATCH",
            body: { status: next }
          });
          await loadProducts(headOfficeId);
        }}>
          {r.status === "ACTIVE" ? "품절로" : "판매중"}
        </button>
      )
    }
  ];

  return (
    <div>
      <h1 className="h1">상품 관리</h1>
      <div className="sub">본사 선택 후 상품 업로드/품절 관리 (재고 없음)</div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 16 }}>
        <div style={{ width: 420 }}>
          <Select
            value={headOfficeId}
            onChange={setHeadOfficeId}
            options={headOfficeOptions}
            placeholder="본사 선택"
          />
          <div className="small" style={{ marginTop: 6 }}>
            엑셀 업로드 컬럼: head_office_code, name, category, price, unit, status(선택)
          </div>
        </div>

        <div className="actions">
          <button className="btnGhost btn" onClick={() => { setUploadResult(null); setOpenUpload(true); }}>
            엑셀 업로드
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <Table columns={cols} rows={rows} />
      </div>

      <Modal title="상품 엑셀 업로드" open={openUpload} onClose={() => setOpenUpload(false)}>
        <FileDrop onFile={async (file) => {
          const fd = new FormData();
          fd.append("file", file);
          const r = await api(`/master/products/batch-zip?headOfficeId=${headOfficeId}`, {
            method: "POST",
            body: fd,
            isForm: true
          });
          
          setUploadResult(r);
          await loadProducts(headOfficeId);
        }} />

        {uploadResult ? (
          <div style={{ marginTop: 12 }}>
            <div className="small">
              성공: {uploadResult.inserted}건 / 실패: {uploadResult.failed?.length || 0}건
            </div>
            {!!uploadResult.failed?.length && (
              <div className="small" style={{ marginTop: 8 }}>
                {uploadResult.failed.slice(0, 10).map((f, i) => (
                  <div key={i}>Row {f.rowIndex}: {f.error}</div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
