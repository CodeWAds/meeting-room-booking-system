'use client';

import React, { useState, useEffect } from 'react';
import styles from '../../../styles/Admin.module.css';
import { getData } from '../../../api/api-utils';
import { endpoints } from '../../../api/config';

interface TimeSlot {
  id_time_slot: number;
  time_begin: string;
  time_end: string;
  slot_type: string;
}

interface Booking {
  id_booking: number;
  room_name: string;
  user: number;
  date: string;
  time_slot: TimeSlot[];
}

export default function BookingsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка бронирований с сервера
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const data = await getData(endpoints.get_all_booking);
        if (data instanceof Error) throw data;

        console.log('Данные о бронированиях:', data);

        if (data.Booking && Array.isArray(data.Booking)) {
          const adaptedBookings: Booking[] = data.Booking.map((booking: any) => ({
            id_booking: booking.id_booking,
            room_name: booking.room_name,
            user: booking.user,
            date: booking.date,
            time_slot: booking.time_slot,
          }));
          setBookings(adaptedBookings);
        } else {
          console.error('Бронирования не в ожидаемом формате:', data);
          setBookings([]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке бронирований:', error);
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Фильтрация бронирований по поисковому запросу
  const filteredBookings = bookings.filter((booking) =>
    booking.room_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Функция для получения времени начала и конца из массива time_slot
  const getTimeRange = (timeSlots: TimeSlot[]): string => {
    if (!timeSlots || timeSlots.length === 0) {
      return 'Не указано';
    }
    const firstSlot = timeSlots[0];
    const lastSlot = timeSlots[timeSlots.length - 1];
    return `${firstSlot.time_begin.slice(0, 5)} - ${lastSlot.time_end.slice(0, 5)}`;
  };

  return (
    <main className={styles.content}>
      <div className={styles.contentHeader}>
        <h2 className={styles.pageTitle}>Брони</h2>
        <div className={styles.actions}>
          <input
            type="text"
            placeholder="Поиск..."
            className={styles.searchInput}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className={styles.addButton}>Добавить</button>
        </div>
      </div>
      <div className={styles.tableWrapper}>
        {isLoading ? (
          <p>Загрузка бронирований...</p>
        ) : filteredBookings.length === 0 ? (
          <p>Бронирования не найдены.</p>
        ) : (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Комната</th>
                <th>Пользователь</th>
                <th>Дата</th>
                <th>Время</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id_booking}>
                  <td>#{booking.id_booking}</td>
                  <td>{booking.room_name}</td>
                  <td>{booking.user}</td>
                  <td>{booking.date}</td>
                  <td>{getTimeRange(booking.time_slot)}</td>
                  <td className={styles.actionsCell}>
                    <button className={styles.deleteBtn}>
                      <img src="/svg/delete.svg" alt="Delete" width={16} height={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}