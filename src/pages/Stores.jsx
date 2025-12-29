import React, { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import Table from "../components/Table";
import Modal from "../components/Modal";
import FileDrop from "../components/FileDrop";
import Select from "../components/Select";

const MASTER_KEY = import.meta.env.VITE_MASTER_KEY || "";
function k() {
  return { headers: { "x-master-key": MASTER_KEY } };
}

export default function Stores() {
  const [headOffices, setHeadOffices] = useState([]);
  const [headOfficeId, setHeadOfficeId] = useState("");
  const [stores, setStores] = useState([]);

  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);

  // 업로드 모달/결과 (Products랑 동일)
  const [openUpload, setOpenUpload] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    status: "ACTIVE",
  });

  const selectedHead = useMemo(() => {
    const idNum = Number(headOfficeId);
    return headOffices.find((h) => Number(h.id) === idNum) || null;
  }, [headOffices, headOfficeId]);

  const headOfficeOptions = useMemo(
    () => headOffices.map((h) => ({ value: String(h.id), label: `${h.name} (${h.code})` })),
    [headOffices]
  );

  async function loadHeadOffices() {
    const r = await api.get("/master/head-offices", null, k());
    if (r?.success) {
      const hos = r.headOffices || [];
      setHeadOffices(hos);
      if (!headOfficeId && hos[0]) setHeadOfficeId(String(hos[0].id)); // Products처럼 첫 본사 자동 선택
    } else {
      console.warn("loadHeadOffices failed:", r);
    }
  }

  async function loadStores(hoId) {
    if (!hoId) return;
    setLoading(true);
    try {
      const r = await api.get(`/master/stores?headOfficeId=${encodeURIComponent(hoId)}`, null, k());
      if (r?.success) setStores(r.stores || []);
      else setStores([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHeadOffices().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (headOfficeId) loadStores(headOfficeId).catch(console.error);
  }, [headOfficeId]);

  const columns = useMemo(
    () => [
      { key: "headOfficeName", label: "본사", width: 180 },
      { key: "name", label: "가맹점명", width: 240 },
      {
        key: "phone",
        label: "연락처",
        width: 180,
        render: (row) => row.phone || "-",
      },
      {
        key: "merchant_code",
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
            {row.merchant_code || "-"}
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
              background: row.status === "ACTIVE" ? "#DCFCE7" : "#E5E7EB",
              color: row.status === "ACTIVE" ? "#166534" : "#374151",
            }}
          >
            {row.status === "ACTIVE" ? "활성" : "비활성"}
          </span>
        ),
      },
      {
        key: "_actions",
        label: "관리",
        width: 140,
        render: () => (
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="iconBtn" title="수정" onClick={() => alert("수정 기능은 다음 단계에서 연결할게요.")}>
              ✏️
            </button>
            <button className="iconBtn danger" title="삭제" onClick={() => alert("삭제 기능은 다음 단계에서 연결할게요.")}>
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
    return (stores || []).map((s) => ({ ...s, headOfficeName: headName }));
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

    const r = await api.post("/master/stores", payload, k());
    if (!r?.success) {
      alert(r?.message || "가맹점 추가 실패");
      console.warn("onAddStore failed:", r);
      return;
    }

    setOpenAdd(false);
    setForm({ name: "", phone: "", status: "ACTIVE" });
    await loadStores(headOfficeId);
  }

  async function onUploadExcel(file) {
    if (!headOfficeId) return alert("먼저 본사를 선택하세요.");

    const fd = new FormData();
    fd.append("file", file);

    const r = await api.postForm("/master/stores/upload", fd, k());
    setUploadResult(r);

    if (!r?.success) {
      alert(r?.message || "업로드 실패");
      console.warn("upload failed:", r);
      return;
    }

    await loadStores(headOfficeId);
  }

  return (
    <div className="page">
      <h1 className="h1">{selectedHead ? `${selectedHead.name} - 가맹점 관리` : "가맹점 관리"}</h1>
      <div className="sub">
        {selectedHead ? (
          <>
            본사코드: <span style={{ fontWeight: 900 }}>{selectedHead.code}</span>
          </>
        ) : (
          "본사를 선택한 뒤 가맹점을 관리합니다."
        )}
      </div>

      {/* ✅ Products랑 동일 레이아웃: 왼쪽 Select + 설명, 오른쪽 버튼들 */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginTop: 16 }}>
        <div style={{ width: 420 }}>
          <Select
            value={headOfficeId}
            onChange={setHeadOfficeId} // Products 스타일처럼 value string 직접 세팅
            options={headOfficeOptions}
            placeholder="본사 선택"
          />
          <div className="small" style={{ marginTop: 6 }}>
            엑셀 업로드 컬럼: head_office_code, store_name, address(선택), phone(선택), status(선택)
          </div>
        </div>

        <div className="actions" style={{ display: "flex", gap: 10 }}>
          <button
            className="btnGhost btn"
            disabled={!headOfficeId}
            onClick={() => {
              setUploadResult(null);
              setOpenUpload(true);
            }}
          >
            엑셀 업로드
          </button>

          <button className="btn" disabled={!headOfficeId} onClick={() => setOpenAdd(true)}>
            ＋ 가맹점 추가
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16 }} className="card">
        <Table
          columns={columns}
          rows={tableRows}
          emptyText={headOfficeId ? (loading ? "불러오는 중..." : "가맹점이 없습니다.") : "본사를 선택하세요."}
        />
      </div>

      {/* ✅ 업로드 모달 (Products랑 동일 UX) */}
      <Modal title="가맹점 엑셀 업로드" open={openUpload} onClose={() => setOpenUpload(false)}>
        <FileDrop
          onFile={async (file) => {
            await onUploadExcel(file);
          }}
        />

        {uploadResult ? (
          <div style={{ marginTop: 12 }}>
            {uploadResult.success ? (
              <>
                <div className="small">
                  성공: {uploadResult.inserted}건 / 실패: {uploadResult.failed?.length || 0}건
                </div>
                {!!uploadResult.failed?.length && (
                  <div className="small" style={{ marginTop: 8 }}>
                    {uploadResult.failed.slice(0, 10).map((f, i) => (
                      <div key={i}>
                        Row {f.rowIndex}: {f.error}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="small">업로드 실패: {uploadResult.message || "알 수 없는 오류"}</div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* ✅ 추가 모달 */}
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
            <select className="select" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
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
            ※ “인증코드(merchant_code)”는 저장 시 서버에서 자동 생성됩니다.
          </div>
        </div>
      </Modal>
    </div>
  );
}
