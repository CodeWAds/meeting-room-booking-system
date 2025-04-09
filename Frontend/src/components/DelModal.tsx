import React from "react";
import styles from "../styles/DelModal.module.css";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3>Вы действительно хотите удалить запись?</h3>
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