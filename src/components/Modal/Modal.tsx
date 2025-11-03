import { ReactNode } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

function Modal({ title, onClose, children, footer, maxWidth = '800px' }: ModalProps) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={styles.modal} 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth }}
      >
        {/* Fixed Header */}
        <div className={styles.header}>
          <h2>{title}</h2>
          <button 
            className={styles.closeButton} 
            onClick={onClose} 
            title="Close"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className={styles.content}>
          {children}
        </div>

        {/* Fixed Footer (optional) */}
        {footer && (
          <div className={styles.footer}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
