'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from '../../styles/Booking.module.css';
import CompleteModal from './complete.module';
import CancelModal from './cancel.module';

// Типы данных для бронирований
interface TimeSlot {
  id_time_slot: number;
  time_begin: string;
  time_end: string;
  slot_type: string;
}

interface Booking {
  id_booking: number;
  user_id: number;
  room_id: number;
  date: string;
  review: string | null;
  status: string;
  time_slot: TimeSlot[];
  room_name: string;
  capacity: number;
  location: string;
  equipment: string[];
}

// Тип для избранного (совместимый с favourites)
interface Room {
  name: string;
  capacity: string;
  location: string;
  icons: string[];
}

// Фиктивные данные
const initialBookings: Booking[] = [
  {
    id_booking: 654321,
    user_id: 15,
    room_id: 102,
    date: '2025-03-28',
    review: null,
    status: 'active',
    time_slot: [
      {
        id_time_slot: 2,
        time_begin: '09:52:00',
        time_end: '09:55:00',
        slot_type: 'regular',
      },
    ],
    room_name: 'qwerty3',
    capacity: 8,
    location: '4 корпус, 2 этаж',
    equipment: ['/svg/wifi.svg', '/svg/proektor.svg', '/svg/tv.svg', '/svg/internet.svg'],
  },
  {
    id_booking: 612331,
    user_id: 15,
    room_id: 102,
    date: '2025-03-28',
    review: null,
    status: 'active',
    time_slot: [
      {
        id_time_slot: 1,
        time_begin: '03:00:00',
        time_end: '09:55:00',
        slot_type: 'regular',
      },
    ],
    room_name: 'qwerty2',
    capacity: 8,
    location: '4 корпус, 2 этаж',
    equipment: ['/svg/wifi.svg', '/svg/proektor.svg', '/svg/tv.svg', '/svg/internet.svg'],
  },
  {
    id_booking: 653321,
    user_id: 15,
    room_id: 102,
    date: '2025-03-28',
    review: null,
    status: 'active',
    time_slot: [
      {
        id_time_slot: 3,
        time_begin: '07:40:00',
        time_end: '09:20:00',
        slot_type: 'regular',
      },
    ],
    room_name: 'qwerty1',
    capacity: 8,
    location: '4 корпус, 2 этаж',
    equipment: ['/svg/wifi.svg', '/svg/proektor.svg', '/svg/tv.svg', '/svg/internet.svg'],
  },
];

// Фиктивные данные для доступных временных слотов для продления
const availableTimeSlots: TimeSlot[] = [
  { id_time_slot: 4, time_begin: '9:40', time_end: '10:10', slot_type: 'regular' },
  { id_time_slot: 5, time_begin: '10:20', time_end: '10:50', slot_type: 'regular' },
  { id_time_slot: 6, time_begin: '11:00', time_end: '11:30', slot_type: 'regular' },
  { id_time_slot: 7, time_begin: '11:40', time_end: '12:10', slot_type: 'regular' },
  { id_time_slot: 8, time_begin: '12:20', time_end: '12:50', slot_type: 'regular' },
];

