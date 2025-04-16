'use client';

import React, { useState, useEffect } from 'react';
import styles from '../styles/Rooms.module.css';
import { getData } from '../api/api-utils';
import { endpoints } from '../api/config';

interface Equipment {
  name: string;
  description: string;
}

interface TimeSlot {
  id_time_slot: number;
  time_begin: string;
  time_end: string;
  slot_type: string;
}

interface Booking {
  id_booking: number;
  room: number; // Используем room вместо room_id
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

interface Room {
  id_room: number;
  room_name: string;
  capacity: number;
  id_equipment: Equipment[];
}

interface RoomsManagerProps {
  locationId: number;
  locationName?: string;
}

const RoomsManager: React.FC<RoomsManagerProps> = ({ locationId, locationName }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Маппинг иконок для оборудования
  const equipmentIcons: { [key: string]: string } = {
    'Проводной интернет': '/svg/internet.svg',
    'Wi-Fi': '/svg/wifi.svg',
    'Проектор/Интерактивная доска': '/svg/proektor.svg',
    'СК/Ноутбук': '/svg/tv.svg',
  };

  // Загрузка комнат
  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        const data = await getData(endpoints.rooms(1));
        if (data instanceof Error) throw data;

        console.log('Данные о комнатах:', data);

        if (data.rooms && Array.isArray(data.rooms)) {
          const adaptedRooms: Room[] = data.rooms.map((room: any) => ({
            id_room: room.id_room,
            room_name: room.room_name,
            capacity: room.capacity,
            id_equipment: room.id_equipment || [],
          }));
          setRooms(adaptedRooms);
        } else {
          console.error('Комнаты не в ожидаемом формате:', data);
          setRooms([]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке комнат:', error);
        setRooms([]);
      }
    };

    fetchRooms();
  }, [locationId]);

  // Загрузка бронирований для текущей локации
  useEffect(() => {
    const fetchBookings = async () => {

      try {
        const bookingData = await getData(endpoints.get_location_booking(1));
        if (bookingData instanceof Error) throw bookingData;

        console.log('Данные о бронированиях:', bookingData);

        if (bookingData.Booking && Array.isArray(bookingData.Booking)) {
          const adaptedBookings: Booking[] = bookingData.Booking.map((booking: any) => ({
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleEdit = (id: number) => {
    console.log(`Редактировать комнату с ID ${id}`);
  };

  const handleDelete = (id: number) => {
    console.log(`Удалить комнату с ID ${id}`);
  };

  const handleBook = (id: number) => {
    console.log(`Забронировать комнату с ID ${id}`);
  };

  // Функция для получения ближайшего бронирования для комнаты
  const getNextBooking = (roomId: number) => {
    const roomBookings = bookings.filter((booking) => booking.room === roomId);
    if (roomBookings.length === 0) {
      return null;
    }

    // Сортируем бронирования по дате и времени
    const sortedBookings = roomBookings.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time_slot[0]?.time_begin || '00:00:00'}`);
      const dateB = new Date(`${b.date}T${b.time_slot[0]?.time_begin || '00:00:00'}`);
      return dateA.getTime() - dateB.getTime();
    });

    // Возвращаем ближайшее будущее бронирование
    const now = new Date();
    const nextBooking = sortedBookings.find((booking) => {
      const bookingStart = new Date(`${booking.date}T${booking.time_slot[0]?.time_begin || '00:00:00'}`);
      return bookingStart >= now;
    });

    return nextBooking || sortedBookings[sortedBookings.length - 1];
  };

  return (
    <div className={styles.roomsListManager}>
      {isLoading ? (
        <p>Загрузка комнат...</p>
      ) : rooms.length > 0 ? (
        rooms.map((room) => {
          return (
            <div key={room.id_room} className={styles.roomCard}>
              <div className={styles.headCard}>
                <h4>{room.room_name}</h4>
                <div>
                  <button onClick={() => handleEdit(room.id_room)}>
                    <img
                      src="/svg/edit.svg"
                      alt="Edit"
                      className={styles.headIcon}
                      width={16}
                      height={16}
                    />
                  </button>
                  <button onClick={() => handleDelete(room.id_room)}>
                    <img
                      src="/svg/delete.svg"
                      alt="Delete"
                      className={styles.headIcon}
                      width={16}
                      height={16}
                    />
                  </button>
                </div>
              </div>
              <p>Вместимость: {room.capacity} чел.</p>
              <p>Локация: {locationName || 'Не указана'}</p>
              <div className={styles.roomIcons}>
                {room.id_equipment && room.id_equipment.length > 0 ? (
                  room.id_equipment.map((equip, i) => (
                    <img
                      key={i}
                      src={equipmentIcons[equip.name] || '/svg/not-found.svg'}
                      alt={equip.name}
                      title={equip.description}
                      className={styles.roomIcon}
                    />
                  ))
                ) : (
                  <p>Оборудование не указано</p>
                )}
              </div>
              <button className={styles.bookBtn} onClick={() => handleBook(room.id_room)}>
                Забронировать
              </button>
            </div>
          );
        })
      ) : (
        <p>Комнаты не найдены.</p>
      )}
    </div>
  );
};

export default RoomsManager;