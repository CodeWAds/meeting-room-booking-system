'use client';

import React, { useState, useEffect } from 'react';
import styles from '../../../styles/Admin.module.css';
import DeleteConfirmationModal from '../../../components/DelModal';
import LocationModal from '../../../components/LocationsModule';
import { endpoints } from '../../../api/config';
import { getData, postData, updateData, deleteData } from '../../../api/api-utils';

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
  isAvailable?: boolean;
  unavailabilityReason?: string;
  unavailabilityStart?: string;
  unavailabilityEnd?: string;
  regularSlots?: Slot[];
  specialSlots?: SpecialSlot[];
}

export default function LocationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const data = await getData(endpoints.get_locations);
        if (data.error) {
          throw new Error(data.error.message || 'Failed to fetch locations');
        }
        console.log('Locations data:', data); // Отладка

        const fetchedLocations: Location[] = (data.locations || []).map((loc: any) => ({
          id: loc.id_location || 0,
          name: loc.name || 'Без названия',
          address: loc.address || 'Нет адреса',
          isAvailable: loc.isAvailable ?? true,
          unavailabilityReason: loc.unavailabilityReason || undefined,
          unavailabilityStart: loc.unavailabilityStart || undefined,
          unavailabilityEnd: loc.unavailabilityEnd || undefined,
          regularSlots: loc.regularSlots || [],
          specialSlots: loc.specialSlots || [],
        }));

        setLocations(fetchedLocations);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Не удалось загрузить локации. Попробуйте позже.');
      }
    }
    fetchLocations();
  }, []);

  const handleAddOrUpdateLocation = async (location: Location) => {
    try {
      if (editingLocation) {
        const payload = {
          id_location: location.id,
          name: location.name,
          address: location.address,
          isAvailable: location.isAvailable,
          unavailabilityReason: location.unavailabilityReason,
          unavailabilityStart: location.unavailabilityStart,
          unavailabilityEnd: location.unavailabilityEnd,
          regularSlots: location.regularSlots,
          specialSlots: location.specialSlots,
        };
        const data = await updateData(`${endpoints.get_locations}/${location.id}`, payload);
        if (data.error) {
          throw new Error(data.error.message || 'Failed to update location');
        }
        setLocations((prev) =>
          prev.map((loc) => (loc.id === location.id ? { ...location } : loc))
        );
      } else {
        const payload = {
          name: location.name,
          address: location.address,
          isAvailable: location.isAvailable,
          unavailabilityReason: location.unavailabilityReason,
          unavailabilityStart: location.unavailabilityStart,
          unavailabilityEnd: location.unavailabilityEnd,
          regularSlots: location.regularSlots,
          specialSlots: location.specialSlots,
        };
        const data = await postData(endpoints.get_locations, payload);
        if (data.error) {
          throw new Error(data.error.message || 'Failed to create location');
        }
        setLocations((prev) => [
          ...prev,
          {
            id: data.id_location,
            name: location.name,
            address: location.address,
            isAvailable: location.isAvailable ?? true,
            regularSlots: location.regularSlots || [],
            specialSlots: location.specialSlots || [],
          },
        ]);
      }
      setEditingLocation(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving location:', err);
      setError('Не удалось сохранить локацию. Попробуйте позже.');
    }
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const handleDeleteLocation = (locationId: number) => {
    setSelectedLocationId(locationId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedLocationId) {
      try {
        const response = await deleteData(endpoints.location_delete(selectedLocationId));
        if (response.error) {
          throw new Error(response.error.message || 'Failed to delete location');
        }
        setLocations((prev) => prev.filter((loc) => loc.id !== selectedLocationId));
        setIsDeleteModalOpen(false);
        setSelectedLocationId(null);
        alert('Локация успешно удалена!');
      } catch (err) {
        console.error('Error deleting location:', err);
        alert('Не удалось удалить локацию. Попробуйте снова.');
      }
    }
  };

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className={styles.content}>
      {error && <p className={styles.error}>{error}</p>}

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
            {filteredLocations.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>
                  Локации не найдены
                </td>
              </tr>
            ) : (
              filteredLocations.map((location) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}