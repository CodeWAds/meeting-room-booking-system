import React, { useState, useEffect } from "react";
import styles from "../styles/Filters.module.css";
import { Calendar } from "primereact/calendar";
import "../CalendarLocale";
import { postData, getData } from "../api/api-utils"; // Используем postData
import { endpoints } from "../api/config";
import { useStore } from "../store/app-store";

interface TimeSlot {
  id: number;
  timeStart: string;
  timeEnd: string;
}

interface FiltersProps {
  onFilterChange: (date: string, timeSlots: TimeSlot[], location: string) => void;
}

const Filters: React.FC<FiltersProps> = ({ onFilterChange }) => {
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [locations, setLocations] = useState<{ id: number; name: string }[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<
    { id: number; time: string; slotType: string; specialDate?: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const store = useStore();

  // Загрузка локаций при монтировании компонента
  useEffect(() => {
    setIsLoading(true);
    getData(endpoints.locations)
      .then((data) => {
        if (data instanceof Error) throw data;
        if (data.locations) {
          const locationData = data.locations.map((element: any) => ({
            id: element.id_location,
            name: element.name,
          }));
          setLocations(locationData);
          if (locationData.length > 0) {
            setSelectedLocation(String(locationData[0].id));
          }
        } else {
          console.error("Локации не в ожидаемом формате:", data);
          setLocations([]);
        }
      })
      .catch((e) => {
        console.error("Ошибка при загрузке локаций:", e);
        setLocations([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Получение временных слотов при изменении даты или локации
  useEffect(() => {
    if (selectedLocation && selectedDate) {
      setIsLoading(true);

      // Формируем данные для POST-запроса
      const requestData = {
        user_id: store.id_user,
        date: selectedDate,
      };

      // Выполняем POST-запрос
      postData(endpoints.time_slots(selectedLocation), requestData)
        .then((data) => {
          if (data instanceof Error) throw data;

          console.log("Received time slots data:", data);

          if (data.time_slots) {
            // Преобразуем данные о временных слотах
            const slotData = data.time_slots
              .filter((slot: any) => {
                if (slot.slot_type === "regular") return true;
                if (slot.slot_type === "special" && selectedDate) {
                  return slot.special_date === selectedDate;
                }
                return false;
              })
              .map((slot: any) => {
                const begin = slot.time_begin.slice(0, 5);
                const end = slot.time_end.slice(0, 5);
                return {
                  id: slot.id_time_slot,
                  time: `${begin} - ${end}`,
                  slotType: slot.slot_type,
                  specialDate: slot.special_date,
                };
              });

            setAvailableTimeSlots(slotData);
          } else {
            console.error("Временные слоты не в ожидаемом формате:", data);
            setAvailableTimeSlots([]);
          }
        })
        .catch((e) => {
          console.error("Ошибка при загрузке слотов:", e);
          setAvailableTimeSlots([]);
        })
        .finally(() => setIsLoading(false));
    } else {
      // Если дата или локация не выбраны, очищаем слоты
      setAvailableTimeSlots([]);
      setSelectedSlots([]);
      onFilterChange(selectedDate, [], selectedLocation);
    }
  }, [selectedLocation, selectedDate]);

  // Форматирование даты
  const formatDate = (date: string) => {
    if (!date) return "ДД.ММ.ГГГГ";
    const [year, month, day] = date.split("-");
    return `${day}.${month}.${year}`;
  };

  // Обработка изменения даты
  const handleCalendarChange = (e: { value: Date | null }) => {
    if (e.value) {
      const date = e.value;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;
      setSelectedDate(dateString);
      const timeSlots = selectedSlots.map((slot) => {
        const slotData = availableTimeSlots.find((s) => s.time === slot);
        const [timeStart, timeEnd] = slot.split(" - ");
        return {
          id: slotData ? slotData.id : 0,
          timeStart,
          timeEnd,
        };
      });
      onFilterChange(dateString, timeSlots, selectedLocation);
    } else {
      setSelectedDate("");
      setSelectedSlots([]);
      onFilterChange("", [], selectedLocation);
    }
  };

  // Проверка на последовательность выбранных слотов
  const isConsecutive = (slots: string[]) => {
    if (slots.length < 2) return true;
    const indices = slots
      .map((slot) => availableTimeSlots.findIndex((s) => s.time === slot))
      .sort((a, b) => a - b);
    return indices.every((index, i) => i === 0 || index === indices[i - 1] + 1);
  };

  // Обработка изменения локации
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocation = e.target.value;
    setSelectedLocation(newLocation);
    setSelectedSlots([]);
    onFilterChange(selectedDate, [], newLocation);
  };

  // Обработка выбора временного слота
  const handleSlotToggle = (slot: string) => {
    let newSelectedSlots = [...selectedSlots];
    if (selectedSlots.includes(slot)) {
      newSelectedSlots = newSelectedSlots.filter((s) => s !== slot);
    } else {
      newSelectedSlots.push(slot);
    }

    if (isConsecutive(newSelectedSlots)) {
      setSelectedSlots(newSelectedSlots);

      const timeSlots = newSelectedSlots.map((s) => {
        const slotData = availableTimeSlots.find((slot) => slot.time === s);
        const [timeStart, timeEnd] = s.split(" - ");
        return {
          id: slotData ? slotData.id : 0,
          timeStart,
          timeEnd,
        };
      });

      onFilterChange(selectedDate, timeSlots, selectedLocation);
    } else {
      setSelectedSlots([]);
      onFilterChange(selectedDate, [], selectedLocation);
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
              availableTimeSlots.map((slot) => (
                <button
                  key={slot.id}
                  className={`${styles.slotButton} ${
                    selectedSlots.includes(slot.time) ? styles.active : ""
                  }`}
                  onClick={() => handleSlotToggle(slot.time)}
                >
                  {slot.time}
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

export default Filters