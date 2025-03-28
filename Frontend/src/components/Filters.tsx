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

  // Храним массив выбранных слотов
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  const [selectedDate, setSelectedDate] = useState<string>('2025-02-28');

  const formatDate = (date: string) => {
    if (!date) return 'ДД.ММ.ГГГГ';
    const [year, month, day] = date.split('-');
    return `${day}.${month}.${year}`;
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const isConsecutive = (slots: string[]) => {
    if (slots.length < 2) return true;
    const indices = slots.map(slot => timeSlots.indexOf(slot)).sort((a, b) => a - b);
    return indices.every((index, i) => i === 0 || index === indices[i - 1] + 1);
  };

  const handleSlotToggle = (slot: string) => {
    let newSelectedSlots = [...selectedSlots];

    if (selectedSlots.includes(slot)) {
      // Убираем слот
      newSelectedSlots = newSelectedSlots.filter(s => s !== slot);
    } else {
      // Добавляем слот
      newSelectedSlots.push(slot);
    }

    // Проверяем, что все выделенные слоты идут подряд
    if (isConsecutive(newSelectedSlots)) {
      setSelectedSlots(newSelectedSlots);
    } else {
      setSelectedSlots([]); // Сбрасываем, если последовательность нарушена
    }
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
