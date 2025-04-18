'use client';

import React, { useState, useEffect } from 'react';
import styles from '../../../styles/Admin.module.css';
import DeleteConfirmationModal from '../../../components/DelModal';
import EmployeeModal from '../../../components/StaffModal';
import { getData, postData, deleteData, updateData } from '../../../api/api-utils';
import { endpoints } from '../../../api/config';
import { useStore } from '../../../store/app-store';

// Интерфейс для данных с сервера
interface ServerEmployee {
  id_user: number;
  username: string;
  roles: string[];
  status: 'active' | 'blocked';
}

// Интерфейс для роли текущего пользователя
interface UserRole {
  role: string;
  location_id?: number;
}

// Интерфейс для EmployeeModal
interface ModalEmployee {
  id: number;
  name: string;
  username: string;
  password?: string;
  roles: string[];
}

export default function StaffPage() {
  const store = useStore();
  const currentUserId = store.id_user || 66; // Текущий пользователь из store или заглушка
  const [currentUserRoles, setCurrentUserRoles] = useState<UserRole[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<ModalEmployee | null>(null);
  const [staff, setStaff] = useState<ServerEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка ролей текущего пользователя
  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const response = await getData(endpoints.get_roles(currentUserId));
        if (response instanceof Error) {
          throw new Error('Не удалось загрузить роли пользователя');
        }
        console.log('Роли текущего пользователя:', response.roles);
        setCurrentUserRoles(response.roles || []);
      } catch (error) {
        console.error('Ошибка при загрузке ролей:', error);
        setError('Не удалось загрузить роли пользователя.');
        setIsLoading(false);
      }
    };

    if (currentUserId) {
      fetchUserRoles();
    } else {
      setError('ID текущего пользователя не найден.');
      setIsLoading(false);
    }
  }, [currentUserId]);

  // Загрузка сотрудников с бэкенда
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await postData(endpoints.get_staff, { id_user: currentUserId });
        if (response instanceof Error) {
          throw new Error('Не удалось загрузить список сотрудников');
        }

        console.log('Данные сотрудников с сервера:', response.users);

        const adaptedStaff: ServerEmployee[] = response.users
          .filter((user: any) => {
            const isNotCurrentUser = user.id_user !== currentUserId;
            console.log(`Пользователь ${user.id_user}: isNotCurrentUser=${isNotCurrentUser}`);
            return isNotCurrentUser;
          })
          .filter((user: any) => {
            // Проверяем наличие superadmin в currentUserRoles
            const hasSuperadmin = currentUserRoles.some((role) => role.role === 'superadmin');
            if (hasSuperadmin) {
              console.log(`Пользователь ${user.id_user}: superadmin, показываем`);
              return true; // Суперадмин видит всех, кроме себя
            }

            // Проверяем наличие admin (без superadmin)
            const hasAdmin = currentUserRoles.some((role) => role.role === 'admin');
            if (hasAdmin && !hasSuperadmin) {
              // Показываем только пользователей с ролью исключительно manager
              const isOnlyManager = user.roles.length === 1 && user.roles[0] === 'manager';
              console.log(`Пользователь ${user.id_user}: isOnlyManager=${isOnlyManager}`);
              return isOnlyManager;
              // Альтернатива: Показывать всех с ролью manager
              // const hasManagerRole = user.roles.includes('manager');
              // console.log(`Пользователь ${user.id_user}: hasManagerRole=${hasManagerRole}`);
              // return hasManagerRole;
            }

            console.log(`Пользователь ${user.id_user}: нет прав admin или superadmin, скрываем`);
            return false; // Если нет admin или superadmin, ничего не показываем
          })
          .map((user: any) => ({
            id_user: user.id_user,
            username: user.username,
            roles: user.roles,
            status: user.status as 'active' | 'blocked',
          }));

        console.log('Отфильтрованные сотрудники:', adaptedStaff);
        setStaff(adaptedStaff);
      } catch (error) {
        console.error('Ошибка при загрузке сотрудников:', error);
        setError('Не удалось загрузить список сотрудников. Попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUserId && currentUserRoles.length > 0) {
      fetchStaff();
    }
  }, [currentUserId, currentUserRoles]);

  // Фильтрация сотрудников по username
  const filteredStaff = staff.filter((employee) =>
    employee.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('Отображаемые сотрудники:', filteredStaff);

  // Преобразование сотрудника для модального окна
  const toModalEmployee = (serverEmployee: ServerEmployee): ModalEmployee => ({
    id: serverEmployee.id_user,
    name: serverEmployee.username, // Используем username как name
    username: serverEmployee.username,
    password: undefined, // Пароль не возвращается с сервера
    roles: serverEmployee.roles,
  });

  // Преобразование сотрудника из модального окна для сервера
  const toServerEmployee = (modalEmployee: ModalEmployee): ServerEmployee => ({
    id_user: modalEmployee.id,
    username: modalEmployee.username,
    roles: modalEmployee.roles,
    status:
      staff.find((emp) => emp.id_user === modalEmployee.id)?.status || 'active',
  });

  // Обновление или создание сотрудника
  const handleAddOrUpdateEmployee = async (modalEmployee: ModalEmployee) => {
    try {
      const serverEmployee = toServerEmployee(modalEmployee);
      const requestBody = {
        username: modalEmployee.username,
        password: modalEmployee.password || undefined,
        name: modalEmployee.name,
        roles: serverEmployee.roles, // Отправляем выбранные роли
      };

      let response;
      if (modalEmployee.id === 0) {
        // Создание нового сотрудника
        // Предполагаем, что endpoints.create_user существует
        // response = await postData(endpoints.create_user || endpoints.user_update(0), requestBody);
      } else {
        // Обновление существующего сотрудника
        response = await updateData(endpoints.user_update(serverEmployee.id_user), requestBody);
      }

      if (response instanceof Error) {
        throw new Error('Не удалось сохранить сотрудника');
      }

      if (modalEmployee.id === 0) {
        // Добавляем нового сотрудника в список (предполагаем, что сервер вернул id_user)
        setStaff((prev) => [
          ...prev,
          {
            ...serverEmployee,
            id_user: response.id_user || Date.now(), // Используем временный ID, если сервер не вернул
          },
        ]);
      } else {
        // Обновляем существующего сотрудника
        setStaff((prev) =>
          prev.map((emp) =>
            emp.id_user === serverEmployee.id_user ? { ...serverEmployee } : emp
          )
        );
      }

      setIsModalOpen(false);
      setEditingEmployee(null);
      alert(modalEmployee.id === 0 ? 'Сотрудник успешно создан!' : 'Сотрудник успешно обновлен!');
    } catch (error) {
      console.error('Ошибка при сохранении сотрудника:', error);
      alert('Не удалось сохранить сотрудника. Попробуйте снова.');
    }
  };

  // Обработка редактирования сотрудника
  const handleEditEmployee = (employee: ServerEmployee) => {
    setEditingEmployee(toModalEmployee(employee));
    setIsModalOpen(true);
  };

  // Обработка удаления сотрудника
  const handleDeleteEmployee = (employeeId: number) => {
    setSelectedEmployeeId(employeeId);
    setIsDeleteModalOpen(true);
  };

  // Подтверждение удаления сотрудника
  const confirmDelete = async () => {
    if (selectedEmployeeId) {
      try {
        const response = await deleteData(endpoints.user_delete(selectedEmployeeId));
        if (response.error) {
          throw new Error(response.error);
        }

        setStaff((prev) => prev.filter((emp) => emp.id_user !== selectedEmployeeId));
        setIsDeleteModalOpen(false);
        setSelectedEmployeeId(null);
        alert('Сотрудник успешно удален!');
      } catch (error) {
        console.error('Ошибка при удалении сотрудника:', error);
        alert('Не удалось удалить сотрудника. Попробуйте снова.');
      }
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
        currentUserRoles={currentUserRoles}
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
            placeholder="Поиск по логину..."
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
        {isLoading ? (
          <p>Загрузка сотрудников...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : filteredStaff.length === 0 ? (
          <p>Сотрудники не найдены</p>
        ) : (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Логин</th>
                <th>Роли</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((employee) => (
                <tr key={employee.id_user}>
                  <td>#{employee.id_user}</td>
                  <td>{employee.username}</td>
                  <td>{employee.username}</td>
                  <td>{employee.roles.join(', ')}</td>
                  <td className={styles.actionsCell}>
                    <button
                      className={styles.editBtn}
                      onClick={() => handleEditEmployee(employee)}
                    >
                      <img src="/svg/edit.svg" alt="Edit" width={16} height={16} />
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDeleteEmployee(employee.id_user)}
                    >
                      <img src="/svg/delete.svg" alt="Delete" width={16} height={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}