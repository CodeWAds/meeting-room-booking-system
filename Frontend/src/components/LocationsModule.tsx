// components/LocationModal.tsx
import React, { useState, useEffect } from "react";
import styles from "../styles/Locations.module.css";

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

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: Location) => void;
  locationToEdit?: Location | null;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, onSave, locationToEdit }) => {
  const [location, setLocation] = useState<Location>(
    locationToEdit || {
      id: 0,
      name: "",
      address: "",
      isAvailable: true,
      regularSlots: [],
      specialSlots: [],
    }
  );

  const [workDayStart, setWorkDayStart] = useState("09:00");
  const [workDayEnd, setWorkDayEnd] = useState("17:00");
  const [slotDuration, setSlotDuration] = useState(30);
  const [slotInterval, setSlotInterval] = useState(10);

  const [specialSlotDate, setSpecialSlotDate] = useState("");
  const [specialWorkDayStart, setSpecialWorkDayStart] = useState("09:00");
  const [specialWorkDayEnd, setSpecialWorkDayEnd] = useState("17:00");

  useEffect(() => {
    if (locationToEdit) {
      setLocation(locationToEdit);
    }
  }, [locationToEdit]);

  const generateSlots = (start: string, end: string, duration: number, interval: number): Slot[] => {
    const slots: Slot[] = [];
    let currentTime = new Date(`2000-01-01T${start}:00`);
    const endTime = new Date(`2000-01-01T${end}:00`);

    while (currentTime < endTime) {
      const slotStart = currentTime.toTimeString().slice(0, 5);
      currentTime.setMinutes(currentTime.getMinutes() + duration);
      if (currentTime > endTime) break;
      const slotEnd = currentTime.toTimeString().slice(0, 5);
      slots.push({ start: slotStart, end: slotEnd });
      currentTime.setMinutes(currentTime.getMinutes() + interval);
    }
    return slots;
  };

  useEffect(() => {
    const generatedSlots = generateSlots(workDayStart, workDayEnd, slotDuration, slotInterval);
    setLocation((prev) => ({ ...prev, regularSlots: generatedSlots }));
  }, [workDayStart, workDayEnd, slotDuration, slotInterval]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocation((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation((prev) => ({ ...prev, isAvailable: e.target.checked }));
  };

  const handleDeleteSlot = (index: number, isSpecial: boolean = false) => {
    if (isSpecial) {
      setLocation((prev) => ({
        ...prev,
        specialSlots: prev.specialSlots.filter((_, i) => i !== index),
      }));
    } else {
      setLocation((prev) => ({
        ...prev,
        regularSlots: prev.regularSlots.filter((_, i) => i !== index),
      }));
    }
  };

  const handleAddSpecialSlots = () => {
    if (!specialSlotDate) return;
    const generatedSlots = generateSlots(specialWorkDayStart, specialWorkDayEnd, slotDuration, slotInterval);
    const newSpecialSlots = generatedSlots.map((slot) => ({
      ...slot,
      date: specialSlotDate,
    }));
    setLocation((prev) => ({
      ...prev,
      specialSlots: [...prev.specialSlots, ...newSpecialSlots],
    }));
  };

  const handleSave = () => {
    if (!location.name || !location.address) {
      alert("Пожалуйста, заполните все поля.");
      return;
    }
    onSave(location);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>{locationToEdit ? "Редактирование локации" : "Добавление локации"}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.formSection}>
          <div className={styles.formGroup}>
            <label>Название</label>
            <input
              type="text"
              name="name"
              value={location.name}
              onChange={handleInputChange}
              placeholder="Введите название"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Адрес</label>
            <input
              type="text"
              name="address"
              value={location.address}
              onChange={handleInputChange}
              placeholder="Введите адрес"
            />
          </div>
          <div className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                checked={location.isAvailable}
                onChange={handleAvailabilityChange}
              />
              Доступность
            </label>
          </div>
        </div>

        {!location.isAvailable && (
          <div className={styles.formSection}>
            <h4>Настройка временной недоступности</h4>
            <div className={styles.formGroup}>
              <label>Причина недоступности</label>
              <textarea
                name="unavailabilityReason"
                value={location.unavailabilityReason || ""}
                onChange={handleInputChange}
                placeholder="Введите причину"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Дата и время начала</label>
              <input
                type="datetime-local"
                name="unavailabilityStart"
                value={location.unavailabilityStart || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Дата и время окончания</label>
              <input
                type="datetime-local"
                name="unavailabilityEnd"
                value={location.unavailabilityEnd || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )}

        <div className={styles.slotsContainer}>
          <div className={styles.slotsSection}>
            <h4>Настройка временных слотов (общих)</h4>
            <div className={styles.slotInputs}>
              <div className={styles.formGroup}>
                <label>Время начала</label>
                <input
                  type="time"
                  value={workDayStart}
                  onChange={(e) => setWorkDayStart(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Время окончания</label>
                <input
                  type="time"
                  value={workDayEnd}
                  onChange={(e) => setWorkDayEnd(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Длительность (мин)</label>
                <input
                  type="number"
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(Number(e.target.value))}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Интервал (мин)</label>
                <input
                  type="number"
                  value={slotInterval}
                  onChange={(e) => setSlotInterval(Number(e.target.value))}
                />
              </div>
            </div>
            <h5>Временные слоты:</h5>
            <div className={styles.slotsList}>
              {location.regularSlots.map((slot, index) => (
                <div key={index} className={styles.slotItem}>
                  {slot.start} - {slot.end}
                  <button
                    className={styles.deleteSlotButton}
                    onClick={() => handleDeleteSlot(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.slotsSection}>
            <h4>Настройка временных слотов (специальных)</h4>
            <div className={styles.slotInputs}>
              <div className={styles.formGroup}>
                <label>Дата</label>
                <input
                  type="date"
                  value={specialSlotDate}
                  onChange={(e) => setSpecialSlotDate(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Время начала</label>
                <input
                  type="time"
                  value={specialWorkDayStart}
                  onChange={(e) => setSpecialWorkDayStart(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Время окончания</label>
                <input
                  type="time"
                  value={specialWorkDayEnd}
                  onChange={(e) => setSpecialWorkDayEnd(e.target.value)}
                />
              </div>
            </div>
            <button
              type="button"
              className={styles.addSpecialSlotsButton}
              onClick={handleAddSpecialSlots}
            >
              Добавить специальные слоты
            </button>
            <h5>Временные слоты:</h5>
            <div className={styles.slotsList}>
              {location.specialSlots.map((slot, index) => (
                <div key={index} className={styles.slotItem}>
                  {slot.date} {slot.start} - {slot.end}
                  <button
                    className={styles.deleteSlotButton}
                    onClick={() => handleDeleteSlot(index, true)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button type="button" onClick={handleSave} className={styles.saveButton}>
            Сохранить
          </button>
          <button type="button" onClick={onClose} className={styles.cancelButton}>
            Отменить
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;