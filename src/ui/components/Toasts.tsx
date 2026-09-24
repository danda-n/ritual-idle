import type { Toast } from "../useGame";

export function Toasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <button key={t.id} className="toast" onClick={() => onDismiss(t.id)} aria-label={`${t.title}. ${t.text}. Dismiss.`}>
          <span className="toast-title">{t.title}</span>
          <span className="toast-text">{t.text}</span>
        </button>
      ))}
    </div>
  );
}
