
"use client";

import React from 'react';
import styles from '../../styles/Info.module.css';

interface Room {
  id: number;
  name: string;
  status: 'Свободно' | 'Занято';
}

const mockRooms: Room[] = [
  { id: 1, name: 'Генераторная 1', status: 'Свободно' },
  { id: 2, name: 'Генераторная 1', status: 'Занято' },
  { id: 3, name: 'Генераторная 1', status: 'Свободно' },
  { id: 4, name: 'Генераторная 2', status: 'Свободно' },
  { id: 5, name: 'Генераторная 2', status: 'Занято' },
  { id: 6, name: 'Генераторная 2', status: 'Свободно' },
  { id: 7, name: 'Генераторная 3', status: 'Занято' },
  { id: 8, name: 'Генераторная 3', status: 'Занято' },
  { id: 9, name: 'Генераторная 3', status: 'Занято' },
  { id: 10, name: 'Генераторная 4', status: 'Занято' },
  { id: 11, name: 'Генераторная 4', status: 'Свободно' },
  { id: 12, name: 'Генераторная 4', status: 'Занято' },
  { id: 13, name: 'Генераторная 5', status: 'Свободно' },
  { id: 14, name: 'Генераторная 5', status: 'Свободно' },
  { id: 15, name: 'Генераторная 5', status: 'Занято' },
];

const InfoPage: React.FC = () => {
  return (
    <>
      <header className={styles.header}>
        Доступные и занятые переговорные комнаты
      </header>

      <div className={styles.pageContainer}>
        <main className={styles.roomsGrid}>
          {mockRooms.map((room) => (
            <div key={room.id} className={styles.roomCard}>
              <span className={styles.roomName}>{room.name}</span>
              <span
                className={`${styles.roomStatus} ${
                  room.status === 'Свободно' ? styles.statusFree : styles.statusBusy
                }`}
              >
                {room.status}
              </span>
            </div>
          ))}
        </main>
      </div>
    </>
  );
};

export default InfoPage;