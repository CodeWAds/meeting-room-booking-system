'use client';

import React, { useState, useEffect } from 'react';
import styles from '../styles/Rooms.module.css';
import { getData } from '../api/api-utils';
import { endpoints } from '../api/config';

interface Equipment {
  name: string;
  description: string;
}

interface Room {
  id_room: number;
  room_name: string;
  capacity: number;
  id_equipment: Equipment[];
}

interface RoomsManagerProps {
  locationId: number | null; // Обновляем тип, так как в Manager.tsx selectedLocationId может быть null
  locationName?: string;
  onDelete: (room: { id_room: number; room_name: string }) => void; // Добавляем проп для удаления
  refreshKey?: number; // Добавляем проп для обновления списка комнат
}

const RoomsManager: React.FC<RoomsManagerProps> = ({ locationId, locationName, onDelete, refreshKey = 0 }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
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
    if (!locationId) return;

    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        const data = await getData(endpoints.rooms(locationId));
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
        alert('Не удалось загрузить комнаты. Попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [locationId, refreshKey]); // Добавляем refreshKey в зависимости

  const handleEdit = (id: number) => {
    console.log(`Редактировать комнату с ID ${id}`);
  };

  const handleDelete = (room: { id_room: number; room_name: string }) => {
    onDelete(room); // Вызываем проп onDelete, передавая объект комнаты
  };

  const handleBook = (id: number) => {
    console.log(`Забронировать комнату с ID ${id}`);
  };

  return (
    <div className={styles.roomsListManager}>
      {isLoading ? (
        <p>Загрузка комнат...</p>
      ) : rooms.length > 0 ? (
        rooms.map((room) => (
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
                <button onClick={() => handleDelete({ id_room: room.id_room, room_name: room.room_name })}>
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
        ))
      ) : (
        <p>Комнаты не найдены.</p>
      )}
    </div>
  );
};

export default RoomsManager;