import React, { useState, useEffect } from 'react';
import styles from '../styles/StaffModal.module.css';

// Интерфейс для роли текущего пользователя
interface UserRole {
  role: string;
  location_id?: number;
}

interface Employee {
  id: number;
  name: string;
  username: string;
  password?: string;
  roles: string[];
}

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  employeeToEdit?: Employee | null;
  currentUserRoles: UserRole[];
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employeeToEdit,
  currentUserRoles,
}) => {
  const [employee, setEmployee] = useState<Employee>(
    employeeToEdit || {
      id: 0,
      name: '',
      username: '',
      password: '',
      roles: ['manager'], // По умолчанию новая роль — manager
    }
  );

  useEffect(() => {
    if (employeeToEdit) {
      setEmployee(employeeToEdit);
    } else {
      setEmployee({ id: 0, name: '', username: '', password: '', roles: ['manager'] });
    }
  }, [employeeToEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    setEmployee((prev) => {
      const newRoles = checked
        ? [...prev.roles, role]
        : prev.roles.filter((r) => r !== role);
      return { ...prev, roles: newRoles };
    });
  };

  const handleSave = () => {
    if (!employee.name || !employee.username) {
      alert('Пожалуйста, заполните все обязательные поля.');
      return;
    }
    if (employee.roles.length === 0) {
      alert('Пожалуйста, выберите хотя бы одну роль.');
      return;
    }
    onSave(employee);
  };

  // Проверяем, является ли текущий пользователь superadmin
  const isSuperadmin = currentUserRoles.some((role) => role.role === 'superadmin');
  const canEditAdminRoles = isSuperadmin;

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>{employeeToEdit ? 'Редактирование сотрудника' : 'Добавление сотрудника'}</h3>
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
              value={employee.password || ''}
              onChange={handleInputChange}
              placeholder="Введите пароль"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Роли</label>
            <div className={styles.checkboxGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={employee.roles.includes('manager')}
                  onChange={(e) => handleRoleChange('manager', e.target.checked)}
                />
                Manager
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={employee.roles.includes('admin')}
                  onChange={(e) => handleRoleChange('admin', e.target.checked)}
                  disabled={!canEditAdminRoles}
                />
                Admin {canEditAdminRoles ? '' : '(Только для superadmin)'}
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={employee.roles.includes('superadmin')}
                  onChange={(e) => handleRoleChange('superadmin', e.target.checked)}
                  disabled={!canEditAdminRoles}
                />
                Superadmin {canEditAdminRoles ? '' : '(Только для superadmin)'}
              </label>
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button type="button" onClick={handleSave} className={styles.saveButton}>
            {employeeToEdit ? 'Сохранить' : 'Добавить'}
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