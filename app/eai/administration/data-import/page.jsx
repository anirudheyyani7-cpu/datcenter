'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, XCircle,
  ChevronRight, ChevronLeft, Sparkles, MinusCircle,
} from 'lucide-react';

const STATUS = {
  exact:   { label: 'Matched (exact)', color: '#00A36C', bg: '#F0FDF4', Icon: CheckCircle2 },
  ai:      { label: 'Matched (AI-mapped)', color: '#0077C8', bg: '#EFF6FF', Icon: Sparkles },
  skipped: { label: 'Skipped', color: '#9CA3AF', bg: '#F8FAFC', Icon: MinusCircle },
};

export default function EaiDataImportPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/eai/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ background: '#F4F6F9', minHeight: '100%', color: '#1A1F36' }}>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', borderBottom: '1px solid #E2E8F0',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: '#9CA3AF', marginBottom: 5 }}>
            <Link href="/eai/administration" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Administration</Link>
            <ChevronRight size={8} />
            <span style={{ color: '#6B7280' }}>Data Import</span>
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1A1F36', margin: 0, lineHeight: 1 }}>Import EAI Master Data</h1>
          <p style={{ fontSize: 10, color: '#6B7280', marginTop: 3 }}>
            Upload a filled-in copy of the master template to populate every EAI dashboard from your own data.
          </p>
        </div>
        <Link href="/eai/administration" style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: 11, color: '#6B7280', textDecoration: 'none',
        }}>
          <ChevronLeft size={12} /> Back to Administration
        </Link>
      </div>

      <div style={{ padding: '20px 24px', maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Template + upload card ─────────────────────────────────────── */}
        <div style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16,
          padding: 20, boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
        }}>
          <p style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.6, marginBottom: 14 }}>
            The template has 43 sheets — one per EAI data domain (Facilities, IT Assets, Work Orders,
            FinOps, ESG, and more). Columns marked with <strong>*</strong> are required. Re-uploading the
            template with its original headers matches every sheet instantly with no AI involved; renamed
            or reordered columns are mapped automatically.
          </p>

          <a
            href="/api/eai/template"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8,
              padding: '7px 14px', marginBottom: 18,
              fontSize: 11, fontWeight: 600, color: '#1A1F36', textDecoration: 'none',
            }}
          >
            <Download size={13} /> Download Master Template (43 sheets)
          </a>

          {/* Drop zone */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
            onClick={() => inputRef.current?.click()}
            style={{
              border: '2px dashed #E2E8F0', borderRadius: 12, padding: '32px 20px',
              textAlign: 'center', cursor: 'pointer', background: '#F8FAFC',
              transition: 'border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0077C8'; e.currentTarget.style.background = '#F4F6F9'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC'; }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx"
              style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files?.[0])}
            />
            <FileSpreadsheet size={26} color="#9CA3AF" style={{ marginBottom: 8 }} />
            {file ? (
              <p style={{ fontSize: 12, fontWeight: 700, color: '#1A1F36' }}>{file.name}</p>
            ) : (
              <p style={{ fontSize: 11, color: '#6B7280' }}>Drag & drop your filled-in template here, or click to browse</p>
            )}
          </div>

          {file && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              style={{
                marginTop: 14, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: uploading ? '#94A3B8' : '#0077C8', border: 'none', borderRadius: 8,
                padding: '10px 0', color: '#fff', fontSize: 12, fontWeight: 700,
                cursor: uploading ? 'default' : 'pointer',
              }}
            >
              <Upload size={13} /> {uploading ? 'Uploading & mapping sheets…' : 'Upload & Import'}
            </button>
          )}

          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 14,
              background: '#FEF2F2', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 10, padding: 12,
            }}>
              <AlertCircle size={14} color="#DC2626" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 11, color: '#DC2626' }}>{error}</p>
            </div>
          )}
        </div>

        {/* ── Results ─────────────────────────────────────────────────────── */}
        {result && (
          <div style={{
            background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16,
            overflow: 'hidden', boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
          }}>
            {/* Summary strip */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1,
              background: '#E2E8F0', borderBottom: '1px solid #E2E8F0',
            }}>
              <SummaryTile label="Sheets Matched" value={`${result.summary.matchedSheets}/${result.summary.totalSheets}`} color="#1A1F36" />
              <SummaryTile label="Exact Match" value={result.summary.exactMapped} color="#00A36C" />
              <SummaryTile label="AI-Mapped" value={result.summary.aiMapped} color="#0077C8" />
              <SummaryTile label="Skipped" value={result.summary.skipped} color="#9CA3AF" />
              <SummaryTile label="Rows Imported" value={result.summary.totalRowsUpserted.toLocaleString()} color="#1A1F36" />
            </div>

            {/* Per-sheet table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    {['Sheet', 'Status', 'Rows Imported', 'Notes'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '8px 14px', fontSize: 9, fontWeight: 700,
                        color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em',
                        borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((r, i) => {
                    const s = STATUS[r.mappingMethod] ?? STATUS.skipped;
                    const StatusIcon = s.Icon;
                    return (
                      <tr key={r.sheetName} style={{ borderBottom: i < result.results.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
                        <td style={{ padding: '8px 14px', fontWeight: 600, color: '#1A1F36', whiteSpace: 'nowrap' }}>{r.sheetName}</td>
                        <td style={{ padding: '8px 14px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: 9, fontWeight: 700, color: s.color, background: s.bg,
                            border: `1px solid ${s.color}40`, borderRadius: 5, padding: '2px 7px',
                          }}>
                            <StatusIcon size={10} /> {s.label}
                          </span>
                        </td>
                        <td style={{ padding: '8px 14px', color: '#1A1F36', fontFamily: 'ui-monospace,monospace' }}>
                          {r.matched ? `${r.rowsUpserted ?? 0}${r.rowsTotal ? ` / ${r.rowsTotal}` : ''}` : '—'}
                        </td>
                        <td style={{ padding: '8px 14px', color: r.errors?.length ? '#DC2626' : '#9CA3AF', maxWidth: 320 }}>
                          {r.errors?.length ? r.errors.join('; ') : (r.reason || (r.matched ? '' : 'Not found'))}
                          {r.workbookSheet && r.workbookSheet !== r.sheetName && (
                            <span style={{ color: '#9CA3AF' }}> (matched from "{r.workbookSheet}")</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {result.summary.unrecognizedSheets?.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 14px', borderTop: '1px solid #E2E8F0' }}>
                <XCircle size={13} color="#D4A017" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 10, color: '#6B7280' }}>
                  Unrecognized sheets in the uploaded file (not part of the 43 EAI sheets, ignored):{' '}
                  {result.summary.unrecognizedSheets.join(', ')}
                </p>
              </div>
            )}

            <div style={{ padding: '12px 14px', borderTop: '1px solid #E2E8F0' }}>
              <Link href="/eai/global-portfolio" style={{ fontSize: 11, fontWeight: 600, color: '#0077C8', textDecoration: 'none' }}>
                View Global Portfolio Dashboard →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryTile({ label, value, color }) {
  return (
    <div style={{ background: '#FFFFFF', padding: '12px 14px' }}>
      <p style={{ fontSize: 8, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 18, fontWeight: 700, color, fontFamily: 'ui-monospace,monospace' }}>{value}</p>
    </div>
  );
}
