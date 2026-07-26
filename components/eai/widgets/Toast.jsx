'use client';
import { useCallback, useRef, useState } from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';

const TYPE_STYLE = {
  success: { color: '#00A36C', Icon: CheckCircle2 },
  info:    { color: '#0077C8', Icon: Info          },
  warning: { color: '#F59E0B', Icon: AlertTriangle },
  error:   { color: '#EF4444', Icon: XCircle       },
};

// Lightweight bottom-right toast stack. Usage:
//   const { showToast, ToastHost } = useToast();
//   showToast('Export complete', 'success');
//   return <>{...}<ToastHost /></>;
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    timers.current[id] = setTimeout(() => dismiss(id), 3000);
  }, [dismiss]);

  const ToastHost = useCallback(() => (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 3000,
      display: 'flex', flexDirection: 'column', gap: 8,
      alignItems: 'flex-end',
    }}>
      {toasts.map(t => {
        const { color, Icon } = TYPE_STYLE[t.type] ?? TYPE_STYLE.success;
        return (
          <div key={t.id} role="status" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#1A1F36', border: `1px solid ${color}40`,
            borderLeft: `3px solid ${color}`,
            borderRadius: 10, padding: '10px 12px 10px 10px',
            boxShadow: '0 8px 24px rgba(16,24,40,0.24)',
            minWidth: 200, maxWidth: 340,
            animation: 'eaiToastIn 0.18s ease-out',
          }}>
            <Icon size={15} style={{ color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#FFFFFF', flex: 1, lineHeight: 1.4 }}>{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="eai-focusable"
              style={{
                width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={11} />
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes eaiToastIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  ), [toasts, dismiss]);

  return { showToast, ToastHost };
}
