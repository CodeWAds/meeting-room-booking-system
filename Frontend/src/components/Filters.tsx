import React, { useState } from 'react';
import styles from '../styles/Filters.module.css';

const Filters: React.FC = () => {
  const timeSlots = [
    '9:00 - 9:30',
    '9:40 - 10:10',
    '10:20 - 10:50',
    '11:00 - 11:30',
    '11:40 - 12:10',
    '12:20 - 12:50',
    '13:00 - 13:30',
    '13:40 - 14:10',
    '14:20 - 14:50',
    '15:00 - 15:30',
    '15:40 - 16:10',
    '16:20 - 16:50',
    '17:00 - 17:30',
    '17:40 - 18:10',
    '18:20 - 18:50',
    '19:00 - 19:30',
    '19:40 - 20:10',
    '20:20 - 20:50',
    '21:00 - 21:30',
  ];

  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('2025-02-28');

  // Функция для преобразования времени в минуты для сравнения
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Проверка, являются ли два слота смежными
  const areSlotsAdjacent = (slot1: string, slot2: string): boolean => {
    const [, endTime1] = slot1.split(' - ');
    const [startTime2] = slot2.split(' - ');
    const endMinutes1 = timeToMinutes(endTime1);
    const startMinutes2 = timeToMinutes(startTime2);

    // Проверяем, совпадает ли время окончания первого слота с началом второго
    // Учитываем возможный небольшой разрыв (например, 9:30 и 9:40)
    const diff = Math.abs(startMinutes2 - endMinutes1);
    return diff <= 10; // Разрыв до 10 минут считается допустимым
  };

  // Проверка, является ли новый слот смежным с уже выбранными
  const isSlotAdjacentToSelected = (newSlot: string): boolean => {
    if (selectedSlots.length === 0) return true; // Если ничего не выбрано, любой слот можно выбрать

    return selectedSlots.some((selectedSlot) => {
      return areSlotsAdjacent(selectedSlot, newSlot) || areSlotsAdjacent(newSlot, selectedSlot);
    });
  };

  const handleSlotToggle = (slot: string) => {
    if (selectedSlots.includes(slot)) {
      // Если слот уже выбран, снимаем его
      setSelectedSlots(selectedSlots.filter((s) => s !== slot));
    } else {
      // Проверяем, является ли новый слот смежным с уже выбранными
      if (isSlotAdjacentToSelected(slot)) {
        setSelectedSlots([...selectedSlots, slot]);
      } else {
        // Если слот не смежный, сбрасываем выбор и начинаем заново
        setSelectedSlots([slot]);
      }
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'ДД.ММ.ГГГГ';
    const [year, month, day] = date.split('-');
    return `${day}.${month}.${year}`;
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  return (
    <div className={styles.filters}>
      <div className={styles.filterRow}>
        <div className={styles.filterItem}>
          <label>Выберите дату и локацию</label>
          <div className={styles.filterInput}>
            <div className={styles.dateInputWrapper}>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className={styles.dateInput}
              />
              <span className={styles.dateDisplay}>{formatDate(selectedDate)}</span>
            </div>
            <select>
              <option>Локация</option>
              <option>1 корпус, 2 этаж</option>
            </select>
          </div>
        </div>
      </div>
      <div className={styles.filterRow}>
        <div className={styles.filterItem}>
          <div className={styles.labelContainer}>
            <label>Доступное время</label>
            <div className={styles.tooltipWrapper}>
              <span className={styles.tooltipTrigger}></span>
              <div className={styles.tooltip}>
                Здесь отображается доступное время для бронирования. Выберите подходящий временной слот.
              </div>
            </div>
          </div>
          <div className={styles.timeSlots}>
            {timeSlots.map((slot, index) => (
              <button
                key={index}
                className={`${selectedSlots.includes(slot) ? styles.active : ''}`}
                onClick={() => handleSlotToggle(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;