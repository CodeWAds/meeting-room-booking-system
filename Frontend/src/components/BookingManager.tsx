import React from 'react';
import styles from '../styles/BookingManager.module.css'; // Предполагаем, что используем CSS-модули

// Типизация пропсов компонента
interface BookingManagerProps {
  date: string;
  time: string;
  location: string;
  onEdit: () => void;
  onDelete: () => void;
}

const BookingManager: React.FC<BookingManagerProps> = ({
  date,
  time,
  location,
  onEdit,
  onDelete,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Генерация</span>
        <span className={styles.dateTime}>
          Дата: {date} <br /> Время: {time}
        </span>
      </div>
      <div className={styles.location}>
        Локация: {location}
      </div>
      <div className={styles.buttons}>
        <button className={styles.editButton} onClick={onEdit}>
          Редактировать
        </button>
        <button className={styles.deleteButton} onClick={onDelete}>
          Удалить
        </button>
      </div>
    </div>
  );
};

export default BookingManager;