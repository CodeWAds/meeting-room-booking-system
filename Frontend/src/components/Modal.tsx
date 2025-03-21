import React from 'react';
import styles from '../styles/Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <span className={styles.close} onClick={onClose}>
          ×
        </span>
        <p>Вы действительно хотите забронировать "Генераторная" на 28.02.2025 с 9:00 по 10:10?</p>
        <div className={styles.modalButtons}>
        <button className={styles.confirmBtn}>Забронировать</button>
        <button className={styles.cancelBtn} onClick={onClose}>
          Отмена
        </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;