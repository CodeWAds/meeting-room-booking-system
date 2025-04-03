import React, { useState, useEffect } from 'react'; // Добавлен useEffect
import styles from '../styles/Filters.module.css';
import { Calendar } from 'primereact/calendar';
import '../CalendarLocale';

const Filters: React.FC = () => {
  const timeSlots = [
    '9:00 - 9:30',
    '9:40 - 10:10',
    '10:20 - 10:50',
    // ... остальные слоты
  ];

  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://sivann.ru/location/');
      if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
      }
      const data = await response.json();
      console.log('Данные с сервера:', data); // Для отладки
      // Предполагаем, что data — это массив объектов с полем name
      const locationNames = data.map((loc: { name: string }) => loc.name);
      setLocations(locationNames);
    } catch (error) {
      console.error('Ошибка при загрузке локаций:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Выполняем запрос при монтировании компонента
  useEffect(() => {
    fetchLocations();
  }, []);

  const formatDate = (date: string) => {
    if (!date) return 'ДД.ММ.ГГГГ';
    const [year, month, day] = date.split('-');
    return `${day}.${month}.${year}`;
  };

  const handleCalendarChange = (e: { value: Date | null }) => {
    if (e.value) {
      const date = e.value;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      setSelectedDate(dateString);
    } else {
      setSelectedDate('');
    }
  };

  const isConsecutive = (slots: string[]) => {
    if (slots.length < 2) return true;
    const indices = slots.map((slot) => timeSlots.indexOf(slot)).sort((a, b) => a - b);
    return indices.every((index, i) => i === 0 || index === indices[i - 1] + 1);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(e.target.value);
  };

  const handleSlotToggle = (slot: string) => {
    let newSelectedSlots = [...selectedSlots];
    if (selectedSlots.includes(slot)) {
      newSelectedSlots = newSelectedSlots.filter((s) => s !== slot);
    } else {
      newSelectedSlots.push(slot);
    }
    if (isConsecutive(newSelectedSlots)) {
      setSelectedSlots(newSelectedSlots);
    } else {
      setSelectedSlots([]);
    }
  };

  const calendarValue = selectedDate ? new Date(selectedDate) : null;

  return (
    <div className={styles.filters}>
      <div className={styles.filterRow}>
        <div className={styles.filterItem}>
          <label>Выберите дату и локацию</label>
          <div className={styles.filterInput}>
            <div className={styles.dateInputWrapper}>
              <Calendar
                value={calendarValue}
                onChange={handleCalendarChange}
                dateFormat="dd.mm.yy"
                placeholder="ДД.ММ.ГГГГ"
                locale="ru"
                className="customCalendar"
                panelClassName="customPanel"
              />
            </div>
            <select
              value={selectedLocation}
              onChange={handleLocationChange}
              disabled={isLoading}
            >
              <option value="">Выберите локацию</option>
              {isLoading ? (
                <option>Загрузка...</option>
              ) : locations.length > 0 ? (
                locations.map((location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                ))
              ) : (
                <option>Локации не найдены</option>
              )}
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
                className={`${styles.slotButton} ${
                  selectedSlots.includes(slot) ? styles.active : ''
                }`}
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