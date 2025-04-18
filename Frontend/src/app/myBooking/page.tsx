'use client';

import React, { useState, useEffect } from 'react';
import styles from '../../styles/Booking.module.css';
import CompleteModal from './complete.module';
import CancelModal from './cancel.module';
import Navbar from '../../components/Navbar';
import { getData, deleteData, postData } from '../../api/api-utils';
import { endpoints } from '../../api/config';
import { useStore } from '../../store/app-store';

interface TimeSlot {
  id_time_slot: number;
  time_begin: string;
  time_end: string;
  slot_type: string;
}

interface Booking {
  id_booking: number;
  user: number;
  room: number;
  date: string;
  review: number;
  status: string;
  time_slot: TimeSlot[];
  room_name?: string;
  capacity?: string;
  location?: string;
  equipment?: string[];
  verify_code?: number;
}

interface Room {
  id: number;
  name: string;
  location: string;
  icons: string[];
}

const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [favourites, setFavourites] = useState<Room[]>([]);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const store = useStore();

  useEffect(() => {
    if (!store.id_user) {
      setIsLoading(false);
      alert('Ошибка: пользователь не авторизован. Пожалуйста, войдите в систему.');
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await getData(endpoints.my_bookings(store.id_user));
        if (response instanceof Error) throw response;

        const adaptedData: Booking[] = (response.UserBookings || []).map((b: any) => ({
          id_booking: b.id_booking,
          user: b.user,
          room: b.room,
          date: b.date,
          review: b.review,
          status: b.status,
          time_slot: b.time_slot,
          room_name: b.room_name,
          capacity: b.capacity,
          location: b.location_name,
          equipment: b.equipment || [],
          verify_code: b['verify code'],
        }));

        setBookings(adaptedData);

        const initialFavourites: Room[] = (response.UserBookings || [])
          .filter((b: any) => b.favorite)
          .map((b: any) => ({
            id: b.room,
            name: b.room_name,
            location: b.location_name,
            icons: b.equipment || [],
          }));

        setFavourites(initialFavourites);
      } catch (error) {
        console.error('Ошибка при загрузке бронирований:', error);
        setBookings([]);
      }
    };


    
  }, [store.id_user]);

  const toggleFavourite = async (booking: Booking) => {
    const room: Room = {
      id: booking.room,
      name: booking.room_name!,
      location: booking.location!,
      icons: booking.equipment || [],
    };

    const exists = favourites.some((f) => f.id === room.id);

    try {
      if (exists) {
        const response = await deleteData(
          endpoints.delete_favourite(store.id_user, room.id)
        );
        if (response instanceof Error) throw response;
        setFavourites((prev) => prev.filter((f) => f.id !== room.id));
      } else {
        const response = await postData(endpoints.add_to_favourite(store.id_user), {
          room_id: booking.room,
        });
        if (response instanceof Error) throw response;
        setFavourites((prev) => [...prev, room]);
      }
    } catch (error) {
      console.error('Ошибка при добавлении/удалении из избранного:', error);
      alert('Не удалось обновить избранное. Попробуйте снова.');
    }
  };

  const cancelBooking = async (id: number) => {
    try {
      const response = await deleteData(endpoints.delete_booking(id));
      if (response instanceof Error) throw response;
      setBookings(bookings.filter((b) => b.id_booking !== id));
      if (process.env.NODE_ENV !== 'production') {
        console.log('Бронирование успешно отменено:', response);
      }
    } catch (error) {
      console.error('Ошибка при отмене бронирования:', error);
      alert('Не удалось отменить бронирование. Попробуйте снова.');
    } finally {
      setIsCancelModalOpen(false);
      setSelectedBookingId(null);
    }
  };

  const completeBooking = async (id: number) => {
    // try {
    //   // Предполагаемый эндпоинт для завершения бронирования
    //   const response = await postData(endpoints.complete_booking, { booking_id: id });
    //   if (response instanceof Error) throw response;
    //   setBookings(bookings.filter((b) => b.id_booking !== id));
    //   if (process.env.NODE_ENV !== 'production') {
    //     console.log('Бронирование успешно завершено:', response);
    //   }
    // } catch (error) {
    //   console.error('Ошибка при завершении бронирования:', error);
    //   alert('Не удалось завершить бронирование. Попробуйте снова.');
    // }
  };

  const extendBooking = (id: number, newSlot: TimeSlot) => {
    setBookings(
      bookings.map((b) =>
        b.id_booking === id
          ? {
              ...b,
              time_slot: [
                ...b.time_slot.slice(0, -1),
                {
                  ...b.time_slot[b.time_slot.length - 1],
                  time_end: newSlot.time_end,
                },
              ],
            }
          : b
      )
    );
    setIsExtendModalOpen(false);
    setSelectedBookingId(null);
  };

  const isBookingOngoing = (booking: Booking) => {
    const now = new Date();
    const start = new Date(`${booking.date}T${booking.time_slot[0].time_begin}`);
    const end = new Date(`${booking.date}T${booking.time_slot[booking.time_slot.length - 1].time_end}`);
    return now >= start && now <= end;
  };

  const isBookingUpcoming = (booking: Booking) => {
    const now = new Date();
    const start = new Date(`${booking.date}T${booking.time_slot[0].time_begin}`);
    return now < start;
  };

  const isBookingFinished = (booking: Booking) => {
    const now = new Date();
    const end = new Date(`${booking.date}T${booking.time_slot[booking.time_slot.length - 1].time_end}`);
    return now > end;
  };

  const activeBookings = bookings.filter((b) => !isBookingFinished(b));

  return (
    <div className={styles.rooms}>
      <Navbar title="Текущие бронирования" />
      {isLoading ? (
        <p className={styles.noBookings}>Загрузка бронирований...</p>
      ) : activeBookings.length === 0 ? (
        <p className={styles.noBookings}>Бронирований нет</p>
      ) : (
        <div className={styles.roomList}>
          {activeBookings.map((booking) => (
            <div key={booking.id_booking} className={styles.roomCard}>
              <h4>{booking.room_name || `Комната №${booking.room}`}</h4>
              <p>Локация: {booking.location || '?'}</p>
              <p>
                Дата: {new Date(booking.date).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <p>
                Время: {booking.time_slot[0].time_begin.slice(0, 5)} -{' '}
                {booking.time_slot[booking.time_slot.length - 1].time_end.slice(0, 5)}
              </p>
              <p>Код проверки: {booking.verify_code}</p>
              <div className={styles.roomIcons}>
                {booking.equipment?.map((icon, i) => (
                  <img key={i} src={icon} alt={`icon-${i}`} className={styles.roomIcon} />
                ))}
              </div>
              <div className={styles.bookingActions}>
                {isBookingUpcoming(booking) && (
                  <button
                    onClick={() => {
                      setSelectedBookingId(booking.id_booking);
                      setIsCancelModalOpen(true);
                    }}
                    className={`${styles.bookBtn} ${styles.cancelBtn}`}
                  >
                    Отменить бронирование
                  </button>
                )}
                {isBookingOngoing(booking) && (
                  <>
                    <button
                      onClick={() => completeBooking(booking.id_booking)}
                      className={`${styles.bookBtn} ${styles.completeBtn}`}
                    >
                      Завершить
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBookingId(booking.id_booking);
                        setIsExtendModalOpen(true);
                      }}
                      className={`${styles.bookBtn} ${styles.extendBtn}`}
                    >
                      Продлить
                    </button>
                  </>
                )}
              </div>
              <span onClick={() => toggleFavourite(booking)} className={styles.favorite}>
                {favourites.some((f) => f.id === booking.room) ? (
                  <img src="/svg/liked.svg" alt="liked" />
                ) : (
                  <img src="/svg/notliked.svg" alt="not liked" />
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      <CompleteModal
        isOpen={isExtendModalOpen}
        onClose={() => {
          setIsExtendModalOpen(false);
          setSelectedBookingId(null);
        }}
        onExtend={(slot) => {
          if (selectedBookingId !== null) extendBooking(selectedBookingId, slot);
        }}
        availableSlots={availableTimeSlots}
      />

      <CancelModal
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setSelectedBookingId(null);
        }}
        onConfirm={() => {
          if (selectedBookingId !== null) cancelBooking(selectedBookingId);
        }}
      />
    </div>
  );
};

export default MyBookingsPage;