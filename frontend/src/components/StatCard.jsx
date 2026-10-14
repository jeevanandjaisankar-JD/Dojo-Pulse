import React from 'react';

/* ---------- shared data helpers (used across pages) ---------- */
export const unwrap = (res) => res?.data ?? res;

export const toList = (data, ...keys) => {
  const d = unwrap(data);
  if (Array.isArray(d)) return d;
  for (const k of [...keys, 'data', 'items', 'results', 'rows']) {
    if (Array.isArray(d?.[k])) return d[k];
  }
  return [];
};

export const humanize = (key = '') =>
  String(key).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

export const fmtVal = (v) => {
  if (typeof v === 'number') return Number.isInteger(v) ? v.toLocaleString() : v.toFixed(1);
  return String(v);
};

export const fmtDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? String(v)
    : d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

export const fmtTime = (v) => {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
};

export const isToday = (v) => {
  const d = new Date(v);
  return !Number.isNaN(d.getTime()) && d.toDateString() === new Date().toDateString();
};

// Turns arrays/objects returned by the API into [{ label, value }] for charts.
export const toPairs = (src) => {
  if (!src || typeof src !== 'object') return [];
  const rows = Array.isArray(src)
    ? src
    : Object.entries(src).map(([k, v]) => (v && typeof v === 'object' ? { label: k, ...v } : { label: k, value: v }));
  return rows
    .map((r) => {
      if (!r || typeof r !== 'object') return null;
      const label = r.label ?? r.language ?? r.name ?? r.belt ?? r.lang ?? r.week ?? r.title;
      const value =
        r.value ?? r.average ?? r.avg ?? r.score ?? r.count ?? r.total ?? Object.values(r).find((v) => typeof v === 'number');
      return label != null && typeof value === 'number' ? { label: String(label), value } : null;
    })
    .filter(Boolean);
};

export const TONES = {
  blue: 'bg-[#EAF2FF] text-[#2563EB]',
  red: 'bg-[#FDECEE] text-[#E63946]',
  green: 'bg-[#E3F7EF] text-[#10B981]',
  amber: 'bg-[#FEF3DC] text-[#D97706]',
};

/* ---------- StatCard ---------- */
export default function StatCard({ icon: Icon, label, value, hint, tone = 'blue', loading = false }) {
  return (
    <div className="card card-hover">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-[#64748B]">{label}</p>
        {Icon && (
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONES[tone] || TONES.blue}`}>
            <Icon size={20} />
          </span>
        )}
      </div>
      {loading ? (
        <div className="skeleton mt-4 h-9 w-24" />
      ) : (
        <p className="mt-3 text-3xl font-extrabold tracking-tight">{value ?? '—'}</p>
      )}
      {hint && !loading && <p className="mt-1 text-xs text-[#64748B]">{hint}</p>}
    </div>
  );
}
