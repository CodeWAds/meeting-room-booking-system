"use client";

import React, { useState, useEffect } from 'react';
import styles from '../../styles/Fav.module.css';
import Modal from './ModalFollow';
import Navbar from '../../components/Navbar';

interface Room {
  name: string;
  capacity: string;
  location: string;
  icons: string[];
}

const Favourites = () => {
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

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleFavourite = (room: Room) => {
    if (favourites.some((fav) => fav.name === room.name && fav.location === room.location)) {
      const updatedFavourites = favourites.filter(
        (fav) => !(fav.name === room.name && fav.location === room.location)
      );
      setFavourites(updatedFavourites);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookClick = () => {
    setIsModalOpen(true);
    console.log("Book button clicked");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles.rooms}>
      <Navbar title="Избранные переговорные" />
      {favourites.length === 0 ? (
        <p style={{ color: '#fff' }}>У вас пока нет избранных комнат.</p>
      ) : (
        <div className={styles.roomList}>
          {favourites.map((room, index) => (
            <div key={index} className={styles.roomCard}>
              <h4>{room.name}</h4>
              <p>Вместимость: {room.capacity}</p>
              <p>Локация: {room.location}</p>
              <div className={styles.roomIcons}>
                {room.icons.map((icon, i) => (
                  <img key={i} src={icon} alt={`icon-${i}`} className={styles.roomIcon} />
                ))}
              </div>
              <button className={styles.bookBtn} onClick={handleBookClick}>
                Забронировать
              </button>
              <span className={styles.favorite} onClick={() => toggleFavourite(room)}>
                <img src="/svg/liked.svg" alt="liked" />
              </span>
            </div>
          ))}
        </div>
      )}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default Favourites;