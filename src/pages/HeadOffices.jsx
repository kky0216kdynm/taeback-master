import React, { useEffect, useMemo, useState } from "react";
import { api } from "../utils/api";

const MASTER_KEY = import.meta.env.VITE_MASTER_KEY || "";

function k() {
  return { headers: { "x-master-key": MASTER_KEY } };
}

export default function HeadOffices() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 모달/폼
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // row or null
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
      // CREATE
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
      // UPDATE
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
    if (
      !confirm(
        `"${row.name}" 본사를 삭제할까요?\n(해당 본사 가맹점/상품이 있으면 실패하도록 하는게 안전합니다)`
      )
    )
      return;
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
    <div style={{ padding: 24 }}>
     
        <div>
          <h1 style={{ margin: 0, fontSize: 28 }}>본사 관리</h1>
          <div style={{ color: "#666", marginTop: 6 }}>각 본사 정보를 관리합니다</div>
        </div>

        {/* ✅ 본사 추가 버튼 */}
        <button
          onClick={openCreate}
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          + 본사 추가
        </button>
      </div>

      <div style={{ border: "1px solid #e8e8e8", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#fafafa" }}>
            <tr>
              <th style={th}>본사명</th>
              <th style={th}>담당자</th>
              <th style={th}>연락처</th>

              {/* ✅ 피그마처럼 "가맹점 수" 컬럼 추가 */}
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

                  {/* ✅ 가맹점 수: "5개 ›" */}
                  <td style={td}>
                    <button type="button" onClick={() => onClickStoreCount(row)} style={linkBtn}>
                      {(row.store_count ?? 0) + "개"} <span style={chev}>›</span>
                    </button>
                  </td>

                  <td style={td}>
                    <span style={pill}>{row.code}</span>
                  </td>

                  <td style={{ ...td, textAlign: "right" }}>
                    {/* ✅ 수정/삭제 */}
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

      {/* 간단 모달 */}
      {open && (
        <div style={backdrop}>
          <div style={modal}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{title}</div>
              <button onClick={() => setOpen(false)} style={iconBtn}>
                ✕
              </button>
            </div>

            <form onSubmit={onSubmit} style={{ marginTop: 16, display: "grid", gap: 12 }}>
              <label style={label}>
                본사명 *
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  style={input}
                />
              </label>

              <label style={label}>
                담당자
                <input
                  value={form.manager_name}
                  onChange={(e) => setForm((p) => ({ ...p, manager_name: e.target.value }))}
                  style={input}
                />
              </label>

              <label style={label}>
                연락처
                <input
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  style={input}
                />
              </label>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
                <button type="button" onClick={() => setOpen(false)} style={btnGhost}>
                  취소
                </button>
                <button type="submit" style={btnPrimary}>
                  {editing ? "수정" : "추가"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
};

const modal = {
  width: 520,
  maxWidth: "100%",
  background: "#fff",
  borderRadius: 16,
  padding: 18,
};

const label = { display: "grid", gap: 6, fontSize: 14, color: "#333" };
const input = {
  height: 44,
  borderRadius: 12,
  border: "1px solid #ddd",
  padding: "0 12px",
  fontSize: 15,
};

const btnPrimary = {
  height: 44,
  padding: "0 16px",
  borderRadius: 12,
  border: "1px solid #111",
  background: "#111",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const btnGhost = {
  height: 44,
  padding: "0 16px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};
