// components/ClientStatusModal.tsx
import React from "react";
import styles from "../styles/ClientsStatusModal.module.css";

interface Client {
  id: number;
  name: string;
  username: string;
  status: "Активен" | "Заблокирован";
}

interface ClientStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onSave: (client: Client) => void;
}

const ClientStatusModal: React.FC<ClientStatusModalProps> = ({
  isOpen,
  onClose,
  client,
  onSave,
}) => {
  if (!isOpen || !client) return null;

  const [status, setStatus] = React.useState<"Активен" | "Заблокирован">(client.status);

  const handleSave = () => {
    onSave({ ...client, status });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>Редактирование статуса клиента</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label>Имя: {client.name}</label>
          </div>
          <div className={styles.formGroup}>
            <label>Логин: {client.username}</label>
          </div>
          <div className={styles.formGroup}>
            <label>Статус</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "Активен" | "Заблокирован")}
            >
              <option value="Активен">Активен</option>
              <option value="Заблокирован">Заблокирован</option>
            </select>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button type="button" onClick={handleSave} className={styles.saveButton}>
            Сохранить
          </button>
          <button type="button" onClick={onClose} className={styles.cancelButton}>
            Отменить
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientStatusModal;