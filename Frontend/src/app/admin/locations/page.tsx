"use client";
import React, { useState } from 'react';
import AdminHeaderNav from '../../../components/Admin';
import styles from '../../../styles/Admin.module.css';

export default function LocationsPage() {
     const [searchTerm, setSearchTerm] = useState(''); 
  const locations = [
    { id: 1, name: 'Офис 1', address: 'ул. Ленина, 10' },
    { id: 2, name: 'Офис 2', address: 'пр. Мира, 25' },
    { id: 3, name: 'Офис 3', address: 'ул. Победы, 5' },
    { id: 4, name: 'Офис 4', address: 'ул. Советская, 15' },
    { id: 5, name: 'Офис 5', address: 'пр. Свободы, 30' },
    { id: 6, name: 'Офис 6', address: 'ул. Центральная, 8' },
    { id: 7, name: 'Офис 7', address: 'ул. Молодежная, 12' },
    { id: 8, name: 'Офис 8', address: 'пр. Строителей, 20' },
    { id: 9, name: 'Офис 9', address: 'ул. Парковая, 3' },
    { id: 10, name: 'Офис 10', address: 'ул. Южная, 18' },
  ];

  const location = locations.filter((locations) =>
    locations.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.adminLayout}>
      <AdminHeaderNav />
      <main className={styles.content}>
        <div className={styles.contentHeader}>
          <h2 className={styles.pageTitle}>Локации</h2>
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
                <th>Адрес</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {location.map((location) => (
                <tr key={location.id}>
                  <td>#{location.id}</td>
                  <td>{location.name}</td>
                  <td>{location.address}</td>
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