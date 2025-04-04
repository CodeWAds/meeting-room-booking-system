"use client";

import React, { useState } from 'react';
import AdminHeaderNav from '../../../components/Admin';
import styles from '../../../styles/Admin.module.css';

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const staff = [
    { id: 1, name: 'Анна', username: 'anna_smirnova' },
    { id: 2, name: 'Дмитрий', username: 'dmitry_k' },
    { id: 3, name: 'Елена', username: 'elena_v' },
    { id: 4, name: 'Сергей', username: 'sergey_p' },
    { id: 5, name: 'Ольга', username: 'olga_m' },
    { id: 6, name: 'Петр', username: 'petr_i' },
    { id: 7, name: 'Наталья', username: 'natalya_k' },
    { id: 8, name: 'Андрей', username: 'andrey_s' },
    { id: 9, name: 'Екатерина', username: 'ekaterina_l' },
    { id: 10, name: 'Михаил', username: 'mikhail_v' },
  ];

  const staffs = staff.filter((staff) =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.adminLayout}>
      <AdminHeaderNav />
      <main className={styles.content}>
        <div className={styles.contentHeader}>
          <h2 className={styles.pageTitle}>Сотрудники</h2>
          <div className={styles.actions}>
            
            <input type="text" placeholder="Поиск..." className={styles.searchInput} 
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
              {staffs.map((employee) => (
                <tr key={employee.id}>
                  <td>#{employee.id}</td>
                  <td>{employee.name}</td>
                  <td>{employee.username}</td>
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