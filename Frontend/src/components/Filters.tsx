import React, { useState, useEffect } from 'react';
import styles from '../styles/Filters.module.css';
import { Calendar } from 'primereact/calendar';
import '../CalendarLocale';
import { getData } from '../api/api-utils';
import { endpoints } from '../api/config';

const Filters: React.FC = () => {
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [locations, setLocations] = useState<{ id: number; name: string }[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);


  useEffect(() => {
    setIsLoading(true);
    getData(endpoints.locations)
      .then((data) => {
        if (data.locations) {
          const locationData = data.locations.map((element) => ({
            id: element.id_location,
            name: element.name,
          }));
          setLocations(locationData);
          if (locationData.length > 0) {
            setSelectedLocation(String(locationData[0].id));
          }
        } else {
          console.error('Данные не в ожидаемом формате:', data);
          setLocations([]);
        }
      })
      .catch((e) => {
        console.error('Ошибка при загрузке локаций:', e);
        setLocations([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      setIsLoading(true);
      getData(endpoints.time_slots(selectedLocation))
        .then((data) => {
          if (data.time_slots) {
            const slotTimes = data.time_slots.map((slot) => {
              const begin = slot.time_begin.slice(0, 5);
              const end = slot.time_end.slice(0, 5);
              return `${begin} - ${end}`;
            });
            setAvailableTimeSlots(slotTimes);
          } else {
            console.error('Временные слоты не в ожидаемом формате:', data);
            setAvailableTimeSlots([]);
          }
        })
        .catch((e) => {
          console.error('Ошибка при загрузке слотов:', e);
          setAvailableTimeSlots([]);
        })
        .finally(() => setIsLoading(false));
    }
  }, [selectedLocation]);

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
    const indices = slots.map((slot) => availableTimeSlots.indexOf(slot)).sort((a, b) => a - b);
    return indices.every((index, i) => i === 0 || index === indices[i - 1] + 1);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLocation(e.target.value);
    setSelectedSlots([]);
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
              {isLoading ? (
                <option>Загрузка...</option>
              ) : locations.length > 0 ? (
                locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
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
            {isLoading ? (
              <p>Загрузка слотов...</p>
            ) : availableTimeSlots.length > 0 ? (
              availableTimeSlots.map((slot, index) => (
                <button
                  key={index}
                  className={`${styles.slotButton} ${selectedSlots.includes(slot) ? styles.active : ''}`}
                  onClick={() => handleSlotToggle(slot)}
                >
                  {slot}
                </button>
              ))
            ) : (
              <p>Слоты не найдены</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;