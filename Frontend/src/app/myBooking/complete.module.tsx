import React, { useState } from 'react';
import styles from '../../styles/Booking.module.css';

// Синхронизируем тип TimeSlot с page.tsx
interface TimeSlot {
  id_time_slot: number;
  time_begin: string;
  time_end: string;
  slot_type: string;
}

interface CompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtend: (timeSlot: TimeSlot) => void;
  availableSlots: TimeSlot[];
}

const CompleteModal: React.FC<CompleteModalProps> = ({
  isOpen,
  onClose,
  onExtend,
  availableSlots,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  if (!isOpen) return null;

  const handleSlotSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handleExtend = () => {
    if (selectedSlot) {
      onExtend(selectedSlot);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h4>Выберите доступное для продления время:</h4>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles.timeSlots}>
          {availableSlots.map((slot) => (
            <button
              key={slot.id_time_slot} // Используем id_time_slot как ключ
              className={`${styles.timeSlotBtn} ${
                selectedSlot === slot ? styles.selectedSlot : ''
              }`}
              onClick={() => handleSlotSelect(slot)}
            >
              {slot.time_begin} - {slot.time_end}
            </button>
          ))}
        </div>
        <div className={styles.modalActions}>
          <button
            className={`${styles.modalBtn} ${styles.extendBtn}`}
            onClick={handleExtend}
            disabled={!selectedSlot} // Кнопка "Продлить" активна только если выбран слот
          >
            Продлить
          </button>
          <button
            className={`${styles.modalBtn} ${styles.otmenaBtn}`}
            onClick={onClose}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteModal;
