'use client';

import React, { useState, useEffect } from 'react';
import styles from '../../styles/fav.module.css';
import ModalFollow from './ModalFollow';
import Navbar from '../../components/Navbar';
import { getData, deleteData } from '../../api/api-utils';
import { endpoints } from '../../api/config';
import { useStore } from '../../store/app-store';

interface Equipment {
  name: string;
  description: string;
}

interface Room {
  favorite_id: number;
  room_id: number;
  id_user: number;
  room_name: string;
  capacity: number;
  location?: string;
  id_equipment: Equipment[];
}

const Favourites: React.FC = () => {
  const [favourites, setFavourites] = useState<Room[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null); // Для хранения выбранной комнаты
  const [isLoading, setIsLoading] = useState(true);
  const store = useStore();

  useEffect(() => {
    if (!store.id_user) return;

    const fetchFavourites = async () => {
      try {
        const response = await getData(endpoints.get_favourite_rooms(store.id_user));
        if (response instanceof Error) throw response;

        const adaptedData: Room[] = (response || []).map((item: any) => ({
          favorite_id: item.favorite_id,
          room_id: item.room_id,
          id_user: item.id_user,
          room_name: item.room_name,
          capacity: item.capacity,
          location: item.location || 'Не указана',
          id_equipment: item.id_equipment || [],
        }));

        setFavourites(adaptedData);
      } catch (error) {
        console.error('Ошибка при загрузке избранных комнат:', error);
        setFavourites([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavourites();
  }, [store.id_user]);

  const toggleFavourite = async (room: Room) => {
    try {
      const response = await deleteData(
        endpoints.delete_favourite(store.id_user, room.room_id)
      );
      if (response instanceof Error) throw response;

      setFavourites((prev) =>
        prev.filter((fav) => fav.room_id !== room.room_id)
      );
    } catch (error) {
      console.error('Ошибка при удалении из избранного:', error);
    }
  };

  const handleBookClick = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  const equipmentIcons: { [key: string]: string } = {
    'Проводной интернет': '/svg/internet.svg',
    'Wi-Fi': '/svg/wifi.svg',
    'Проектор/Интерактивная доска': '/svg/proektor.svg',
    'СК/Ноутбук': '/svg/tv.svg',
  };

  return (
    <div className={styles.rooms}>
      <Navbar title="Избранные переговорные" />
      {isLoading ? (
        <p style={{ color: '#fff' }}>Загрузка избранных комнат...</p>
      ) : favourites.length === 0 ? (
        <p style={{ color: '#fff' }}>У вас пока нет избранных комнат.</p>
      ) : (
        <div className={styles.roomList}>
          {favourites.map((room) => (
            <div key={room.favorite_id} className={styles.roomCard}>
              <h4>{room.room_name}</h4>
              <p>Вместимость: {room.capacity} чел.</p>
              <p>Локация: {room.location}</p>
              <div className={styles.roomIcons}>
                {room.id_equipment.map((equip, i) => (
                  <img
                    key={i}
                    src={equipmentIcons[equip.name] || '/svg/not-found.svg'}
                    alt={equip.name}
                    title={equip.description}
                    className={styles.roomIcon}
                  />
                ))}
              </div>
              <button className={styles.bookBtn} onClick={() => handleBookClick(room)}>
                Забронировать
              </button>
              <span
                className={styles.favorite}
                onClick={() => toggleFavourite(room)}
              >
                <img src="/svg/liked.svg" alt="liked" />
              </span>
            </div>
          ))}
        </div>
      )}
      <ModalFollow
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        roomId={selectedRoom?.room_id}
        roomName={selectedRoom?.room_name}
      />
    </div>
  );
};

export default Favourites;