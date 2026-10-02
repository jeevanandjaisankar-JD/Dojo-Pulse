import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Trash2,
  UploadCloud,
  X
} from 'lucide-react';

import {
  deleteUploadHistory,
  getUploadHistory,
  uploadDojoFile
} from '../services/api';

import { toList, fmtDate, fmtVal } from '../components/StatCard';

export default function DataUpload() {
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const loadHistory = useCallback(async () => {
    try {
      setHistory(toList(await getUploadHistory(), 'history', 'uploads'));
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const pick = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setMessage({
        type: 'error',
        text: 'Please choose a .csv file.'
      });
      return;
    }

    setMessage(null);
    setFile(selectedFile);
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

      setMessage({
        type: 'success',
        text: `${file.name} uploaded successfully.`
      });

      setFile(null);

      if (inputRef.current) {
        inputRef.current.value = '';
      }

      await loadHistory();
    } catch (err) {
      setMessage({
        type: 'error',
        text:
          err?.response?.data?.message ??
          err?.response?.data?.detail ??
          'Upload failed. Check the file and try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteHistory = async (historyId, fileName) => {
    if (!historyId) return;

    const confirmed = window.confirm(
      `Delete "${fileName}" from upload history?\n\n` +
      `This will permanently remove the upload history entry and the stored CSV file. ` +
      `Student data already processed from this upload will not be deleted.\n\n` +
      `This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(historyId);
    setMessage(null);

    try {
      await deleteUploadHistory(historyId);

      setHistory((current) =>
        current.filter((item) => {
          const id = item.id ?? item._id;
          return String(id) !== String(historyId);
        })
      );

      setMessage({
        type: 'success',
        text: `${fileName} was deleted from upload history.`
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text:
          err?.response?.data?.message ??
          'Failed to delete the upload history entry.'
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 pb-28 sm:p-6 md:pb-8 lg:p-8">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Upload dojo data
        </h1>

        <p className="mt-1 text-[#64748B]">
          Drop a CSV export to update student progress.
        </p>
      </div>

      {/* Upload Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            inputRef.current?.click();
          }
        }}
        className={`flex cursor-pointer flex-col items-center gap-3 rounded-[20px] border-2 border-dashed px-6 py-14 text-center transition-colors duration-200 ${
          dragging
            ? 'border-[#2563EB] bg-[#EAF2FF]'
            : 'border-[#C9D6EA] bg-white hover:border-[#2563EB] hover:bg-[#F4F8FF]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          hidden
          onChange={(e) => pick(e.target.files?.[0])}
        />

        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF2FF] text-[#2563EB]">
          <UploadCloud size={28} />
        </span>

        <p className="text-lg font-bold">
          Drag and drop your CSV here
        </p>

        <p className="text-sm text-[#64748B]">
          or click to browse files
        </p>
      </div>

      {/* Selected File */}
      {file && (
        <div className="card flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <FileSpreadsheet className="shrink-0 text-[#10B981]" />

            <div className="min-w-0">
              <p className="truncate font-semibold">
                {file.name}
              </p>

              <p className="text-xs text-[#64748B]">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFile(null)}
              className="btn-ghost"
              aria-label="Remove file"
            >
              <X size={16} />
            </button>

            <button
              type="button"
              onClick={submit}
              disabled={uploading}
              className="btn-primary"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Uploading
                </>
              ) : (
                'Upload file'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-[#10B981]/30 bg-[#E3F7EF] text-[#047857]'
              : 'border-[#E63946]/30 bg-[#FDECEE] text-[#B91C1C]'
          }`}
        >
          {message.type === 'success' && (
            <CheckCircle2 size={16} />
          )}

          {message.text}
        </div>
      )}

      {/* Upload History */}
      <div className="card overflow-hidden p-0">
        <h3 className="px-6 pt-6 text-lg font-bold">
          Upload history
        </h3>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">

            <thead className="border-y border-[#E6EBF2] bg-[#F8FAFC] text-[#64748B]">
              <tr>
                <th className="px-6 py-3 font-semibold">
                  File
                </th>

                <th className="px-6 py-3 font-semibold">
                  Uploaded
                </th>

                <th className="px-6 py-3 font-semibold">
                  Records
                </th>

                <th className="px-6 py-3 font-semibold">
                  Status
                </th>

                <th className="px-6 py-3 text-right font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {/* Loading */}
              {loadingHistory &&
                [0, 1, 2].map((i) => (
                  <tr key={i}>
                    <td
                      colSpan={5}
                      className="px-6 py-3"
                    >
                      <div className="skeleton h-6 w-full" />
                    </td>
                  </tr>
                ))}

              {/* History Rows */}
              {!loadingHistory &&
                history.map((h, i) => {
                  const historyId = h.id ?? h._id;

                  const fileName =
                    h.filename ??
                    h.file_name ??
                    h.fileName ??
                    h.name ??
                    'this file';

                  const records =
                    h.records ??
                    h.rows ??
                    h.row_count ??
                    h.rowCount ??
                    h.records_processed;

                  const isDeleting =
                    deletingId &&
                    String(deletingId) === String(historyId);

                  return (
                    <tr
                      key={historyId ?? i}
                      className="border-b border-[#E6EBF2] last:border-0 hover:bg-[#F4F8FF]"
                    >

                      {/* File */}
                      <td className="px-6 py-3 font-semibold">
                        {fileName}
                      </td>

                      {/* Uploaded */}
                      <td className="px-6 py-3 text-[#64748B]">
                        {fmtDate(
                          h.uploaded_at ??
                            h.uploadedAt ??
                            h.created_at ??
                            h.createdAt ??
                            h.date
                        )}
                      </td>

                      {/* Records */}
                      <td className="px-6 py-3 text-[#64748B]">
                        {records == null
                          ? '—'
                          : fmtVal(records)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-3">
                        {h.status ? (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                              /fail|error/i.test(h.status)
                                ? 'bg-[#FDECEE] text-[#B91C1C]'
                                : 'bg-[#E3F7EF] text-[#047857]'
                            }`}
                          >
                            {h.status}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Delete Action */}
                      <td className="px-6 py-3 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteHistory(
                              historyId,
                              fileName
                            )
                          }
                          disabled={isDeleting}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#FECACA] bg-white px-3 py-1.5 text-xs font-semibold text-[#B91C1C] transition-colors hover:bg-[#FDECEE] disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Delete ${fileName}`}
                        >
                          {isDeleting ? (
                            <>
                              <Loader2
                                size={14}
                                className="animate-spin"
                              />
                              Deleting
                            </>
                          ) : (
                            <>
                              <Trash2 size={14} />
                              Delete
                            </>
                          )}
                        </button>
                      </td>

                    </tr>
                  );
                })}

            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {!loadingHistory && history.length === 0 && (
          <p className="py-12 text-center text-sm text-[#64748B]">
            No uploads yet. Your uploaded files will appear here.
          </p>
        )}
      </div>

    </div>
  );
}