import React, { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";
import Modal from "../components/Modal";

const MASTER_KEY = import.meta.env.VITE_MASTER_KEY || "";
function k() {
  return { headers: { "x-master-key": MASTER_KEY } };
}

export default function HeadOffices({ onOpenStores }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 모달/폼
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    manager_name: "",
    phone: "",
  });

  const title = useMemo(() => (editing ? "본사 수정" : "본사 추가"), [editing]);

  async function fetchList() {
    setLoading(true);
    const r = await api.get("/master/head-offices", null, k());
    setLoading(false);
    if (r?.success) setItems(r.headOffices || []);
    else alert(r?.message || r?.error || "불러오기 실패");
  }

  useEffect(() => {
    fetchList();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", manager_name: "", phone: "" });
    setOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setForm({
      name: row.name || "",
      manager_name: row.manager_name || "",
      phone: row.phone || "",
    });
    setOpen(true);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return alert("본사명을 입력하세요.");

    if (!editing) {
      const r = await api.post(
        "/master/head-offices",
        {
          name: form.name.trim(),
          manager_name: form.manager_name.trim(),
          phone: form.phone.trim(),
        },
        k()
      );
      if (r?.success) {
        setOpen(false);
        fetchList();
      } else alert(r?.message || r?.error || "추가 실패");
    } else {
      const r = await api.patch(
        `/master/head-offices/${editing.id}`,
        {
          name: form.name.trim(),
          manager_name: form.manager_name.trim(),
          phone: form.phone.trim(),
        },
        k()
      );
      if (r?.success) {
        setOpen(false);
        fetchList();
      } else alert(r?.message || r?.error || "수정 실패");
    }
  }

  async function onDelete(row) {
    if (!confirm(`"${row.name}" 본사를 삭제할까요?\n(본사에 가맹점이 있으면 삭제가 실패할 수 있어요)`)) return;
    const r = await api.del(`/master/head-offices/${row.id}`, k());
    if (r?.success) fetchList();
    else alert(r?.message || r?.error || "삭제 실패");
  }

  function onClickStoreCount(row) {
    if (typeof onOpenStores === "function") {
      onOpenStores({ id: row.id, name: row.name });
    }
  }

  return (
    <div className="page">
      {/* ✅ 공통 타이틀 영역 (Stores/Products와 동일) */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>
        <div>
          <h1 className="h1" style={{ margin: 0 }}>본사 관리</h1>
          <div className="sub">각 본사 정보를 관리합니다</div>
        </div>

        <div className="actions" style={{ display: "flex", gap: 10 }}>
          <button className="btn" onClick={openCreate}>
            ＋ 본사 추가
          </button>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* ✅ 카드/테이블 영역도 다른 페이지와 톤 맞춤 */}
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#fafafa" }}>
            <tr>
              <th style={th}>본사명</th>
              <th style={th}>담당자</th>
              <th style={th}>연락처</th>
              <th style={th}>가맹점 수</th>
              <th style={th}>본사 코드</th>
              <th style={{ ...th, textAlign: "right" }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td style={td} colSpan={6}>
                  불러오는 중...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td style={td} colSpan={6}>
                  본사가 없습니다.
                </td>
              </tr>
            ) : (
              items.map((row) => (
                <tr key={row.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={td}>{row.name}</td>
                  <td style={td}>{row.manager_name || "-"}</td>
                  <td style={td}>{row.phone || "-"}</td>

                  <td style={td}>
                    <button type="button" onClick={() => onClickStoreCount(row)} style={linkBtn}>
                      {(row.store_count ?? 0) + "개"} <span style={chev}>›</span>
                    </button>
                  </td>

                  <td style={td}>
                    <span style={pill}>{row.code}</span>
                  </td>

                  <td style={{ ...td, textAlign: "right" }}>
                    <button onClick={() => openEdit(row)} style={iconBtn}>
                      ✏️
                    </button>
                    <button onClick={() => onDelete(row)} style={{ ...iconBtn, color: "#d11" }}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ 모달도 공통 Modal 컴포넌트로 통일 (레이아웃 흔들림 방지) */}
      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <div className="field">
            <div className="label">본사명 *</div>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>

          <div className="field">
            <div className="label">담당자</div>
            <input
              className="input"
              value={form.manager_name}
              onChange={(e) => setForm((p) => ({ ...p, manager_name: e.target.value }))}
            />
          </div>

          <div className="field">
            <div className="label">연락처</div>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
            />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
            <button type="button" className="btn btnGhost" onClick={() => setOpen(false)}>
              취소
            </button>
            <button type="submit" className="btn">
              {editing ? "수정" : "추가"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const th = { textAlign: "left", padding: "14px 16px", fontSize: 14, color: "#444" };
const td = { padding: "16px", fontSize: 15 };

const pill = { padding: "6px 10px", background: "#f2f3f5", borderRadius: 10, fontWeight: 700 };

const linkBtn = {
  background: "transparent",
  border: 0,
  padding: 0,
  cursor: "pointer",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const chev = { fontSize: 18, lineHeight: 1, opacity: 0.6 };

const iconBtn = {
  border: "1px solid #e5e5e5",
  background: "#fff",
  borderRadius: 10,
  padding: "8px 10px",
  cursor: "pointer",
  marginLeft: 8,
};
