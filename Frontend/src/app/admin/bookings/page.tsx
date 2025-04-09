"use client";
import React, { useState } from 'react';
import styles from '../../../styles/Admin.module.css';

export default function BookingsPage() {
     const [searchTerm, setSearchTerm] = useState(''); 
  const bookings = [
    { id: 1, room: 'Комната 101', date: '2025-04-01', time: '10:00-12:00' },
    { id: 2, room: 'Комната 102', date: '2025-04-02', time: '14:00-16:00' },
    { id: 3, room: 'Комната 103', date: '2025-04-03', time: '09:00-11:00' },
    { id: 4, room: 'Комната 104', date: '2025-04-04', time: '13:00-15:00' },
    { id: 5, room: 'Комната 105', date: '2025-04-05', time: '11:00-13:00' },
    { id: 6, room: 'Комната 106', date: '2025-04-06', time: '15:00-17:00' },
    { id: 7, room: 'Комната 107', date: '2025-04-07', time: '10:00-12:00' },
    { id: 8, room: 'Комната 108', date: '2025-04-08', time: '14:00-16:00' },
    { id: 9, room: 'Комната 109', date: '2025-04-09', time: '09:00-11:00' },
    { id: 10, room: 'Комната 110', date: '2025-04-10', time: '13:00-15:00' },
  ];
 const booking = bookings.filter((bookings) =>
    bookings.room.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
      <main className={styles.content}>
        <div className={styles.contentHeader}>
          <h2 className={styles.pageTitle}>Брони</h2>
          <div className={styles.actions}>
            <input type="text" placeholder="Поиск..." className={styles.searchInput}
              onChange={(e) => setSearchTerm(e.target.value)} 
             />
            <button className={styles.addButton}>Добавить</button>
          </div>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Комната</th>
                <th>Дата</th>
                <th>Время</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {booking.map((booking) => (
                <tr key={booking.id}>
                  <td>#{booking.id}</td>
                  <td>{booking.room}</td>
                  <td>{booking.date}</td>
                  <td>{booking.time}</td>
                  <td className={styles.actionsCell}>
                    <button className={styles.editBtn}>
                      <img src="/svg/edit.svg" alt="Edit" width={16} height={16} />
                    </button>
                    <button className={styles.deleteBtn}>
                      <img src="/svg/delete.svg" alt="Delete" width={16} height={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
  );
}