const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [favourites, setFavourites] = useState<Room[]>(() => {
    if (typeof window !== 'undefined') {
      const savedFavourites = localStorage.getItem('favourites');
      return savedFavourites ? JSON.parse(savedFavourites) : [];
    }
    return [];
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);

  // Синхронизация с localStorage при монтировании компонента
  useEffect(() => {
    const syncFavourites = () => {
      if (typeof window !== 'undefined') {
        const savedFavourites = localStorage.getItem('favourites');
        setFavourites(savedFavourites ? JSON.parse(savedFavourites) : []);
      }
    };
    syncFavourites();
  }, []);

  // Обновление localStorage при изменении favourites
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('favourites', JSON.stringify(favourites));
    }
  }, [favourites]);

  // Слушаем изменения в localStorage (для других вкладок)
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const savedFavourites = localStorage.getItem('favourites');
        setFavourites(savedFavourites ? JSON.parse(savedFavourites) : []);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const toggleFavourite = (booking: Booking) => {
    const room: Room = {
      name: booking.room_name,
      capacity: `до ${booking.capacity} человек`,
      location: booking.location,
      icons: booking.equipment,
    };

    if (
      favourites.some(
        (fav) => fav.name === room.name && fav.location === room.location
      )
    ) {
      setFavourites(
        favourites.filter(
          (fav) => !(fav.name === room.name && fav.location === room.location)
        )
      );
    } else {
      setFavourites([...favourites, room]);
    }
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      burgerRef.current &&
      !burgerRef.current.contains(event.target as Node)
    ) {
      setIsMenuOpen(false);
    }
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Отмена бронирования
  const cancelBooking = (bookingId: number) => {
    setBookings(bookings.filter((booking) => booking.id_booking !== bookingId));
    setIsCancelModalOpen(false);
    setSelectedBookingId(null);
  };

  // Завершение бронирования (удаление из списка)
  const completeBooking = (bookingId: number) => {
    setBookings(bookings.filter((booking) => booking.id_booking !== bookingId));
  };

  // Продление бронирования
  const extendBooking = (bookingId: number, newTimeSlot: TimeSlot) => {
    setBookings(
      bookings.map((booking) =>
        booking.id_booking === bookingId
          ? {
              ...booking,
              time_slot: [
                {
                  ...booking.time_slot[0],
                  time_end: newTimeSlot.time_end,
                },
              ],
            }
          : booking
      )
    );
    setIsExtendModalOpen(false);
    setSelectedBookingId(null);
  };

  // Проверка, идет ли бронирование сейчас
  const isBookingOngoing = (booking: Booking): boolean => {
    const now = new Date();
    const timeSlot = booking.time_slot[0];

    const bookingStart = new Date(`${booking.date}T${timeSlot.time_begin}`);
    const bookingEnd = new Date(`${booking.date}T${timeSlot.time_end}`);

    return now >= bookingStart && now <= bookingEnd;
  };

  // Проверка, не началось ли бронирование
  const isBookingUpcoming = (booking: Booking): boolean => {
    const now = new Date();
    const timeSlot = booking.time_slot[0];

    const bookingStart = new Date(`${booking.date}T${timeSlot.time_begin}`);

    return now < bookingStart;
  };

  // Проверка, завершилось ли бронирование
  const isBookingFinished = (booking: Booking): boolean => {
    const now = new Date();
    const timeSlot = booking.time_slot[0];

    const bookingEnd = new Date(`${booking.date}T${timeSlot.time_end}`);

    return now > bookingEnd;
  };

  // Фильтрация бронирований: показываем только те, которые еще не завершились
  const activeBookings = bookings.filter((booking) => !isBookingFinished(booking));

  return (
    <div className={styles.rooms}>
      <div className={styles.header}>
        <h3>Текущие бронирования</h3>
        <div
          className={styles.navbarBurger}
          onClick={handleMenuToggle}
          ref={burgerRef}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div
          className={`${styles.navbarMenu} ${isMenuOpen ? styles.active : ''}`}
          ref={menuRef}
        >
          <div className={styles.menuHeader}>
            <span>Ник</span>
            <span>(карма)</span>
          </div>
          <a href="/" onClick={handleLinkClick}>
            Главное
          </a>
          <a href="/favourites" onClick={handleLinkClick}>
            Избранное
          </a>
          <a href="/myBooking" onClick={handleLinkClick}>
            Мои бронирования
          </a>
        </div>
      </div>
      {activeBookings.length === 0 ? (
        <p className={styles.noBookings}>У вас нет текущих бронирований.</p>
      ) : (
        <div className={styles.roomList}>
          {activeBookings.map((booking) => {
            const isOngoing = isBookingOngoing(booking);
            const isUpcoming = isBookingUpcoming(booking);
            const timeSlot = booking.time_slot[0];

            return (
              <div key={booking.id_booking} className={styles.roomCard}>
                <h4>{booking.room_name}</h4>
                <p>Вместимость: до {booking.capacity} человек</p>
                <p>Локация: {booking.location}</p>
                <p>
                  Дата:{' '}
                  {new Date(booking.date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <p>
                  Время: {timeSlot.time_begin.slice(0, 5)} - {timeSlot.time_end.slice(0, 5)}
                </p>
                <p>Код проверки: {booking.id_booking}</p>
                <div className={styles.roomIcons}>
                  {booking.equipment.map((icon, i) => (
                    <img key={i} src={icon} alt={`icon-${i}`} className={styles.roomIcon} />
                  ))}
                </div>
                <div className={styles.bookingActions}>
                  {isUpcoming && (
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
                  {isOngoing && (
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
                <span
                  onClick={() => toggleFavourite(booking)}
                  className={styles.favorite}
                >
                  {favourites.some(
                    (fav) =>
                      fav.name === booking.room_name && fav.location === booking.location
                  ) ? (
                    <img src="/svg/liked.svg" alt="liked" />
                  ) : (
                    <img src="/svg/notliked.svg" alt="not liked" />
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
      <CompleteModal
        isOpen={isExtendModalOpen}
        onClose={() => {
          setIsExtendModalOpen(false);
          setSelectedBookingId(null);
        }}
        onExtend={(newTimeSlot) => {
          if (selectedBookingId !== null) {
            extendBooking(selectedBookingId, newTimeSlot);
          }
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
          if (selectedBookingId !== null) {
            cancelBooking(selectedBookingId);
          }
        }}
      />
    </div>
  );
};

export default MyBookingsPage;