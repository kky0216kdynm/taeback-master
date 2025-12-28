import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../utils/api";
import Table from "../components/Table";
import Modal from "../components/Modal";

export default function Stores({ selectedHeadOffice }) {
  const [headOffices, setHeadOffices] = useState([]);
  const [headOfficeId, setHeadOfficeId] = useState("");
  const [stores, setStores] = useState([]);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [openAdd, setOpenAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    status: "ACTIVE",
  });

  const fileRef = useRef(null);

  const selectedHead = useMemo(() => {
    const idNum = Number(headOfficeId);
    return headOffices.find((h) => Number(h.id) === idNum) || null;
  }, [headOffices, headOfficeId]);

  async function loadHeadOffices() {
    const r = await api.get("/master/head-offices");
    if (r?.success) setHeadOffices(r.headOffices || []);
  }

  async function loadStores(hoId) {
    if (!hoId) return;
    setLoading(true);
    try {
      const r = await api.get("/master/stores", { headOfficeId: hoId });
      if (r?.success) setStores(r.stores || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHeadOffices();
  }, []);

  // ✅ HeadOffices에서 넘어온 selectedHeadOffice가 있으면 자동 선택
  useEffect(() => {
    if (selectedHeadOffice?.id) {
      setHeadOfficeId(String(selectedHeadOffice.id));
    }
  }, [selectedHeadOffice?.id]);

  useEffect(() => {
    if (headOfficeId) loadStores(headOfficeId);
  }, [headOfficeId]);

  const columns = useMemo(
    () => [
      { key: "headOfficeName", label: "본사", width: 180 },
      { key: "name", label: "가맹점명", width: 240 },
      { key: "phone", label: "연락처", width: 180 },
      {
        key: "auth_code",
        label: "인증코드",
        width: 180,
        render: (row) => (
          <span
            style={{
              display: "inline-block",
              padding: "6px 10px",
              borderRadius: 10,
              background: "#F3F4F6",
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            {row.auth_code || "-"}
          </span>
        ),
      },
      {
        key: "status",
        label: "상태",
        width: 120,
        render: (row) => (
          <span
            style={{
              display: "inline-block",
              padding: "6px 10px",
              borderRadius: 999,
              fontWeight: 700,
              background:
                row.status === "ACTIVE"
                  ? "#DCFCE7"
                  : row.status === "SOLD_OUT"
                  ? "#FEE2E2"
                  : "#E5E7EB",
              color:
                row.status === "ACTIVE"
                  ? "#166534"
                  : row.status === "SOLD_OUT"
                  ? "#991B1B"
                  : "#374151",
            }}
          >
            {row.status === "ACTIVE" ? "활성" : row.status === "INACTIVE" ? "비활성" : row.status}
          </span>
        ),
      },
      {
        key: "_actions",
        label: "관리",
        width: 140,
        render: (row) => (
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="iconBtn" title="수정" onClick={() => alert("수정 기능은 다음 단계에서 연결할게요.")}>
              ✏️
            </button>
            <button
              className="iconBtn danger"
              title="삭제"
              onClick={() => alert("삭제 기능은 다음 단계에서 연결할게요.")}
            >
              🗑️
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const tableRows = useMemo(() => {
    const headName = selectedHead?.name || "";
    return (stores || []).map((s) => ({
      ...s,
      headOfficeName: headName,
    }));
  }, [stores, selectedHead]);

  async function onAddStore() {
    if (!headOfficeId) return alert("먼저 본사를 선택하세요.");
    if (!form.name.trim()) return alert("가맹점명을 입력하세요.");

    const payload = {
      headOfficeId: Number(headOfficeId),
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      status: form.status || "ACTIVE",
    };

    const r = await api.post("/master/stores", payload);
    if (!r?.success) {
      alert(r?.message || "가맹점 추가 실패");
      return;
    }

    setOpenAdd(false);
    setForm({ name: "", phone: "", status: "ACTIVE" });
    loadStores(headOfficeId);
  }

  async function onUploadExcel(file) {
    if (!headOfficeId) return alert("먼저 본사를 선택하세요.");

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const r = await api.postForm("/master/stores/upload", fd);
      if (!r?.success) {
        alert(r?.message || "업로드 실패");
        return;
      }

      alert(`업로드 완료! inserted=${r.inserted}, failed=${r.failed?.length || 0}`);
      loadStores(headOfficeId);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="page">
      {/* ✅ 상단 “탭” 느낌의 빠른 이동(일단 UI만; 실제 route 이동은 다음 단계에서 App/Layout로 묶는게 정석) */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <button className="btn btnGhost" type="button" onClick={() => window.location.reload()}>
          본사 관리
        </button>
        <button className="btn" type="button">
          가맹점 관리
        </button>
      </div>

      {/* 상단 헤더 */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#6B7280", fontWeight: 700 }}>
            <span style={{ cursor: "pointer" }} onClick={() => setHeadOfficeId("")}>
              ←
            </span>
            <span style={{ cursor: "pointer" }} onClick={() => setHeadOfficeId("")}>
              본사 목록으로
            </span>
          </div>

          <h1 style={{ marginTop: 8, marginBottom: 6 }}>
            {selectedHead ? `${selectedHead.name} - 가맹점 관리` : "가맹점 관리"}
          </h1>
          <div style={{ color: "#6B7280", fontWeight: 600 }}>
            {selectedHead ? `본사코드: ${selectedHead.code}` : "본사를 선택한 뒤 가맹점을 관리합니다."}
          </div>
        </div>

        {/* 우측 컨트롤: 본사 선택 */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select
            value={headOfficeId}
            onChange={(e) => setHeadOfficeId(e.target.value)}
            className="select"
            style={{ minWidth: 220 }}
          >
            <option value="">본사 선택</option>
            {headOffices.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ height: 18 }} />

      {/* 섹션 타이틀 + 버튼들 */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h2 style={{ margin: 0 }}>가맹점 관리</h2>
          <div style={{ marginTop: 6, color: "#6B7280", fontWeight: 600 }}>가맹점 정보를 관리합니다</div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUploadExcel(f);
            }}
          />
          <button
            className="btn btnOutline"
            disabled={!headOfficeId || uploading}
            onClick={() => fileRef.current?.click()}
            title="엑셀 업로드"
          >
            ⬆️ 엑셀 업로드
          </button>

          <button className="btn" disabled={!headOfficeId} onClick={() => setOpenAdd(true)}>
            ＋ 가맹점 추가
          </button>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="card">
        <Table
          columns={columns}
          rows={tableRows}
          emptyText={headOfficeId ? (loading ? "불러오는 중..." : "가맹점이 없습니다.") : "본사를 선택하세요."}
        />
      </div>

      <Modal open={openAdd} onClose={() => setOpenAdd(false)} title="가맹점 추가">
        <div style={{ display: "grid", gap: 12 }}>
          <div className="field">
            <div className="label">가맹점명</div>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="예) 강남점"
            />
          </div>

          <div className="field">
            <div className="label">연락처(선택)</div>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="예) 02-1234-5678"
            />
          </div>

          <div className="field">
            <div className="label">상태</div>
            <select
              className="select"
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="ACTIVE">활성</option>
              <option value="INACTIVE">비활성</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
            <button className="btn btnGhost" onClick={() => setOpenAdd(false)}>
              취소
            </button>
            <button className="btn" onClick={onAddStore}>
              저장
            </button>
          </div>

          <div style={{ color: "#6B7280", fontSize: 13, marginTop: 4 }}>
            ※ 가맹점 “인증코드”는 저장 시 서버에서 자동 생성되어 DB에 들어갑니다.
          </div>
        </div>
      </Modal>
    </div>
  );
}
