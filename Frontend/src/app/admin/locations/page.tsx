// pages/admin/locations/index.tsx
"use client";
import React, { useState } from "react";
import styles from "../../../styles/Admin.module.css";
import DeleteConfirmationModal from "../../../components/DelModal";

import LocationModal from "../../../components/LocationsModule";

interface Slot {
  start: string;
  end: string;
}

interface SpecialSlot extends Slot {
  date: string;
}

interface Location {
  id: number;
  name: string;
  address: string;
  isAvailable: boolean;
  unavailabilityReason?: string;
  unavailabilityStart?: string;
  unavailabilityEnd?: string;
  regularSlots: Slot[];
  specialSlots: SpecialSlot[];
}

export default function LocationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const [locations, setLocations] = useState<Location[]>([
    {
      id: 1,
      name: "Офис 1",
      address: "ул. Ленина, 10",
      isAvailable: true,
      regularSlots: [],
      specialSlots: [],
    },
    {
      id: 2,
      name: "Офис 2",
      address: "пр. Мира, 25",
      isAvailable: true,
      regularSlots: [],
      specialSlots: [],
    },
    // ... другие локации
  ]);

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleAddOrUpdateLocation = (location: Location) => {
    if (editingLocation) {
      setLocations((prev) =>
        prev.map((loc) => (loc.id === editingLocation.id ? { ...location, id: loc.id } : loc))
      );
    } else {
      setLocations((prev) => [
        ...prev,
        { ...location, id: prev.length ? Math.max(...prev.map((loc) => loc.id)) + 1 : 1 },
      ]);
    }
    setEditingLocation(null);
    setIsModalOpen(false);
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const handleDeleteLocation = (locationId: number) => {

    setSelectedLocationId(locationId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedLocationId) {

      setLocations((prev) => prev.filter((loc) => loc.id !== selectedLocationId));

      setIsDeleteModalOpen(false);
      setSelectedLocationId(null);
    }
  };

  return (
    <main className={styles.content}>

      <LocationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLocation(null);
        }}
        onSave={handleAddOrUpdateLocation}
        locationToEdit={editingLocation}
      />

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

                  <button
                    className={styles.editBtn}
                    onClick={() => handleEditLocation(location)}
                  >

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