import React from "react";
import styles from "../styles/Modal.module.css";
import { useRouter } from "next/navigation";
import { postData } from "../api/api-utils";
import { endpoints } from "../api/config";
import { useStore } from "../store/app-store";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName?: string;
  date?: string;
  timeStart?: string;
  timeEnd?: string;
  roomId?: number; // Добавляем roomId
  userId?: number; // Добавляем userId
  slot?: number[]; // Добавляем slot
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  roomName,
  date,
  timeStart,
  timeEnd,
  roomId,
  userId,
  slot,
}) => {
  if (!isOpen) return null;

  const router = useRouter();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "дата не выбрана";
    const [year, month, day] = dateStr.split("-");
    return `${day}.${month}.${year}`; // Формат DD-MM-YYYY
  };
  const store = useStore();
  const makeBooking = async () => {
    try {
      const payload = {
        user_id: store.id_user,
        room_id: roomId,
        date: date, // Формат "YYYY-MM-DD"
        review: 5, // Можно сделать динамическим
        status: "pending", // Статус по умолчанию
        slot: slot, // Массив слотов, например [1, 2]
      };

      const response = await postData(endpoints.create_booking, payload);

      if (response instanceof Error) {
        console.error("Ошибка при создании бронирования:", response);
        alert("Не удалось создать бронирование. Попробуйте снова.");
      } else {
        console.log("Бронирование успешно создано:", response);
        onClose(); // Закрываем модальное окно
        router.push("/myBooking"); // Перенаправляем на клиентской стороне
      }
    } catch (error) {
      console.error("Произошла ошибка:", error);
      alert("Произошла ошибка при бронировании.");
    }
  };

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <span className={styles.close} onClick={onClose}>×</span>
        <p>
          Вы действительно хотите забронировать "{roomName || "Название комнаты"}" на{" "}
          <span className={styles.noWrap}>
            {formatDate(date)} с {timeStart || "начало"} по {timeEnd || "конец"}
          </span>
          ?
        </p>
        <div className={styles.modalButtons}>
          <button className={styles.confirmBtn} onClick={makeBooking}>
            Забронировать
          </button>
          <button className={styles.cancelBtn} onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;