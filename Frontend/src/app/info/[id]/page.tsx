'use client';

import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import styles from '../../../styles/Info.module.css';
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
  location_name: string;
  capacity: number;
  user: number;
  room: number;
  date: string;
  review: number | null;
  status: string;
  time_slot: TimeSlot[];
  'verify code': number;
}

interface Room {
  id: number;
  name: string;
  status: 'Свободно' | 'Занято';
}

interface InfoPageProps {
  params: Promise<{ id: string }>;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
  }
  return res.json();
};

const isRoomOccupied = (bookings: Booking[], roomId: number, currentTime: Date): boolean => {
  const currentDate = currentTime.toISOString().split('T')[0]; // YYYY-MM-DD
  const currentHours = currentTime.getHours().toString().padStart(2, '0');
  const currentMinutes = currentTime.getMinutes().toString().padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}:00`;

  return bookings.some((booking) => {
    if (booking.room !== roomId || booking.status !== 'confirmed' || booking.date !== currentDate) {
      return false;
    }
    return booking.time_slot.some((slot) => {
      return slot.time_begin <= currentTimeStr && currentTimeStr < slot.time_end;
    });
  });
};

async function fetchRooms(id: string): Promise<Room[] | null> {
  try {
    const roomsRes = await fetch(endpoints.rooms(Number(id)), { cache: 'no-store' });
    if (!roomsRes.ok) {
      console.error(`Rooms fetch failed: ${roomsRes.status} ${roomsRes.statusText}`);
      throw new Error(`Failed to fetch rooms: ${roomsRes.status} ${roomsRes.statusText}`);
    }
    const roomsData = await roomsRes.json();
    console.log('Rooms data:', roomsData); // Отладка

    const roomsArray = roomsData.rooms || [];
    if (!Array.isArray(roomsArray)) {
      console.error('Rooms data is not an array:', roomsArray);
      return [];
    }

    return roomsArray.map((room: any) => ({
      id: room.id_room || 0,
      name: room.room_name || `Room ${room.id_room}`,
      status: 'Свободно' as 'Свободно' | 'Занято',
    }));
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return null;
  }
}

export default function InfoPage({ params }: InfoPageProps) {
  const { id } = React.use(params);
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, error: swrError } = useSWR<{ Booking: Booking[] }>(
    id ? endpoints.get_location_booking(Number(id)) : null,
    fetcher,
    { refreshInterval: 3000 } // Обновление каждые 30 секунд
  );

  useEffect(() => {
    async function loadRooms() {
      const fetchedRooms = await fetchRooms(id);
      if (!fetchedRooms) {
        setError('Не удалось загрузить комнаты. Проверьте ID локации или попробуйте позже.');
        return;
      }
      setRooms(fetchedRooms);
    }
    loadRooms();
  }, [id]);

  const currentTime = new Date();

  const updatedRooms = rooms?.map((room) => ({
    ...room,
    status: data && isRoomOccupied(data.Booking, room.id, currentTime) ? 'Занято' : 'Свободно',
  }));

  if (error || !updatedRooms) {
    return (
      <div className={styles.pageContainer}>
        <header className={styles.header}>Ошибка</header>
        <main className={styles.roomsGrid}>
          <p className={styles.error}>{error || 'Комнаты не найдены.'}</p>
        </main>
      </div>
    );
  }

  return (
    <>
      <header className={styles.header}>Доступные и занятые переговорные комнаты</header>
      <div className={styles.pageContainer}>
        <main className={styles.roomsGrid}>
          {updatedRooms.length === 0 ? (
            <p>Комнаты отсутствуют</p>
          ) : (
            updatedRooms.map((room) => (
              <div key={room.id} className={styles.roomCard}>
                <span className={styles.roomName}>{room.name}</span>
                <span
                  className={`${styles.roomStatus} ${
                    room.status === 'Свободно' ? styles.statusFree : styles.statusBusy
                  }`}
                >
                  {swrError ? 'Ошибка загрузки' : room.status}
                </span>
              </div>
            ))
          )}
        </main>
      </div>
    </>
  );
}