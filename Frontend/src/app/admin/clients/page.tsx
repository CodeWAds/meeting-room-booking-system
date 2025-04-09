"use client";
import React, { useState } from "react";
import styles from "../../../styles/Admin.module.css";
import DeleteConfirmationModal from "../../../components/DelModal";

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
  const [selectedClientId, setSelectedClientId] = useState(null); 

  const clients = [
    { id: 1, name: "Анна", username: "anna_sky" },
    { id: 2, name: "Дмитрий", username: "dmitry_rock" },
    { id: 3, name: "София", username: "sofia_star" },
    { id: 4, name: "Максим", username: "max_sun" },
    { id: 5, name: "Екатерина", username: "katya_moon" },
    { id: 6, name: "Владимир", username: "vova_wind" },
    { id: 7, name: "Ольга", username: "olga_rain" },
    { id: 8, name: "Николай", username: "nikolay_fire" },
    { id: 9, name: "Татьяна", username: "tanya_wave" },
    { id: 10, name: "Сергей", username: "sergey_stone" },
  ];

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const [newClient, setNewClient] = useState({ name: "", username: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient({ ...newClient, [name]: value });
  };

  const handleAddClient = () => {
    if (newClient.name && newClient.username) {
      console.log("Новый клиент:", newClient);

      setNewClient({ name: "", username: "" });
      setIsAddModalOpen(false);
    } else {
      alert("Пожалуйста, заполните все поля.");
    }
  };


  const handleDeleteClient = (clientId) => {
    setSelectedClientId(clientId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedClientId) {
      console.log(`Удаление клиента с ID ${selectedClientId}`);
      
      setIsDeleteModalOpen(false);
      setSelectedClientId(null);
    }
  };

  return (
    <main className={styles.content}>
   
      {isAddModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Добавление записи</h3>
            <form>
              <div className={styles.formGroup}>
                <label>Имя:</label>
                <input
                  type="text"
                  name="name"
                  value={newClient.name}
                  onChange={handleInputChange}
                  placeholder="Введите имя"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Логин:</label>
                <input
                  type="text"
                  name="username"
                  value={newClient.username}
                  onChange={handleInputChange}
                  placeholder="Введите логин"
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={handleAddClient} className={styles.addButtonModal}>
                  Добавить
                </button>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className={styles.cancelButton}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={confirmDelete}
        />
      )}

      
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
          <button className={styles.addButton} onClick={() => setIsAddModalOpen(true)}>
            Добавить
          </button>
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
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteClient(client.id)}
                  >
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