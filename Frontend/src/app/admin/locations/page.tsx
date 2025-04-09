"use client";
import React, { useState } from "react";
import styles from "../../../styles/Admin.module.css";
import DeleteConfirmationModal from "../../../components/DelModal";

export default function LocationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
  const [selectedLocationId, setSelectedLocationId] = useState(null); 

  const locations = [
    { id: 1, name: "Офис 1", address: "ул. Ленина, 10" },
    { id: 2, name: "Офис 2", address: "пр. Мира, 25" },
    { id: 3, name: "Офис 3", address: "ул. Победы, 5" },
    { id: 4, name: "Офис 4", address: "ул. Советская, 15" },
    { id: 5, name: "Офис 5", address: "пр. Свободы, 30" },
    { id: 6, name: "Офис 6", address: "ул. Центральная, 8" },
    { id: 7, name: "Офис 7", address: "ул. Молодежная, 12" },
    { id: 8, name: "Офис 8", address: "пр. Строителей, 20" },
    { id: 9, name: "Офис 9", address: "ул. Парковая, 3" },
    { id: 10, name: "Офис 10", address: "ул. Южная, 18" },
  ];

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

 
  const [newLocation, setNewLocation] = useState({ name: "", address: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLocation({ ...newLocation, [name]: value });
  };

  const handleAddLocation = () => {
    if (newLocation.name && newLocation.address) {
      console.log("Новая локация:", newLocation);

      setNewLocation({ name: "", address: "" });
      setIsModalOpen(false);
    } else {
      alert("Пожалуйста, заполните все поля.");
    }
  };


  const handleDeleteLocation = (locationId) => {
    setSelectedLocationId(locationId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedLocationId) {
      console.log(`Удаление локации с ID ${selectedLocationId}`);
      
      setIsDeleteModalOpen(false);
      setSelectedLocationId(null);
    }
  };

  return (
    <main className={styles.content}>
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Добавление локации</h3>
            <form>
              <div className={styles.formGroup}>
                <label>Название:</label>
                <input
                  type="text"
                  name="name"
                  value={newLocation.name}
                  onChange={handleInputChange}
                  placeholder="Введите название"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Адрес:</label>
                <input
                  type="text"
                  name="address"
                  value={newLocation.address}
                  onChange={handleInputChange}
                  placeholder="Введите адрес"
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={handleAddLocation}
                  className={styles.addButton}
                >
                  Добавить
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.cancelButton}
                >
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
        <h2 className={styles.pageTitle}>Локации</h2>
        <div className={styles.actions}>
          <input
            type="text"
            placeholder="Поиск..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className={styles.addButton} onClick={() => setIsModalOpen(true)}>
            Добавить
          </button>
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
            {filteredLocations.map((location) => (
              <tr key={location.id}>
                <td>#{location.id}</td>
                <td>{location.name}</td>
                <td>{location.address}</td>
                <td className={styles.actionsCell}>
                  <button className={styles.editBtn}>
                    <img src="/svg/edit.svg" alt="Edit" width={16} height={16} />
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteLocation(location.id)}
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