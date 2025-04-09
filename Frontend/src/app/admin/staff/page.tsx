"use client";
import React, { useState } from "react";
import styles from "../../../styles/Admin.module.css";
import DeleteConfirmationModal from "../../../components/DelModal";

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null); 

  const staff = [
    { id: 1, name: "Анна", username: "anna_smirnova" },
    { id: 2, name: "Дмитрий", username: "dmitry_k" },
    { id: 3, name: "Елена", username: "elena_v" },
    { id: 4, name: "Сергей", username: "sergey_p" },
    { id: 5, name: "Ольга", username: "olga_m" },
    { id: 6, name: "Петр", username: "petr_i" },
    { id: 7, name: "Наталья", username: "natalya_k" },
    { id: 8, name: "Андрей", username: "andrey_s" },
    { id: 9, name: "Екатерина", username: "ekaterina_l" },
    { id: 10, name: "Михаил", username: "mikhail_v" },
  ];

  const filteredStaff = staff.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const [newEmployee, setNewEmployee] = useState({ name: "", username: "" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee({ ...newEmployee, [name]: value });
  };

  const handleAddEmployee = () => {
    if (newEmployee.name && newEmployee.username) {
      console.log("Новый сотрудник:", newEmployee);

      setNewEmployee({ name: "", username: "" });
      setIsModalOpen(false);
    } else {
      alert("Пожалуйста, заполните все поля.");
    }
  };

  
  const handleDeleteEmployee = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedEmployeeId) {
      console.log(`Удаление сотрудника с ID ${selectedEmployeeId}`);
   
      setIsDeleteModalOpen(false);
      setSelectedEmployeeId(null);
    }
  };

  return (
    <main className={styles.content}>
     
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Добавление сотрудника</h3>
            <form>
              <div className={styles.formGroup}>
                <label>Имя:</label>
                <input
                  type="text"
                  name="name"
                  value={newEmployee.name}
                  onChange={handleInputChange}
                  placeholder="Введите имя"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Логин:</label>
                <input
                  type="text"
                  name="username"
                  value={newEmployee.username}
                  onChange={handleInputChange}
                  placeholder="Введите логин"
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={handleAddEmployee}
                  className={styles.addButtonModal}
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
        <h2 className={styles.pageTitle}>Сотрудники</h2>
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
              <th>Имя</th>
              <th>Логин</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map((employee) => (
              <tr key={employee.id}>
                <td>#{employee.id}</td>
                <td>{employee.name}</td>
                <td>{employee.username}</td>
                <td className={styles.actionsCell}>
                  <button className={styles.editBtn}>
                    <img src="/svg/edit.svg" alt="Edit" width={16} height={16} />
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => handleDeleteEmployee(employee.id)}
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