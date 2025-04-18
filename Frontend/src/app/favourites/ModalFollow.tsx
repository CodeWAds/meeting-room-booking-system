'use client';

import React, { useState, useEffect } from 'react';
import styles from '../../styles/ModalFollow.module.css';
import { Calendar } from 'primereact/calendar';
import '../../CalendarLocale';
import { useRouter } from 'next/navigation';
import { postData } from '../../api/api-utils';
import { endpoints } from '../../api/config';
import { useStore } from '../../store/app-store';

interface TimeSlot {
  id_time_slot: number;
  time_begin: string;
  time_end: string;
  slot_type: string;
  special_date?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId?: number;
  roomName?: string;
  locationId?: number;
}

const ModalFollow: React.FC<ModalProps> = ({ isOpen, onClose, roomId, roomName, locationId }) => {
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const router = useRouter();
  const store = useStore();

  // Получение временных слотов с бэкенда при выборе даты
  useEffect(() => {
    // Проверяем наличие всех необходимых данных
    if (!locationId || !selectedDate || !store.id_user) {
      setAvailableSlots([]);
      setSelectedSlots([]);
      if (!store.id_user) {
        console.warn('store.id_user отсутствует, запрос на получение слотов не отправлен.');
      }
      if (!locationId) {
        console.warn('locationId отсутствует, запрос на получение слотов не отправлен.');
      }
      if (!selectedDate) {
        console.warn('selectedDate отсутствует, запрос на получение слотов не отправлен.');
      }
      return;
    }

    const fetchTimeSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const requestData = {
          user_id: store.id_user,
          date: selectedDate,
        };

        console.log('Отправляем запрос на получение слотов:', {
          url: endpoints.time_slots(locationId),
          data: requestData,
        });

        const response = await postData(endpoints.time_slots(locationId), requestData);
        if (response instanceof Error) throw response;

        console.log('Полученные данные о временных слотах:', response);

        if (response.time_slots && Array.isArray(response.time_slots)) {
          const slots: TimeSlot[] = response.time_slots
            .filter((slot: any) => {
              const isRegular = slot.slot_type === 'regular';
              const isSpecialMatch =
                slot.slot_type === 'special' &&
                selectedDate &&
                slot.special_date === selectedDate;
              const willInclude = isRegular || isSpecialMatch;
              console.log(`Слот ${slot.id_time_slot}:`, {
                slot_type: slot.slot_type,
                special_date: slot.special_date,
                selectedDate,
                willInclude,
              });
              return willInclude;
            })
            .map((slot: any) => ({
              id_time_slot: slot.id_time_slot,
              time_begin: slot.time_begin.slice(0, 5),
              time_end: slot.time_end.slice(0, 5),
              slot_type: slot.slot_type,
              special_date: slot.special_date,
            }));

          console.log('Отфильтрованные слоты:', slots);
          setAvailableSlots(slots);
        } else {
          console.error('Временные слоты не в ожидаемом формате:', response);
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке временных слотов:', error);
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchTimeSlots();
  }, [locationId, selectedDate]); // Убираем store.id_user из зависимостей

  // Проверяет, идут ли выбранные слоты подряд
  const isConsecutive = (slots: TimeSlot[]) => {
    if (slots.length < 2) return true;
    const indices = slots
      .map(slot => availableSlots.findIndex(s => s.id_time_slot === slot.id_time_slot))
      .sort((a, b) => a - b);
    return indices.every((index, i) => i === 0 || index === indices[i - 1] + 1);
  };

  const handleSlotToggle = (slot: TimeSlot) => {
    let newSelectedSlots = [...selectedSlots];

    if (selectedSlots.some(s => s.id_time_slot === slot.id_time_slot)) {
      newSelectedSlots = newSelectedSlots.filter(s => s.id_time_slot !== slot.id_time_slot);
    } else {
      newSelectedSlots.push(slot);
    }

    if (isConsecutive(newSelectedSlots)) {
      setSelectedSlots(newSelectedSlots);
    } else {
      setSelectedSlots([]);
      alert('Пожалуйста, выбирайте временные слоты подряд.');
    }
  };

  const formatDate = (date?: string) => {
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
      setSelectedSlots([]);
    } else {
      setSelectedDate(undefined);
      setSelectedSlots([]);
    }
  };

  const calendarValue = selectedDate ? new Date(selectedDate) : null;

  const makeBooking = async () => {
    if (!store.id_user || !roomId || !selectedDate || selectedSlots.length === 0) {
      alert('Пожалуйста, выберите дату и хотя бы один временной слот для бронирования.');
      return;
    }

    try {
      const payload = {
        user_id: store.id_user,
        room_id: roomId,
        date: selectedDate,
        review: 5,
        status: 'pending',
        slot: selectedSlots.map(slot => slot.id_time_slot),
      };

      const response = await postData(endpoints.create_booking, payload);

      if (response instanceof Error) {
        console.error('Ошибка при создании бронирования:', response);
        alert('Не удалось создать бронирование. Попробуйте снова.');
      } else {
        console.log('Бронирование успешно создано:', response);
        onClose();
        router.push('/myBooking');
      }
    } catch (error) {
      console.error('Произошла ошибка:', error);
      alert('Произошла ошибка при бронировании.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <span className={styles.close} onClick={onClose}>×</span>
        <div className={styles.filters}>
          <div className={styles.filterRow}>
            <div className={styles.filterItem}>
              <label>Выберите дату для комнаты "{roomName || 'Не указана'}"</label>
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
                {isLoadingSlots ? (
                  <p>Загрузка временных слотов...</p>
                ) : availableSlots.length === 0 ? (
                  <p>
                    {store.id_user
                      ? locationId
                        ? 'Нет доступных слотов для выбранной даты.'
                        : 'Локация не указана.'
                      : 'Пользователь не авторизован.'}
                  </p>
                ) : (
                  availableSlots.map((slot) => (
                    <button
                      key={slot.id_time_slot}
                      className={`${styles.timeSlot} ${
                        selectedSlots.some(s => s.id_time_slot === slot.id_time_slot)
                          ? styles.active
                          : ''
                      }`}
                      onClick={() => handleSlotToggle(slot)}
                    >
                      {`${slot.time_begin} - ${slot.time_end}`}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.modalButtons}>
          <button className={styles.confirmBtn} onClick={makeBooking}>
            Забронировать
          </button>
          <button className={styles.cancelBtn} onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalFollow;