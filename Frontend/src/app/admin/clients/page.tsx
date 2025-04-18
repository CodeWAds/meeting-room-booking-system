
"use client";
import React, { useState } from "react";
import styles from "../../../styles/Admin.module.css";
import DeleteConfirmationModal from "../../../components/DelModal";
import ClientStatusModal from "../../../components/ClientsStatusModal";

interface Client {
  id: number;
  name: string;
  username: string;
  status: "Активен" | "Заблокирован";
}

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [clients, setClients] = useState<Client[]>([
    { id: 1, name: "Анна", username: "anna_sky", status: "Активен" },
    { id: 2, name: "Дмитрий", username: "dmitry_rock", status: "Активен" },
    { id: 3, name: "София", username: "sofia_star", status: "Заблокирован" },
    { id: 4, name: "Максим", username: "max_sun", status: "Активен" },
    { id: 5, name: "Екатерина", username: "katya_moon", status: "Активен" },
    { id: 6, name: "Владимир", username: "vova_wind", status: "Заблокирован" },
    { id: 7, name: "Ольга", username: "olga_rain", status: "Активен" },
    { id: 8, name: "Николай", username: "nikolay_fire", status: "Активен" },
    { id: 9, name: "Татьяна", username: "tanya_wave", status: "Заблокирован" },
    { id: 10, name: "Сергей", username: "sergey_stone", status: "Активен" },
  ]);

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setIsEditModalOpen(true);
  };

  const handleUpdateClientStatus = (updatedClient: Client) => {
    setClients((prev) =>
      prev.map((client) =>
        client.id === updatedClient.id ? updatedClient : client
      )
    );
    setIsEditModalOpen(false);
    setEditingClient(null);
  };

  const handleDeleteClient = (clientId: number) => {
    setSelectedClientId(clientId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedClientId) {
      setClients((prev) => prev.filter((client) => client.id !== selectedClientId));
      setIsDeleteModalOpen(false);
      setSelectedClientId(null);
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
            placeholder="Поиск..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя</th>
              <th>Логин</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => (
              <tr key={client.id}>
                <td>#{client.id}</td>
                <td>{client.name}</td>
                <td>{client.username}</td>
                <td>{client.status}</td>
                <td className={styles.actionsCell}>
                  <button
                    className={styles.editBtn}
                    onClick={() => handleEditClient(client)}
                  >
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