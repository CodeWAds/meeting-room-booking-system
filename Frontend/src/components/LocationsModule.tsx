'use client';

import React, { useState, useEffect } from 'react';
import styles from '../styles/Locations.module.css';

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

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: Location) => void;
  locationToEdit?: Location | null;
}

export default function LocationModal({ isOpen, onClose, onSave, locationToEdit }: LocationModalProps) {
  const [formData, setFormData] = useState<Location>({
    id: 0,
    name: '',
    address: '',
    isAvailable: true,
    unavailabilityReason: '',
    unavailabilityStart: '',
    unavailabilityEnd: '',
    regularSlots: [],
    specialSlots: [],
  });

  const [newRegularSlot, setNewRegularSlot] = useState<Slot>({ start: '', end: '' });
  const [newSpecialSlot, setNewSpecialSlot] = useState<SpecialSlot>({ start: '', end: '', date: '' });
  const [autoRegular, setAutoRegular] = useState({
    start: '',
    end: '',
    interval: '60',
  });
  const [autoSpecial, setAutoSpecial] = useState({
    date: '',
    start: '',
    end: '',
    interval: '60',
  });

  useEffect(() => {
    if (locationToEdit) {
      setFormData({
        id: locationToEdit.id,
        name: locationToEdit.name || '',
        address: locationToEdit.address || '',
        isAvailable: locationToEdit.isAvailable ?? true,
        unavailabilityReason: locationToEdit.unavailabilityReason || '',
        unavailabilityStart: locationToEdit.unavailabilityStart || '',
        unavailabilityEnd: locationToEdit.unavailabilityEnd || '',
        regularSlots: locationToEdit.regularSlots || [],
        specialSlots: locationToEdit.specialSlots || [],
      });
    } else {
      setFormData({
        id: 0,
        name: '',
        address: '',
        isAvailable: true,
        unavailabilityReason: '',
        unavailabilityStart: '',
        unavailabilityEnd: '',
        regularSlots: [],
        specialSlots: [],
      });
      setNewRegularSlot({ start: '', end: '' });
      setNewSpecialSlot({ start: '', end: '', date: '' });
      setAutoRegular({ start: '', end: '', interval: '60' });
      setAutoSpecial({ date: '', start: '', end: '', interval: '60' });
    }
  }, [locationToEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleRegularSlotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewRegularSlot((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecialSlotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSpecialSlot((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutoRegularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAutoRegular((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutoSpecialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAutoSpecial((prev) => ({ ...prev, [name]: value }));
  };

  const addRegularSlot = () => {
    if (newRegularSlot.start && newRegularSlot.end) {
      setFormData((prev) => ({
        ...prev,
        regularSlots: [...(prev.regularSlots || []), { ...newRegularSlot }],
      }));
      setNewRegularSlot({ start: '', end: '' });
    }
  };

  const addSpecialSlot = () => {
    if (newSpecialSlot.start && newSpecialSlot.end && newSpecialSlot.date) {
      setFormData((prev) => ({
        ...prev,
        specialSlots: [...(prev.specialSlots || []), { ...newSpecialSlot }],
      }));
      setNewSpecialSlot({ start: '', end: '', date: '' });
    }
  };

  const deleteRegularSlot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      regularSlots: (prev.regularSlots || []).filter((_, i) => i !== index),
    }));
  };

  const deleteSpecialSlot = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specialSlots: (prev.specialSlots || []).filter((_, i) => i !== index),
    }));
  };

  const generateTimeSlots = (start: string, end: string, interval: number): Slot[] => {
    const slots: Slot[] = [];
    let currentTime = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);

    while (currentTime < endTime) {
      const slotStart = currentTime.toTimeString().slice(0, 5);
      currentTime.setMinutes(currentTime.getMinutes() + interval);
      if (currentTime <= endTime) {
        const slotEnd = currentTime.toTimeString().slice(0, 5);
        slots.push({ start: slotStart, end: slotEnd });
      }
    }

    return slots;
  };

  const generateRegularSlots = () => {
    const { start, end, interval } = autoRegular;
    if (!start || !end || !interval) {
      alert('Укажите начало, конец и интервал для регулярных слотов');
      return;
    }
    const newSlots = generateTimeSlots(start, end, parseInt(interval));
    setFormData((prev) => ({
      ...prev,
      regularSlots: [...(prev.regularSlots || []), ...newSlots],
    }));
  };

  const generateSpecialSlots = () => {
    const { date, start, end, interval } = autoSpecial;
    if (!date || !start || !end || !interval) {
      alert('Укажите дату, начало, конец и интервал для специальных слотов');
      return;
    }
    const newSlots = generateTimeSlots(start, end, parseInt(interval)).map((slot) => ({
      ...slot,
      date,
    }));
    setFormData((prev) => ({
      ...prev,
      specialSlots: [...(prev.specialSlots || []), ...newSlots],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address) {
      alert('Название и адрес обязательны');
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h3>{locationToEdit ? 'Редактировать локацию' : 'Добавить локацию'}</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.formSection}>
            <h4>Основная информация</h4>
            <div className={styles.formGroup}>
              <label htmlFor="name">Название</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="address">Адрес</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="isAvailable">
                <input
                  type="checkbox"
                  id="isAvailable"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                />
                Доступна
              </label>
            </div>
          </div>

          <div className={styles.formSection}>
            <h4>Недоступность</h4>
            <div className={styles.formGroup}>
              <label htmlFor="unavailabilityReason">Причина недоступности</label>
              <textarea
                id="unavailabilityReason"
                name="unavailabilityReason"
                value={formData.unavailabilityReason}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="unavailabilityStart">Начало недоступности</label>
              <input
                type="date"
                id="unavailabilityStart"
                name="unavailabilityStart"
                value={formData.unavailabilityStart}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="unavailabilityEnd">Конец недоступности</label>
              <input
                type="date"
                id="unavailabilityEnd"
                name="unavailabilityEnd"
                value={formData.unavailabilityEnd}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.slotsContainer}>
            <div className={styles.slotsSection}>
              <h4>Регулярные слоты</h4>
              <h5>Ручное добавление</h5>
              <div className={styles.slotInputs}>
                <div className={styles.formGroup}>
                  <label htmlFor="regularStart">Начало</label>
                  <input
                    type="time"
                    id="regularStart"
                    name="start"
                    value={newRegularSlot.start}
                    onChange={handleRegularSlotChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="regularEnd">Конец</label>
                  <input
                    type="time"
                    id="regularEnd"
                    name="end"
                    value={newRegularSlot.end}
                    onChange={handleRegularSlotChange}
                  />
                </div>
              </div>
              <button
                type="button"
                className={styles.addSpecialSlotsButton}
                onClick={addRegularSlot}
                disabled={!newRegularSlot.start || !newRegularSlot.end}
              >
                Добавить слот
              </button>

              <h5>Автоматическое распределение</h5>
              <div className={styles.slotInputs}>
                <div className={styles.formGroup}>
                  <label htmlFor="autoRegularStart">Начало</label>
                  <input
                    type="time"
                    id="autoRegularStart"
                    name="start"
                    value={autoRegular.start}
                    onChange={handleAutoRegularChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="autoRegularEnd">Конец</label>
                  <input
                    type="time"
                    id="autoRegularEnd"
                    name="end"
                    value={autoRegular.end}
                    onChange={handleAutoRegularChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="autoRegularInterval">Интервал (мин)</label>
                  <input
                    type="number"
                    id="autoRegularInterval"
                    name="interval"
                    value={autoRegular.interval}
                    onChange={handleAutoRegularChange}
                    min="1"
                  />
                </div>
              </div>
              <button
                type="button"
                className={styles.addSpecialSlotsButton}
                onClick={generateRegularSlots}
                disabled={!autoRegular.start || !autoRegular.end || !autoRegular.interval}
              >
                Сгенерировать слоты
              </button>

              <div className={styles.slotsList}>
                {formData.regularSlots?.map((slot, index) => (
                  <div key={index} className={styles.slotItem}>
                    <span>{`${slot.start} - ${slot.end}`}</span>
                    <button
                      type="button"
                      className={styles.deleteSlotButton}
                      onClick={() => deleteRegularSlot(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.slotsSection}>
              <h4>Специальные слоты</h4>
              <h5>Ручное добавление</h5>
              <div className={styles.slotInputs}>
                <div className={styles.formGroup}>
                  <label htmlFor="specialDate">Дата</label>
                  <input
                    type="date"
                    id="specialDate"
                    name="date"
                    value={newSpecialSlot.date}
                    onChange={handleSpecialSlotChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="specialStart">Начало</label>
                  <input
                    type="time"
                    id="specialStart"
                    name="start"
                    value={newSpecialSlot.start}
                    onChange={handleSpecialSlotChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="specialEnd">Конец</label>
                  <input
                    type="time"
                    id="specialEnd"
                    name="end"
                    value={newSpecialSlot.end}
                    onChange={handleSpecialSlotChange}
                  />
                </div>
              </div>
              <button
                type="button"
                className={styles.addSpecialSlotsButton}
                onClick={addSpecialSlot}
                disabled={!newSpecialSlot.date || !newSpecialSlot.start || !newSpecialSlot.end}
              >
                Добавить слот
              </button>

              <h5>Автоматическое распределение</h5>
              <div className={styles.slotInputs}>
                <div className={styles.formGroup}>
                  <label htmlFor="autoSpecialDate">Дата</label>
                  <input
                    type="date"
                    id="autoSpecialDate"
                    name="date"
                    value={autoSpecial.date}
                    onChange={handleAutoSpecialChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="autoSpecialStart">Начало</label>
                  <input
                    type="time"
                    id="autoSpecialStart"
                    name="start"
                    value={autoSpecial.start}
                    onChange={handleAutoSpecialChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="autoSpecialEnd">Конец</label>
                  <input
                    type="time"
                    id="autoSpecialEnd"
                    name="end"
                    value={autoSpecial.end}
                    onChange={handleAutoSpecialChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="autoSpecialInterval">Интервал (мин)</label>
                  <input
                    type="number"
                    id="autoSpecialInterval"
                    name="interval"
                    value={autoSpecial.interval}
                    onChange={handleAutoSpecialChange}
                    min="1"
                  />
                </div>
              </div>
              <button
                type="button"
                className={styles.addSpecialSlotsButton}
                onClick={generateSpecialSlots}
                disabled={!autoSpecial.date || !autoSpecial.start || !autoSpecial.end || !autoSpecial.interval}
              >
                Сгенерировать слоты
              </button>

              <div className={styles.slotsList}>
                {formData.specialSlots?.map((slot, index) => (
                  <div key={index} className={styles.slotItem}>
                    <span>{`${slot.date} ${slot.start} - ${slot.end}`}</span>
                    <button
                      type="button"
                      className={styles.deleteSlotButton}
                      onClick={() => deleteSpecialSlot(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.modalActions}>
            <button type="submit" className={styles.saveButton}>
              Сохранить
            </button>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}