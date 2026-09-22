import React, { useState, useEffect } from 'react';
import { uploadDojoFile, getUploadHistory } from '../services/api';
import {
  UploadCloud,
  FileSpreadsheet,
  History,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Award,
  Code2
} from 'lucide-react';

const DataUpload = () => {
  const [file, setFile] = useState(null);
  const [slotNumber, setSlotNumber] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [latestSummary, setLatestSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    try {
      const data = await getUploadHistory();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error('Failed to load upload history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a CSV file to upload.' });
      return;
    }

    setUploading(true);
    setMessage(null);
    setLatestSummary(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('slotNumber', String(slotNumber));

    try {
      const res = await uploadDojoFile(formData);
      if (res.success) {
        setMessage({
          type: 'success',
          text: `File "${file.name}" uploaded successfully and processed with Python Pandas belt cleaner!`
        });
        setLatestSummary(res.summary);
        setFile(null);
        fetchHistory();
      } else {
        setMessage({ type: 'error', text: res.message || 'File upload failed.' });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Server error while processing CSV file.'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Dojo Evaluations Upload & Ingestion
        </h1>
        <p className="text-sm text-slate-400">
          Upload test slot CSV files to clean with Python Pandas and update student belt progressions
        </p>
      </div>

      {/* Upload Action Card */}
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <UploadCloud className="w-5 h-5 text-rose-500" />
          <h2 className="text-lg font-bold text-white">Upload New Evaluations CSV</h2>
        </div>

        <div className="mb-6 p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 space-y-1.5">
          <span className="font-semibold text-white block">Expected CSV Format (Kalvium Dojo Structure):</span>
          <code className="text-rose-400 block font-mono bg-slate-900 p-2 rounded border border-slate-800">
            id, workout_slug, belt_level, verified_belt_level, workout_updated_at, email
          </code>
          <p className="text-slate-400">
            Supports CSV, XLS, and XLSX files across <span className="text-slate-200">python, nodejs, java, and cpp</span>. Same-day multiple attempts automatically group into daily progression.
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Latest Cleaning Results Banner */}
        {latestSummary && (
          <div className="p-5 rounded-xl bg-slate-950/80 border border-emerald-500/30 mb-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Pandas Belt Cleaner Results
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Students</span>
                <p className="text-xl font-extrabold text-white">{latestSummary.totalStudents || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Slots Evaluated</span>
                <p className="text-xl font-extrabold text-white">{latestSummary.totalSlotsEvaluated || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Improved</span>
                <p className="text-xl font-extrabold text-emerald-400">{latestSummary.improved || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Not Improved</span>
                <p className="text-xl font-extrabold text-amber-400">{latestSummary.notImproved || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Belts Earned</span>
                <p className="text-xl font-extrabold text-rose-400">+{latestSummary.totalBeltsEarned || 0}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-6">
          <label className="block max-w-xs">
            <span className="block mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300">Test round number</span>
            <input
              type="number"
              min="1"
              value={slotNumber}
              onChange={(event) => setSlotNumber(Math.max(1, Number(event.target.value) || 1))}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
            />
          </label>

          {/* File Drag and Drop Zone */}
          <div className="relative border-2 border-dashed border-slate-700 hover:border-rose-500/50 rounded-2xl p-8 text-center bg-slate-950/40 transition-colors">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-rose-400 shadow-md">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {file ? file.name : 'Click or drag Dojo evaluation CSV here'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports CSV, XLS, and XLSX evaluation sheets (Max: 25MB)
                </p>
              </div>
              {file && (
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Ready to process: {(file.size / 1024).toFixed(1)} KB
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-sm shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            {uploading ? 'Processing with Python Pandas...' : 'Upload & Clean Evaluations CSV'}
          </button>
        </form>
      </div>

      {/* Previous Upload History Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold text-white">Upload History Logs</h3>
          </div>
          <span className="text-xs text-slate-400">
            Recorded audit logs of file uploads
          </span>
        </div>

        <div className="overflow-x-auto">
          {loadingHistory ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Loading upload history...
            </div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No files uploaded yet.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Filename</th>
                  <th className="px-5 py-3.5">Uploaded By</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Rows / Slots</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <FileSpreadsheet className="w-4 h-4 text-rose-400 shrink-0" />
                        <span className="font-semibold text-white truncate max-w-xs" title={item.originalName || item.filename}>
                          {item.originalName || item.filename}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-300">
                      {item.uploadedBy?.name || 'Aravind'}
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-400 flex items-center gap-1.5 pt-5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(item.createdAt || item.uploadedAt || Date.now()).toLocaleString()}
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-white">
                      {item.rowsProcessed || item.summary?.totalStudents || 0} slots
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          item.status === 'COMPLETED'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : item.status === 'FAILED'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {item.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataUpload;
