import React, { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { getImprovementsAnalytics } from '../services/api';
import StatCard, { unwrap, toPairs, humanize, fmtVal } from '../components/StatCard';
import BeltChart from '../components/BeltChart';

const TONE_CYCLE = ['blue', 'green', 'amber', 'red'];
const isPrimitive = (v) => typeof v === 'number' || (typeof v === 'string' && v.length < 24);

function DataTable({ title, rows }) {
  const cols = Object.keys(rows[0] || {}).filter((k) => isPrimitive(rows[0][k])).slice(0, 6);
  if (cols.length === 0) return null;
  return (
    <div className="card overflow-hidden p-0">
      <h3 className="px-6 pt-6 text-lg font-bold">{title}</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="border-y border-[#E6EBF2] bg-[#F8FAFC] text-[#64748B]">
            <tr>{cols.map((c) => <th key={c} className="px-6 py-3 font-semibold">{humanize(c)}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-[#E6EBF2] last:border-0 hover:bg-[#F4F8FF]">
                {cols.map((c) => <td key={c} className="px-6 py-3">{r[c] == null ? '—' : typeof r[c] === 'number' ? fmtVal(r[c]) : r[c]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Improvements() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    getImprovementsAnalytics()
      .then((res) => alive && setData(unwrap(res)))
      .catch(() => alive && setError('Could not load improvement analytics.'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const entries = Object.entries(data && typeof data === 'object' && !Array.isArray(data) ? data : { improvements: data || [] });
  const tiles = entries.filter(([, v]) => isPrimitive(v));
  const groups = entries.filter(([, v]) => v && typeof v === 'object');

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 pb-28 sm:p-6 md:pb-8 lg:p-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Improvements</h1>
        <p className="mt-1 text-[#64748B]">See how students are progressing over time.</p>
      </div>

      {error && <div className="rounded-2xl border border-[#E63946]/30 bg-[#FDECEE] px-4 py-3 text-sm text-[#B91C1C]">{error}</div>}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <StatCard key={i} loading label="Loading" icon={TrendingUp} />)}
        </div>
      ) : (
        <>
          {tiles.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {tiles.map(([k, v], i) => (
                <StatCard key={k} label={humanize(k)} value={fmtVal(v)} icon={TrendingUp} tone={TONE_CYCLE[i % 4]} />
              ))}
            </div>
          )}
          <div className="grid gap-6 lg:grid-cols-2">
            {groups.map(([k, v]) => {
              const pairs = toPairs(v);
              if (pairs.length > 0) return <BeltChart key={k} title={humanize(k)} data={pairs} colorByBelt={false} />;
              if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object')
                return <div key={k} className="lg:col-span-2"><DataTable title={humanize(k)} rows={v} /></div>;
              return null;
            })}
          </div>
          {!error && tiles.length === 0 && groups.every(([, v]) => !v || v.length === 0) && (
            <div className="card py-14 text-center text-sm text-[#64748B]">No improvement data yet. Upload dojo data to see trends.</div>
          )}
        </>
      )}
    </div>
  );
}
