'use client';

import React, { useState, useEffect } from 'react';
import '../../CalendarLocale';
import styles from '../../styles/Manager.module.css';
import { useRouter } from 'next/navigation';
import { Calendar } from 'primereact/calendar';
import RoomsManager from '../../components/RoomsManager';
import BookingManager from '../../components/BookingManager';
import { getData } from '../../api/api-utils';
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

interface Location {
  id_location: number;
  name: string;
}

const Manager: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const store = useStore();

  // Загрузка данных о пользователе и его локациях
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const userData = await getData(endpoints.get_info_user(15));
        if (userData instanceof Error) throw userData;

        console.log('Данные пользователя:', userData);

        // Устанавливаем список локаций
        if (userData.managed_locations && Array.isArray(userData.managed_locations)) {
          const locationData: Location[] = userData.managed_locations.map((loc: any) => ({
            id_location: loc.id_location,
            name: loc.name,
          }));
          setLocations(locationData);
          if (locationData.length > 0) {
            setSelectedLocationId(locationData[0].id_location); // Выбираем первую локацию по умолчанию
          }
        } else {
          console.error('Локации не в ожидаемом формате:', userData);
          setLocations([]);
        }

        // Проверяем, является ли пользователь администратором
        setIsAdmin(!!userData.is_admin);
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
        setLocations([]);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [store.id_user, router]);

  // Загрузка бронирований
  useEffect(() => {

    const fetchBookings = async () => {
      try {
        const bookingData = await getData(endpoints.get_location_booking(1));
        if (bookingData instanceof Error) throw bookingData;

        console.log('Данные о бронированиях:', bookingData);

        const bookingsArray = bookingData.Booking || bookingData.bookings || [];
        if (Array.isArray(bookingsArray)) {
          const adaptedBookings: Booking[] = bookingsArray.map((booking: any) => ({
            id_booking: booking.id_booking,
            room: booking.room,
            room_name: booking.room_name,
            location_name: booking.location_name,
            capacity: booking.capacity,
            user: booking.user,
            date: booking.date,
            review: booking.review,
            status: booking.status,
            time_slot: booking.time_slot || [],
            'verify code': booking['verify code'],
          }));
          setBookings(adaptedBookings);
        } else {
          console.error('Бронирования не в ожидаемом формате:', bookingData);
          setBookings([]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке бронирований:', error);
        setBookings([]);
      }
    };

    fetchBookings();
  }, [store.id_user]);

  const handleCalendarChange = (e: { value: Date | null }) => {
    if (e.value) {
      const date = e.value;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      setSelectedDate(dateString);
    } else {
      setSelectedDate('');
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locationId = Number(e.target.value);
    setSelectedLocationId(locationId);
  };

  const handleAdminClick = () => {
    router.push('/admin');
  };

  const handleLogout = () => {
    router.push('/auth');
  };

  const handleEdit = (id: number) => {
    console.log(`Редактировать бронирование с ID ${id}`);
  };

  const handleDelete = (id: number) => {
    console.log(`Удалить бронирование с ID ${id}`);
  };

  const calendarValue = selectedDate ? new Date(selectedDate) : null;

  // Фильтруем бронирования по выбранной дате
  const filteredBookings = selectedDate
    ? bookings.filter((booking) => booking.date === selectedDate)
    : bookings;

  return (
    <>
      <header className={styles.header}>
        <span className={styles.title}>Панель менеджера</span>
        <div className={styles.actions}>
          {isLoading ? (
            <span>Загрузка...</span>
          ) : locations.length > 0 ? (
            <select
              value={selectedLocationId || ''}
              onChange={handleLocationChange}
              className={styles.locationSelect}
            >
              {locations.map((location) => (
                <option key={location.id_location} value={location.id_location}>
                  {location.name}
                </option>
              ))}
            </select>
          ) : (
            <span>Локации не найдены</span>
          )}
          {isAdmin && (
            <button className={styles.button} onClick={handleAdminClick}>
              Панель администратора
            </button>
          )}
          <button className={styles.logoutButton} onClick={handleLogout}>
            <img src="/svg/exit.svg" alt="Logout" className={styles.logoutIcon} width={24} height={24} />
          </button>
        </div>
      </header>

      <div className={styles.access_code}>
        <input type="number" max="999999" placeholder="Код проверки" />
        <button className={styles.check_button}>Проверить</button>
      </div>

      <div className={styles.content}>
        <div className={styles.left_menu}>
          <div className={styles.header_left_menu}>
            <span className={styles.menu_title}>Переговорные комнаты</span>
            <button className={styles.room_button}>Добавить</button>
          </div>
          {selectedLocationId ? (
            <RoomsManager locationId={selectedLocationId} />
          ) : (
            <p>Выберите локацию для отображения комнат.</p>
          )}
        </div>
        <div className={styles.right_menu}>
          <div className={styles.header_rigth_menu}>
            <span className={styles.menu_title}>Бронирования</span>
            <button className={styles.room_button}>Добавить</button>
          </div>
          <div className={styles.filters}>
            <Calendar
              value={calendarValue}
              onChange={handleCalendarChange}
              dateFormat="dd.mm.yy"
              placeholder="ДД.ММ.ГГГГ"
              locale="ru"
              className="customCalendar"
              panelClassName="customPanel"
            />
          </div>
          <div className={styles.listBooking}>
            <BookingManager
              bookings={filteredBookings}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Manager;