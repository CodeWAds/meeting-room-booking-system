import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Navbar.module.css';
import { useStore } from '../store/app-store';

interface NavbarProps {
  title: string;
}

const Navbar: React.FC<NavbarProps> = (props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLDivElement>(null);
  const store = useStore();

  useEffect(() => {
    store.setUserKarma(null);
  }, [store.user]);

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
    <nav className={styles.navbar}>
      <div className={styles.navbarBrand}>{props.title}</div>
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
            <span>{store.user ? store.user.first_name : "Загрузка..."}</span>
            <span>({store.karma ? store.karma : "Загрузка..."})</span>
          </div>
        <a href="/" onClick={handleLinkClick}>Главная</a>
        <a href="favourites" onClick={handleLinkClick}>Избранное</a>
        <a href="myBooking" onClick={handleLinkClick}>Мои бронирования</a>
      </div>
    </nav>
  );
};

export default Navbar;