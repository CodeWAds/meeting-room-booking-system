import React from 'react';
import styles from '../../styles/Booking.module.css';

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CancelModal: React.FC<CancelModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h4>Вы действительно хотите отменить бронирование?</h4>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles.modalActions}>
          <button className={`${styles.modalBtn} ${styles.cancelBtn}`} onClick={onConfirm}>
            Отменить
          </button>
          <button className={`${styles.modalBtn} ${styles.otmenaBtn}`} onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelModal;