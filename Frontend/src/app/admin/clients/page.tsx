'use client';

import React, { useState, useEffect } from 'react';
import styles from '../../../styles/Admin.module.css';
import DeleteConfirmationModal from '../../../components/DelModal';
import ClientStatusModal from '../../../components/ClientsStatusModal';
import { getData, postData, deleteData } from '../../../api/api-utils';
import { endpoints } from '../../../api/config';

// Интерфейс для данных с сервера
interface ServerClient {
  id_user: number;
  username: string;
  status: 'active' | 'blocked';
}

// Интерфейс для ClientStatusModal
interface ModalClient {
  id: number;
  name: string;
  username: string;
  status: 'Активен' | 'Заблокирован';
}

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [editingClient, setEditingClient] = useState<ModalClient | null>(null);
  const [clients, setClients] = useState<ServerClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка клиентов с бэкенда
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getData(endpoints.get_clients);
        if (response instanceof Error) {
          throw new Error('Не удалось загрузить список клиентов');
        }

        const adaptedClients: ServerClient[] = response.users.map((user: any) => ({
          id_user: user.id_user,
          username: user.username,
          status: user.status as 'active' | 'blocked',
        }));
        setClients(adaptedClients);
      } catch (error) {
        console.error('Ошибка при загрузке клиентов:', error);
        setError('Не удалось загрузить список клиентов. Попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Фильтрация клиентов по username
  const filteredClients = clients.filter((client) =>
    client.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Преобразование статуса для отображения
  const displayStatus = (status: 'active' | 'blocked'): 'Активен' | 'Заблокирован' => {
    return status === 'active' ? 'Активен' : 'Заблокирован';
  };

  // Преобразование клиента для модального окна
  const toModalClient = (serverClient: ServerClient): ModalClient => ({
    id: serverClient.id_user,
    name: serverClient.username, // Используем username вместо name
    username: serverClient.username,
    status: serverClient.status === 'active' ? 'Активен' : 'Заблокирован',
  });

  // Преобразование клиента из модального окна для сервера
  const toServerClient = (modalClient: ModalClient): ServerClient => ({
    id_user: modalClient.id,
    username: modalClient.username,
    status: modalClient.status === 'Активен' ? 'active' : 'blocked',
  });

  // Обработка редактирования клиента
  const handleEditClient = (client: ServerClient) => {
    setEditingClient(toModalClient(client));
    setIsEditModalOpen(true);
  };

  // Обновление статуса клиента
  const handleUpdateClientStatus = async (modalClient: ModalClient) => {
    try {
      const serverClient = toServerClient(modalClient);
      const requestBody = {
        status: serverClient.status,
      };
      const response = await postData(endpoints.user_update(serverClient.id_user), requestBody);
      if (response instanceof Error) {
        throw new Error('Не удалось обновить статус клиента');
      }

      setClients((prev) =>
        prev.map((client) =>
          client.id_user === serverClient.id_user ? serverClient : client
        )
      );
      setIsEditModalOpen(false);
      setEditingClient(null);
      alert('Статус клиента успешно обновлен!');
    } catch (error) {
      console.error('Ошибка при обновлении статуса клиента:', error);
      alert('Не удалось обновить статус клиента. Попробуйте снова.');
    }
  };

  // Обработка удаления клиента
  const handleDeleteClient = (clientId: number) => {
    setSelectedClientId(clientId);
    setIsDeleteModalOpen(true);
  };

  // Подтверждение удаления клиента
  const confirmDelete = async () => {
    if (selectedClientId) {
      try {
        const response = await deleteData(endpoints.user_delete(selectedClientId));
        if (response.error) {
          throw new Error(response.error);
        }

        setClients((prev) => prev.filter((client) => client.id_user !== selectedClientId));
        setIsDeleteModalOpen(false);
        setSelectedClientId(null);
        alert('Клиент успешно удален!');
      } catch (error) {
        console.error('Ошибка при удалении клиента:', error);
        alert('Не удалось удалить клиента. Попробуйте снова.');
      }
    }
  };

  return (
    <main className={styles.content}>
      <ClientStatusModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingClient(null);
        }}
        client={editingClient}
        onSave={handleUpdateClientStatus}
      />

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
            placeholder="Поиск по имени пользователя..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <p>Загрузка клиентов...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя пользователя</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client.id_user}>
                    <td>#{client.id_user}</td>
                    <td>{client.username}</td>
                    <td>{displayStatus(client.status)}</td>
                    <td className={styles.actionsCell}>
                      <button
                        className={styles.editBtn}
                        onClick={() => handleEditClient(client)}
                      >
                        <img src="/svg/edit.svg" alt="Edit" width={16} height={16} />
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteClient(client.id_user)}
                      >
                        <img src="/svg/delete.svg" alt="Delete" width={16} height={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>Клиенты не найдены</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}