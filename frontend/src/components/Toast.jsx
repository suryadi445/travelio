import Icon from './Icon.jsx';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  return <div className={`toast toast-${toast.type}`} role="status" aria-live="polite">
    <span className="toast-mark">{toast.type === 'error' ? '!' : '✓'}</span><span>{toast.message}</span>
    <button onClick={onClose} aria-label="Dismiss notification"><Icon name="close" size={16} /></button>
  </div>;
}
