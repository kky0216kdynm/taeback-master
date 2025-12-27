import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import Table from "../components/Table.jsx";
import Modal from "../components/Modal.jsx";
import FileDrop from "../components/FileDrop.jsx";
import Select from "../components/Select.jsx";

export default function Stores() {
  const [headOffices, setHeadOffices] = useState([]);
  const [headOfficeId, setHeadOfficeId] = useState("");
  const [rows, setRows] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const [form, setForm] = useState({ name: "", address: "", phone: "", status: "ACTIVE" });

  useEffect(() => {
    (async () => {
      const r = await api("/master/head-offices");
      const hos = r.headOffices || [];
      setHeadOffices(hos);
      if (hos[0]) setHeadOfficeId(String(hos[0].id));
    })().catch(console.error);
  }, []);

  async function loadStores(hid) {
    if (!hid) return;
    const r = await api(`/master/stores?headOfficeId=${hid}`);
    setRows(r.stores || []);
  }

  useEffect(() => {
    loadStores(headOfficeId).catch(console.error);
  }, [headOfficeId]);

  const headOfficeOptions = useMemo(
    () => headOffices.map((h) => ({ value: String(h.id), label: `${h.name} (${h.code})` })),
    [headOffices]
  );

  const cols = [
    { key: "name", label: "가맹점명" },
    { key: "address", label: "주소" },
    { key: "phone", label: "연락처" },
    {
      key: "auth_code", label: "인증코드",
      render: (r) => <span className="pill pillBlue">{r.auth_code}</span>
    },
    {
      key: "status", label: "상태",
      render: (r) => (
        <span className={`pill ${r.status === "ACTIVE" ? "pillGreen" : "pillRed"}`}>
          {r.status === "ACTIVE" ? "활성" : "비활성"}
        </span>
      )
    }
  ];

  return (
    <div>
      <h1 className="h1">가맹점 관리</h1>
      <div className="sub">본사를 선택하고 가맹점을 등록/업로드합니다</div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 16 }}>
        <div style={{ width: 420 }}>
          <Select
            value={headOfficeId}
            onChange={setHeadOfficeId}
            options={headOfficeOptions}
            placeholder="본사 선택"
          />
          <div className="small" style={{ marginTop: 6 }}>
            엑셀 업로드 컬럼: head_office_code, store_name, address, phone, status
          </div>
        </div>

        <div className="actions">
          <button className="btnGhost btn" onClick={() => { setUploadResult(null); setOpenUpload(true); }}>
            엑셀 업로드
          </button>
          <button className="btnPrimary btn" onClick={() => setOpenAdd(true)}>
            + 가맹점 추가
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <Table columns={cols} rows={rows} />
      </div>

      {/* 추가 */}
      <Modal title="가맹점 추가" open={openAdd} onClose={() => setOpenAdd(false)}>
        <div className="row">
          <div className="label">가맹점명</div>
          <input className="input" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="row">
          <div className="label">주소</div>
          <input className="input" value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="row">
          <div className="label">연락처</div>
          <input className="input" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
          <button className="btn" onClick={() => setOpenAdd(false)}>취소</button>
          <button className="btnPrimary btn" onClick={async () => {
            await api("/master/stores", {
              method: "POST",
              body: { headOfficeId: Number(headOfficeId), ...form }
            });
            setOpenAdd(false);
            setForm({ name: "", address: "", phone: "", status: "ACTIVE" });
            await loadStores(headOfficeId);
          }}>저장</button>
        </div>
      </Modal>

      {/* 업로드 */}
      <Modal title="가맹점 엑셀 업로드" open={openUpload} onClose={() => setOpenUpload(false)}>
        <FileDrop onFile={async (file) => {
          const fd = new FormData();
          fd.append("file", file);
          const r = await api("/master/stores/upload", { method: "POST", body: fd, isForm: true });
          setUploadResult(r);
          await loadStores(headOfficeId);
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
