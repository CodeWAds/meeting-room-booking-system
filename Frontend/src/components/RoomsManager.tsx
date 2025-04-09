"use client";

import React, { useState, useEffect } from 'react';
import styles from '../styles/Rooms.module.css';
import { getData } from '../api/api-utils';
import { Room } from '../types/interfaces';

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

const initialRooms: Room[] = [
  {
    name: 'Генераторная',
    capacity: 'до 8 человек',
    location: '1 корпус, 2 этаж',
    icons: ['/svg/wifi.svg', '/svg/proektor.svg', '/svg/tv.svg', '/svg/internet.svg'],
  },
  {
    name: 'Библиотека',
    capacity: 'до 8 человек',
    location: '4 корпус, 2 этаж',
    icons: ['/svg/wifi.svg', '/svg/proektor.svg', '/svg/tv.svg', '/svg/internet.svg'],
  },
  {
    name: 'Офис',
    capacity: 'до 8 человек',
    location: '4 корпус, 2 этаж',
    icons: ['/svg/wifi.svg', '/svg/proektor.svg', '/svg/tv.svg', '/svg/internet.svg'],
  },
  {
    name: 'Корпус',
    capacity: 'до 8 человек',
    location: '4 корпус, 2 этаж',
    icons: ['/svg/wifi.svg', '/svg/proektor.svg', '/svg/tv.svg', '/svg/internet.svg'],
  },
  {
    name: 'Колледж',
    capacity: 'до 8 человек',
    location: '4 корпус, 2 этаж',
    icons: ['/svg/wifi.svg', '/svg/proektor.svg', '/svg/tv.svg', '/svg/internet.svg'],
  },
  {
    name: 'Театр',
    capacity: 'до 8 человек',
    location: '4 корпус, 2 этаж',
    icons: ['/svg/wifi.svg', '/svg/proektor.svg', '/svg/tv.svg', '/svg/internet.svg'],
  },
  {
    name: 'Кино',
    capacity: 'до 8 человек',
    location: '4 корпус, 2 этаж',
    icons: ['/svg/wifi.svg', '/svg/proektor.svg', '/svg/tv.svg', '/svg/internet.svg'],
  },
];

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

const RoomsManager: React.FC = () => {

  return (
    <div className={styles.rooms}>
      <div className={styles.roomsListManager}>
        {initialRooms.map((room, index) => (
          <div key={index} className={styles.roomCard}>
            <div className={styles.headCard}>
              <h4>{room.name}</h4>
              <div className='buttonsHeadCard'>
              <button>
                <img src='/svg/edit.svg' alt='edit' className={styles.headIcon} />
              </button>
              <button>
                <img src='/svg/delete.svg' alt='delete' className={styles.headIcon} />
              </button>
              </div>
            </div>
            <p>Локация: {room.location}</p>
            <p>Вместимость: {room.capacity}</p>
            <div className={styles.roomIcons}>
              {room.icons.map((icon, i) => (
                <img key={i} src={icon} alt={`icon-${i}`} className={styles.roomIcon} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomsManager;