import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const modalBackdropStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.35)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 16px rgba(0,0,0,0.15)',
  padding: 24,
  minWidth: 320,
  maxHeight: '90vh',
  overflowY: 'auto',
  position: 'relative',
};

const closeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  right: 16,
  fontSize: 24,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#888',
};

const Modal: React.FC<ModalProps> = ({ open, onClose, children, style }) => {
  if (!open) return null;
  return (
    <div style={modalBackdropStyle} onClick={onClose}>
      <div
        style={{ ...modalContentStyle, ...style }}
        onClick={e => e.stopPropagation()}
      >
        <button style={closeBtnStyle} onClick={onClose} aria-label="Закрыть">×</button>
        {children}
      </div>
    </div>
  );
};

export default Modal; 