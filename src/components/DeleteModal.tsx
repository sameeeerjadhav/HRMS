export default function DeleteModal({
  isOpen,
  title,
  message,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="del-modal open" onClick={onCancel}>
      <style>{`
        .del-modal {
          position: fixed; inset: 0;
          background: rgba(17,24,39,.5);
          backdrop-filter: blur(3px);
          z-index: 600;
          display: none; align-items: center; justify-content: center;
        }
        .del-modal.open { display: flex; }
        .del-box {
          background: var(--surface);
          border-radius: var(--radius-xl);
          padding: 32px;
          width: 100%; max-width: 400px;
          box-shadow: var(--shadow-lg);
          text-align: center;
        }
        .del-icon {
          width: 52px; height: 52px;
          background: var(--red-bg);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .del-icon svg { width: 24px; height: 24px; stroke: var(--red); fill: none; stroke-width: 2; }
        .del-box h3 { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
        .del-box p  { font-size: 13.5px; color: var(--muted); margin-bottom: 24px; line-height: 1.5; }
        .del-actions { display: flex; gap: 10px; justify-content: center; }
      `}</style>
      <div className="del-box" onClick={(e) => e.stopPropagation()}>
        <div className="del-icon">
          <svg viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="del-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
