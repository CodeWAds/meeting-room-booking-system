'use client';

import React from 'react';
import styles from '../styles/BookingManager.module.css';

interface TimeSlot {
  id_time_slot: number;
  time_begin: string;
  time_end: string;
  slot_type: string;
}

interface Booking {
  id_booking: number;
  room: number;
  room_name: string;
  location_name: string;
  capacity: number;
  user: number;
  date: string;
  review: number | null;
  status: string;
  time_slot: TimeSlot[];
  'verify code': number;
}

interface BookingManagerProps {
  bookings: Booking[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const BookingManager: React.FC<BookingManagerProps> = ({ bookings, onEdit, onDelete }) => {
  return (
    <div className={styles.bookingsPanel}>
      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <div key={booking.id_booking} className={styles.card}>
            <div className={styles.header}>
              <span className={styles.title}>
                {booking.room_name} ({booking.status === 'pending' ? 'Ожидает подтверждения' : 'Подтверждено'})
              </span>
              <div className={styles.dateTime}>
                <div>{booking.date}</div>
                <div>
                  {booking.time_slot.length > 0
                    ? `${booking.time_slot[0].time_begin.slice(0, 5)} - ${booking.time_slot[booking.time_slot.length - 1].time_end.slice(0, 5)}`
                    : 'Время не указано'}
                </div>
              </div>
            </div>
            <div className={styles.location}>
              {booking.location_name}
            </div>
            <div className={styles.buttons}>
              <button className={styles.editButton} onClick={() => onEdit(booking.id_booking)}>
                Редактировать
              </button>
              <button className={styles.deleteButton} onClick={() => onDelete(booking.id_booking)}>
                Удалить
              </button>
            </div>
          </div>
        ))
      ) : (
        <p>Бронирования не найдены.</p>
      )}
    </div>
  );
};

export default BookingManager;