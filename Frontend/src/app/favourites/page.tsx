"use client";

import React, { useState, useEffect, useRef } from 'react';
import styles from '../../styles/fav.module.css';
import Modal from './ModalFollow'; 

interface Room {
  name: string;
  capacity: string;
  location: string;
  icons: string[];
}

// Убираем FavouritesProps, так как страница не получает props извне
const Favourites = () => {
  const [favourites, setFavourites] = useState<Room[]>(() => {
    if (typeof window !== 'undefined') {
      const savedFavourites = localStorage.getItem('favourites');
      return savedFavourites ? JSON.parse(savedFavourites) : [];
    }
    return [];
  });

  // Синхронизация с localStorage при монтировании компонента
  useEffect(() => {
    const syncFavourites = () => {
      if (typeof window !== 'undefined') {
        const savedFavourites = localStorage.getItem('favourites');
        setFavourites(savedFavourites ? JSON.parse(savedFavourites) : []);
      }
    };
    syncFavourites();
  }, []);

  // Обновление localStorage при изменении favourites
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('favourites', JSON.stringify(favourites));
    }
  }, [favourites]);

  // Слушаем изменения в localStorage (для других вкладок)
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
      const updatedFavourites = favourites.filter(
        (fav) => !(fav.name === room.name && fav.location === room.location)
      );
      setFavourites(updatedFavourites);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false); 

  // Определяем onBookClick внутри компонента
  const handleBookClick = () => {
    setIsModalOpen(true); 
    // Здесь можно добавить дополнительную логику для onBookClick, если нужно
    console.log("Book button clicked");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); 
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      burgerRef.current &&
      !burgerRef.current.contains(event.target as Node)
    ) {
      setIsMenuOpen(false);
    }
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className={styles.rooms}>
      <h3>Избранные переговорные</h3>
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
      <div
        className={styles.navbarBurger}
        onClick={handleMenuToggle}
        ref={burgerRef}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div
        className={`${styles.navbarMenu} ${isMenuOpen ? styles.active : ''}`}
        ref={menuRef}
      >
        <div className={styles.menuHeader}>
          <span>Ник</span>
          <span>(карма)</span>
        </div>
        <a href="/" onClick={handleLinkClick}>Главное</a>
        <a href="/favourites" onClick={handleLinkClick}>Избранное</a>
        <a href="/myBooking" onClick={handleLinkClick}>Мои бронирования</a>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default Favourites;
