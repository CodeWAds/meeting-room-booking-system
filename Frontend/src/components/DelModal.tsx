import React from "react";
import styles from "../styles/DelModal.module.css";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  roomName?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, roomName }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        <h3>
          Вы действительно хотите удалить комнату {roomName ? `"${roomName}"` : "запись"}?
        </h3>
        <div className={styles.modalActions}>
          <button type="button" onClick={onConfirm} className={styles.deleteButton}>
            Удалить
          </button>
          <button type="button" onClick={onClose} className={styles.cancelButton}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;