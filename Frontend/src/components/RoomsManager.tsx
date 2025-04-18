'use client';

import React, { useState, useEffect } from 'react';
import styles from '../styles/Rooms.module.css';
import { getData, updateData } from '../api/api-utils';
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
  locationId: number | null;
  locationName?: string;
  onDelete: (room: { id_room: number; room_name: string }) => void;
  refreshKey?: number;
}

const RoomsManager: React.FC<RoomsManagerProps> = ({ locationId, locationName, onDelete, refreshKey = 0 }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [editRoomName, setEditRoomName] = useState<string>('');
  const [editCapacity, setEditCapacity] = useState<number>(1);
  const [editEquipmentIds, setEditEquipmentIds] = useState<number[]>([]); // Состояние для оборудования

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
  }, [locationId, refreshKey]);

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setEditRoomName(room.room_name);
    setEditCapacity(room.capacity);

    // Преобразуем id_equipment в индексы для equipmentIcons
    const equipmentIndexes = room.id_equipment
      .map((equip: Equipment) => {
        const equipmentNames = Object.keys(equipmentIcons);
        const index = equipmentNames.indexOf(equip.name);
        return index !== -1 ? index + 1 : null; // +1, так как индексы начинаются с 1
      })
      .filter((index): index is number => index !== null);

    setEditEquipmentIds(equipmentIndexes);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedRoom || !locationId) return;

    // Преобразуем индексы оборудования в массив id_equipment для отправки на сервер
    const updatedEquipmentIds = editEquipmentIds.map(id => id); // Индексы уже соответствуют id оборудования

    const requestBody = {
      room_name: editRoomName,
      capacity: editCapacity,
      id_equipment: updatedEquipmentIds, // Отправляем массив id оборудования
    };

    try {
      const response = await updateData(endpoints.update_room(locationId, selectedRoom.id_room), requestBody);
      if (response instanceof Error) throw response;

      alert('Комната обновлена!');
      setIsEditModalOpen(false);
      setSelectedRoom(null);
      setEditRoomName('');
      setEditCapacity(1);
      setEditEquipmentIds([]);

      // Обновляем список комнат локально
      const updatedRooms = rooms.map(room =>
        room.id_room === selectedRoom.id_room
          ? {
              ...room,
              room_name: editRoomName,
              capacity: editCapacity,
              id_equipment: updatedEquipmentIds.map(id => {
                const equipmentName = Object.keys(equipmentIcons)[id - 1];
                return { name: equipmentName, description: equipmentName };
              }),
            }
          : room
      );
      setRooms(updatedRooms);
    } catch (error) {
      console.error('Ошибка при обновлении комнаты:', error);
      alert('Не удалось обновить комнату. Попробуйте снова.');
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setSelectedRoom(null);
    setEditRoomName('');
    setEditCapacity(1);
    setEditEquipmentIds([]);
  };

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setEditCapacity(value < 1 ? 1 : value);
  };

  const handleEquipmentToggle = (id: number) => {
    setEditEquipmentIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(eqId => eqId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleDelete = (room: { id_room: number; room_name: string }) => {
    onDelete(room);
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
                <button onClick={() => handleEdit(room)}>
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
          </div>
        ))
      ) : (
        <p>Комнаты не найдены.</p>
      )}

      {/* Модальное окно для редактирования комнаты */}
      {isEditModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeButton} onClick={handleCancelEdit}>
              ✕
            </button>
            <h3>Редактировать комнату</h3>
            <div className={styles.modalContent}>
              <div className={styles.inputInModal}>
                <label>Название</label>
                <input
                  type="text"
                  placeholder="Название"
                  value={editRoomName}
                  onChange={(e) => setEditRoomName(e.target.value)}
                  className={styles.roomInput}
                />
              </div>
              <div className={styles.inputInModal}>
                <label>Вместимость</label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  placeholder="Вместимость (человек)"
                  value={editCapacity}
                  onChange={handleCapacityChange}
                  className={styles.roomInput}
                />
              </div>
              <div className={styles.equipmentList}>
                {Object.entries(equipmentIcons).map(([equipment, icon], index) => (
                  <label key={index} className={styles.equipmentItem}>
                    <input
                      type="checkbox"
                      checked={editEquipmentIds.includes(index + 1)}
                      onChange={() => handleEquipmentToggle(index + 1)}
                    />
                    <img src={icon} alt={equipment} className={styles.equipmentIcon} width="24" height="24" />
                    {equipment}
                  </label>
                ))}
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.confirmButton} onClick={handleSaveEdit}>
                Сохранить
              </button>
              <button className={styles.cancelButton} onClick={handleCancelEdit}>
                Отменить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomsManager;