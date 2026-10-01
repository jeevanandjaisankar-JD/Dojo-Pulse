import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, FileSpreadsheet, Loader2, UploadCloud, X } from 'lucide-react';
import { getUploadHistory, uploadDojoFile } from '../services/api';
import { toList, fmtDate, fmtVal } from '../components/StatCard';

export default function DataUpload() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      setHistory(toList(await getUploadHistory(), 'history', 'uploads'));
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const pick = (f) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setMessage({ type: 'error', text: 'Please choose a .csv file.' });
      return;
    }
    setMessage(null);
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    pick(e.dataTransfer.files?.[0]);
  };

  const submit = async () => {
    if (!file) return;
    setUploading(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append('file', file);
      await uploadDojoFile(form);
      setMessage({ type: 'success', text: `${file.name} uploaded successfully.` });
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
      await loadHistory();
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message ?? err?.response?.data?.detail ?? 'Upload failed. Check the file and try again.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 pb-28 sm:p-6 md:pb-8 lg:p-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Upload dojo data</h1>
        <p className="mt-1 text-[#64748B]">Drop a CSV export to update student progress.</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center gap-3 rounded-[20px] border-2 border-dashed px-6 py-14 text-center transition-colors duration-200 ${
          dragging ? 'border-[#2563EB] bg-[#EAF2FF]' : 'border-[#C9D6EA] bg-white hover:border-[#2563EB] hover:bg-[#F4F8FF]'
        }`}
      >
        <input ref={inputRef} type="file" accept=".csv" hidden onChange={(e) => pick(e.target.files?.[0])} />
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF2FF] text-[#2563EB]"><UploadCloud size={28} /></span>
        <p className="text-lg font-bold">Drag and drop your CSV here</p>
        <p className="text-sm text-[#64748B]">or click to browse files</p>
      </div>

      {file && (
        <div className="card flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <FileSpreadsheet className="shrink-0 text-[#10B981]" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{file.name}</p>
              <p className="text-xs text-[#64748B]">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setFile(null)} className="btn-ghost" aria-label="Remove file"><X size={16} /></button>
            <button type="button" onClick={submit} disabled={uploading} className="btn-primary">
              {uploading ? <><Loader2 size={16} className="animate-spin" /> Uploading</> : 'Upload file'}
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
          message.type === 'success' ? 'border-[#10B981]/30 bg-[#E3F7EF] text-[#047857]' : 'border-[#E63946]/30 bg-[#FDECEE] text-[#B91C1C]'
        }`}>
          {message.type === 'success' && <CheckCircle2 size={16} />} {message.text}
        </div>
      )}

      <div className="card overflow-hidden p-0">
        <h3 className="px-6 pt-6 text-lg font-bold">Upload history</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-y border-[#E6EBF2] bg-[#F8FAFC] text-[#64748B]">
              <tr>
                <th className="px-6 py-3 font-semibold">File</th>
                <th className="px-6 py-3 font-semibold">Uploaded</th>
                <th className="px-6 py-3 font-semibold">Records</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingHistory && [0, 1, 2].map((i) => (
                <tr key={i}><td colSpan={4} className="px-6 py-3"><div className="skeleton h-6 w-full" /></td></tr>
              ))}
              {!loadingHistory && history.map((h, i) => {
                const records = h.records ?? h.rows ?? h.row_count ?? h.rowCount ?? h.records_processed;
                return (
                  <tr key={h.id ?? h._id ?? i} className="border-b border-[#E6EBF2] last:border-0 hover:bg-[#F4F8FF]">
                    <td className="px-6 py-3 font-semibold">{h.filename ?? h.file_name ?? h.fileName ?? h.name ?? '—'}</td>
                    <td className="px-6 py-3 text-[#64748B]">{fmtDate(h.uploaded_at ?? h.uploadedAt ?? h.created_at ?? h.createdAt ?? h.date)}</td>
                    <td className="px-6 py-3 text-[#64748B]">{records == null ? '—' : fmtVal(records)}</td>
                    <td className="px-6 py-3">
                      {h.status ? (
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          /fail|error/i.test(h.status) ? 'bg-[#FDECEE] text-[#B91C1C]' : 'bg-[#E3F7EF] text-[#047857]'
                        }`}>{h.status}</span>
                      ) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {!loadingHistory && history.length === 0 && (
          <p className="py-12 text-center text-sm text-[#64748B]">No uploads yet. Your uploaded files will appear here.</p>
        )}
      </div>
    </div>
  );
}
