
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../styles/Admin.module.css';

export default function AdminHeaderNav() {
  const pathname = usePathname();


  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <>
      {}
      <header className={styles.header}>
        <span className={styles.headerTitle}>Панель администратора</span>
        <Link href="/auth" className={styles.logoutButton} title="Выход">
          <img src="/svg/exit.svg" alt="Выход" width={24} height={24} />
        </Link>
      </header>

      {}
      <nav className={styles.navbar}>
        <Link
          href="/admin/clients"
          className={`${styles.navLink} ${isActive('/admin/clients') ? styles.navLinkActive : ''}`}
        >
          <img src="/svg/clients.svg" alt="Клиенты" width={20} height={20} /> Клиенты
        </Link>
        <Link
          href="/admin/staff"
          className={`${styles.navLink} ${isActive('/admin/staff') ? styles.navLinkActive : ''}`}
        >
          <img src="/svg/staff.svg" alt="Сотрудники" width={20} height={20} /> Сотрудники
        </Link>
        <Link
          href="/admin/locations"
          className={`${styles.navLink} ${isActive('/admin/locations') ? styles.navLinkActive : ''}`}
        >
          <img src="/svg/locations.svg" alt="Локации" width={20} height={20} /> Локации
        </Link>
        <Link
          href="/admin/rooms"
          className={`${styles.navLink} ${isActive('/admin/rooms') ? styles.navLinkActive : ''}`}
        >
          <img src="/svg/rooms.svg" alt="Комнаты" width={20} height={20} /> Комнаты
        </Link>
        <Link
          href="/admin/bookings"
          className={`${styles.navLink} ${isActive('/admin/bookings') ? styles.navLinkActive : ''}`}
        >
          <img src="/svg/booking.svg" alt="Брони" width={20} height={20} /> Брони
        </Link>
      </nav>
    </>
  );
}