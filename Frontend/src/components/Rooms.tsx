"use client";

import React, { useState, useEffect } from 'react';
import styles from '../styles/Rooms.module.css';
import { getData } from '../api/api-utils';
import { Room } from '../types/interfaces';

interface RoomsProps {
  onBookClick: () => void;
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

const Rooms: React.FC<RoomsProps> = ({ onBookClick }) => {
  const [favourites, setFavourites] = useState<Room[]>(() => {
    if (typeof window !== 'undefined') {
      const savedFavourites = localStorage.getItem('favourites');
      return savedFavourites ? JSON.parse(savedFavourites) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('favourites', JSON.stringify(favourites));
    }
  }, [favourites]);

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

  const toggleFavourite = (room: Room) => {
    if (favourites.some((fav) => fav.name === room.name && fav.location === room.location)) {
      setFavourites(favourites.filter((fav) => !(fav.name === room.name && fav.location === room.location)));
    } else {
      setFavourites([...favourites, room]);
    }
  };

  return (
    <div className={styles.rooms}>
      <h3>Теперь выберите подходящую для вас переговорную комнату</h3>
      <div className={styles.roomList}>
        {initialRooms.map((room, index) => (
          <div key={index} className={styles.roomCard}>
            <h4>{room.name}</h4>
            <p>Вместимость: {room.capacity}</p>
            <p>Локация: {room.location}</p>
            <div className={styles.roomIcons}>
              {room.icons.map((icon, i) => (
                <img key={i} src={icon} alt={`icon-${i}`} className={styles.roomIcon} />
              ))}
            </div>
            <button className={styles.bookBtn} onClick={onBookClick}>
              Забронировать
            </button>
            <span onClick={() => toggleFavourite(room)} className={styles.favorite}>
              {favourites.some(
                (fav) => fav.name === room.name && fav.location === room.location
              ) ? (
                <img src="/svg/liked.svg" alt="liked" />
              ) : (
                <img src="/svg/notliked.svg" alt="not liked" />
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Rooms;