"use client";
import React, { useState } from 'react';
import AdminHeaderNav from '../../../components/Admin';
import styles from '../../../styles/Admin.module.css';

export default function RoomsPage() {
    const [searchTerm, setSearchTerm] = useState(''); 
    
  const rooms = [
    { id: 1, name: 'Комната 101', capacity: 10 },
    { id: 2, name: 'Комната 102', capacity: 15 },
    { id: 3, name: 'Комната 103', capacity: 8 },
    { id: 4, name: 'Комната 104', capacity: 12 },
    { id: 5, name: 'Комната 105', capacity: 20 },
    { id: 6, name: 'Комната 106', capacity: 5 },
    { id: 7, name: 'Комната 107', capacity: 18 },
    { id: 8, name: 'Комната 108', capacity: 7 },
    { id: 9, name: 'Комната 109', capacity: 14 },
    { id: 10, name: 'Комната 110', capacity: 9 },
  ];

  const room = rooms.filter((rooms) =>
    rooms.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className={styles.adminLayout}>
      <AdminHeaderNav />
      <main className={styles.content}>
        <div className={styles.contentHeader}>
          <h2 className={styles.pageTitle}>Комнаты</h2>
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
                <th>Название</th>
                <th>Вместимость</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {room.map((room) => (
                <tr key={room.id}>
                  <td>#{room.id}</td>
                  <td>{room.name}</td>
                  <td>{room.capacity}</td>
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
    </div>
  );
}