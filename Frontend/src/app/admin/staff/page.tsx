
"use client";
import React, { useState } from "react";
import styles from "../../../styles/Admin.module.css";
import DeleteConfirmationModal from "../../../components/DelModal";

import EmployeeModal from "../../../components/StaffModal";

interface Employee {
  id: number;
  name: string;
  username: string;
  password?: string;
}

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const [staff, setStaff] = useState<Employee[]>([

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

  ]);


  const filteredStaff = staff.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleAddOrUpdateEmployee = (employee: Employee) => {
    if (editingEmployee) {
      setStaff((prev) =>
        prev.map((emp) => (emp.id === editingEmployee.id ? { ...employee, id: emp.id } : emp))
      );
    } else {
      setStaff((prev) => [
        ...prev,
        { ...employee, id: prev.length ? Math.max(...prev.map((emp) => emp.id)) + 1 : 1 },
      ]);
    }
    setEditingEmployee(null);
    setIsModalOpen(false);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDeleteEmployee = (employeeId: number) => {
    setSelectedEmployeeId(employeeId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedEmployeeId) {

      setStaff((prev) => prev.filter((emp) => emp.id !== selectedEmployeeId));

      setIsDeleteModalOpen(false);
      setSelectedEmployeeId(null);
    }
  };

  return (
    <main className={styles.content}>
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
        }}
        onSave={handleAddOrUpdateEmployee}
        employeeToEdit={editingEmployee}
      />

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

                  <button
                    className={styles.editBtn}
                    onClick={() => handleEditEmployee(employee)}
                  >

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