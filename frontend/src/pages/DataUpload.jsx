import { useEffect, useState } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { uploadDojoFile, getUploadHistory } from "../services/api";

export default function DataUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getUploadHistory();
      if (data.success) setHistory(data.history);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please choose a CSV file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await uploadDojoFile(formData);

      if (res.success) {
        alert("CSV uploaded successfully!");
        setFile(null);
        loadHistory(); // Refresh history
      }
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">
          Upload Dojo Evaluations
        </h1>
        <p className="text-slate-400">
          Upload weekly CSV files and view upload history
        </p>
      </div>

      {/* Upload Card */}
      <div className="bg-[#0F172A] border border-red-500/20 rounded-3xl p-8">
        <div className="border-2 border-dashed border-red-500/30 rounded-2xl p-10 text-center">
          <UploadCloud className="mx-auto text-red-400" size={55} />

          <h2 className="text-2xl font-bold text-white mt-4">
            Drag & Drop CSV File
          </h2>

          <p className="text-slate-400 mt-2">
            Upload the weekly Dojo evaluation CSV
          </p>

          <label className="inline-block mt-6 bg-[#E63946] hover:bg-red-600 text-white px-6 py-3 rounded-xl cursor-pointer font-semibold">
            Choose CSV
            <input
              hidden
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>

          {file && (
            <div className="mt-6 bg-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="text-red-400" />
                <div className="text-left">
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-slate-400 text-xs">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <CheckCircle2 className="text-emerald-400" />
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-6 w-full bg-[#E63946] hover:bg-red-600 disabled:opacity-50 text-white py-3 rounded-xl font-bold"
          >
            {uploading ? "Uploading..." : "Upload & Process CSV"}
          </button>
        </div>
      </div>

      {/* Upload History */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">
            Upload History
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Previously uploaded evaluation files
          </p>
        </div>

        <table className="w-full">
          <thead className="bg-[#07142D]">
            <tr className="text-slate-300 text-left">
              <th className="p-4">File</th>
              <th className="p-4">Date</th>
              <th className="p-4">Records</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-slate-400">
                  No CSV uploaded yet
                </td>
              </tr>
            ) : (
              history.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-800 hover:bg-slate-800/40"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="text-red-400" size={18} />
                      <span className="text-white font-medium">
                        {item.fileName}
                      </span>
                    </div>
                  </td>

                  <td className="p-4 text-slate-300">
                    {item.uploadedAt}
                  </td>

                  <td className="p-4 text-white">
                    {item.records}
                  </td>

                  <td className="p-4">
                    {item.status === "Success" ? (
                      <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                        <CheckCircle2 size={12} />
                        Success
                      </span>
                    ) : (
                      <span className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit">
                        <Clock size={12} />
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}