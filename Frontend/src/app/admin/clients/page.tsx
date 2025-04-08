"use client";
import React, { useState } from 'react';
import AdminHeaderNav from '../../../components/Admin';
import styles from '../../../styles/Admin.module.css';

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState(''); 

  const clients = [
    { id: 1, name: 'Анна', username: 'anna_sky' },
    { id: 2, name: 'Дмитрий', username: 'dmitry_rock' },
    { id: 3, name: 'София', username: 'sofia_star' },
    { id: 4, name: 'Максим', username: 'max_sun' },
    { id: 5, name: 'Екатерина', username: 'katya_moon' },
    { id: 6, name: 'Владимир', username: 'vova_wind' },
    { id: 7, name: 'Ольга', username: 'olga_rain' },
    { id: 8, name: 'Николай', username: 'nikolay_fire' },
    { id: 9, name: 'Татьяна', username: 'tanya_wave' },
    { id: 10, name: 'Сергей', username: 'sergey_stone' },
];


  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.adminLayout}>
      <AdminHeaderNav />
      <main className={styles.content}>
        <div className={styles.contentHeader}>
          <h2 className={styles.pageTitle}>Клиенты</h2>
          <div className={styles.actions}>
          
            <input
              type="text"
              placeholder="Поиск..."
              className={styles.searchInput}
              value={searchTerm}
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
                <th>Имя</th>
                <th>Логин</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id}>
                  <td>#{client.id}</td>
                  <td>{client.name}</td>
                  <td>{client.username}</td>
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