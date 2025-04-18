
import React, { useState, useEffect } from "react";
import styles from "../styles/StaffModal.module.css";

interface Employee {
  id: number;
  name: string;
  username: string;
  password?: string;
}

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  employeeToEdit?: Employee | null;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employeeToEdit,
}) => {
  const [employee, setEmployee] = useState<Employee>(
    employeeToEdit || {
      id: 0,
      name: "",
      username: "",
      password: "",
    }
  );

  useEffect(() => {
    if (employeeToEdit) {
      setEmployee(employeeToEdit);
    } else {
      setEmployee({ id: 0, name: "", username: "", password: "" });
    }
  }, [employeeToEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!employee.name || !employee.username) {
      alert("Пожалуйста, заполните все обязательные поля.");
      return;
    }
    onSave(employee);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>{employeeToEdit ? "Редактирование сотрудника" : "Добавление сотрудника"}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label>Имя</label>
            <input
              type="text"
              name="name"
              value={employee.name}
              onChange={handleInputChange}
              placeholder="Введите имя"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Логин</label>
            <input
              type="text"
              name="username"
              value={employee.username}
              onChange={handleInputChange}
              placeholder="Введите логин"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Новый пароль (необязательно)</label>
            <input
              type="password"
              name="password"
              value={employee.password || ""}
              onChange={handleInputChange}
              placeholder="Введите новый пароль"
            />
          </div>
        </div>

        <div className={styles.modalActions}>
          <button type="button" onClick={handleSave} className={styles.saveButton}>
            {employeeToEdit ? "Сохранить" : "Добавить"}
          </button>
          <button type="button" onClick={onClose} className={styles.cancelButton}>
            Отменить
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;