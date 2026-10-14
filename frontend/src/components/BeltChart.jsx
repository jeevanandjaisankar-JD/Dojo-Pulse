import React from 'react';

const BELTS = [
  ['white', '#CBD5E1'], ['yellow', '#FACC15'], ['orange', '#FB923C'], ['green', '#10B981'],
  ['blue', '#3B82F6'], ['purple', '#A855F7'], ['brown', '#A16207'], ['red', '#E63946'], ['black', '#1E293B'],
];

export const beltColor = (name = '') => {
  const n = String(name).toLowerCase();
  return (BELTS.find(([k]) => n.includes(k)) || [null, '#94A3B8'])[1];
};

export function BeltBadge({ belt }) {
  if (!belt) return <span className="text-sm text-[#94A3B8]">—</span>;
  const c = beltColor(belt);
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold capitalize text-[#0F172A]"
      style={{ borderColor: `${c}66`, background: `${c}22` }}
    >
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
      {belt}
    </span>
  );
}

/** data: [{ label, value }] — horizontal bars. */
export default function BeltChart({ data = [], loading = false, title = 'Belt distribution', colorByBelt = true }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="card h-full">
      <h3 className="text-lg font-bold">{title}</h3>
      <div className="mt-6 space-y-4">
        {loading && [0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-6 w-full" />)}
        {!loading && data.length === 0 && <p className="py-6 text-center text-sm text-[#64748B]">No data available yet.</p>}
        {!loading &&
          data.map((d) => (
            <div key={d.label}>
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="font-medium capitalize">{d.label}</span>
                <span className="text-[#64748B]">{Number.isInteger(d.value) ? d.value : d.value.toFixed(1)}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#EEF2F7]">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(d.value / max) * 100}%`, background: colorByBelt ? beltColor(d.label) : '#2563EB' }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
