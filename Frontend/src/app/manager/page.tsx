'use client';

import React, { useState, useEffect } from 'react';
import '../../CalendarLocale';
import styles from '../../styles/Manager.module.css';
import { useRouter } from 'next/navigation';
import { Calendar } from 'primereact/calendar';
import RoomsManager from '../../components/RoomsManager';
import BookingManager from '../../components/BookingManager';
import DeleteConfirmationModal from '../../components/DelModal';
import { getData, postData, updateData, deleteData } from '../../api/api-utils';
import { endpoints } from '../../api/config';
import { useStore } from '../../store/app-store';

// Маппинг иконок для оборудования
const equipmentIcons: { [key: string]: string } = {
  'Проводной интернет': '/svg/internet.svg',
  'Wi-Fi': '/svg/wifi.svg',
  'Проектор/Интерактивная доска': '/svg/proektor.svg',
  'СК/Ноутбук': '/svg/tv.svg',
};

interface TimeSlot {
  id_time_slot: number;
  time_begin: string;
  time_end: string;
  slot_type: string;
  special_date?: string;
}

interface Booking {
  id_booking: number;
  room: number;
  room_name: string;
  location_name: string;
  capacity: number;
  user: number;
  date: string;
  review: number | null;
  status: string;
  time_slot: TimeSlot[];
  'verify code': number;
}

interface ManagerLocation {
  location_id: number;
  name: string;
}

interface Role {
  role: string;
  location_id?: number;
}

interface UserRoles {
  id_user: number;
  roles: Role[];
}

interface Room {
  id_room: number;
  room_name: string;
  capacity: number;
  id_equipment: { name: string; description: string }[];
}

const Manager: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(''); // Для фильтрации бронирований
  const [currentDate, setCurrentDate] = useState<string>(''); // Текущая дата для бронирования
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [managerLocations, setManagerLocations] = useState<ManagerLocation[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [verifyCode, setVerifyCode] = useState<string>('');
  const [bookingDetails, setBookingDetails] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [roomName, setRoomName] = useState<string>('');
  const [capacity, setCapacity] = useState<number>(1);
  const [equipmentIds, setEquipmentIds] = useState<number[]>([]);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<number[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]); // Доступные временные слоты
  const [isSlotsLoading, setIsSlotsLoading] = useState<boolean>(false);
  const router = useRouter();
  const store = useStore();

  // Установка текущей даты при монтировании
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    setCurrentDate(dateString);
  }, []);

  // Загрузка данных о ролях пользователя
  useEffect(() => {
    const fetchUserRoles = async () => {
      setIsLoading(true);
      try {
        const userRoles: UserRoles = await getData(endpoints.get_roles(66));
        if (userRoles instanceof Error) throw userRoles;

        console.log('Роли пользователя:', userRoles);

        const hasAdminRole = userRoles.roles.some(role => role.role === 'admin');
        setIsAdmin(hasAdminRole);

        const managerRoles = userRoles.roles.filter(role => role.role === 'manager' && role.location_id);
        if (managerRoles.length > 0) {
          const managerLocs: ManagerLocation[] = managerRoles.map(role => ({
            location_id: role.location_id!,
            name: `Локация ${role.location_id}`,
          }));

          setManagerLocations(managerLocs);
          if (managerLocs.length > 0) {
            setSelectedLocationId(managerLocs[0].location_id);
          }
        } else {
          console.error('Пользователь не является менеджером ни одной локации');
          setManagerLocations([]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке ролей пользователя:', error);
        setManagerLocations([]);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoles();
  }, [store.id_user, router]);

  // Загрузка комнат
  useEffect(() => {
    if (!selectedLocationId) return;

    const fetchRooms = async () => {
      try {
        const data = await getData(endpoints.rooms(selectedLocationId));
        if (data instanceof Error) throw data;

        console.log('Данные о комнатах:', data);

        if (data.rooms && Array.isArray(data.rooms)) {
          const adaptedRooms: Room[] = data.rooms.map((room: any) => ({
            id_room: room.id_room,
            room_name: room.room_name,
            capacity: room.capacity,
            id_equipment: room.id_equipment || [],
          }));
          setRooms(adaptedRooms);
        } else {
          console.error('Комнаты не в ожидаемом формате:', data);
          setRooms([]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке комнат:', error);
        setRooms([]);
      }
    };

    fetchRooms();
  }, [selectedLocationId, refreshKey]);

  // Загрузка бронирований
  const fetchBookings = async () => {
    try {
      const bookingData = await getData(endpoints.get_location_booking(selectedLocationId));
      if (bookingData instanceof Error) throw bookingData;

      console.log('Данные о бронированиях:', bookingData);

      const bookingsArray = bookingData.Booking || bookingData.bookings || [];
      if (Array.isArray(bookingsArray)) {
        const adaptedBookings: Booking[] = bookingsArray.map((booking: any) => ({
          id_booking: booking.id_booking,
          room: booking.room,
          room_name: booking.room_name,
          location_name: booking.location_name,
          capacity: booking.capacity,
          user: booking.user,
          date: booking.date,
          review: booking.review,
          status: booking.status,
          time_slot: booking.time_slot || [],
          'verify code': booking['verify code'],
        }));
        setBookings(adaptedBookings);
      } else {
        console.error('Бронирования не в ожидаемом формате:', bookingData);
        setBookings([]);
      }
    } catch (error) {
      console.error('Ошибка при загрузке бронирований:', error);
      setBookings([]);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [store.id_user, selectedLocationId]);

  // Загрузка временных слотов
  useEffect(() => {
    if (selectedLocationId && currentDate) {
      setIsSlotsLoading(true);

      const requestData = {
        user_id: store.id_user,
        date: currentDate,
      };

      postData(endpoints.time_slots(selectedLocationId), requestData)
        .then((data) => {
          if (data instanceof Error) throw data;

          console.log('Полученные временные слоты:', data);

          if (data.time_slots) {
            const now = new Date();
            const currentTime = now.getHours() * 60 + now.getMinutes(); // Текущее время в минутах

            const slotData = data.time_slots
              .filter((slot: any) => {
                if (slot.slot_type === 'regular') return true;
                if (slot.slot_type === 'special' && currentDate) {
                  return slot.special_date === currentDate;
                }
                return false;
              })
              .map((slot: any) => ({
                id_time_slot: slot.id_time_slot,
                time_begin: slot.time_begin,
                time_end: slot.time_end,
                slot_type: slot.slot_type,
                special_date: slot.special_date,
              }))
              .filter((slot: TimeSlot) => {
                const [hours, minutes] = slot.time_begin.split(':').map(Number);
                const slotTime = hours * 60 + minutes; // Время начала слота в минутах
                return slotTime > currentTime; // Оставляем только будущие слоты
              });

            setAvailableTimeSlots(slotData);
          } else {
            console.error('Временные слоты не в ожидаемом формате:', data);
            setAvailableTimeSlots([]);
          }
        })
        .catch((e) => {
          console.error('Ошибка при загрузке слотов:', e);
          setAvailableTimeSlots([]);
        })
        .finally(() => setIsSlotsLoading(false));
    } else {
      setAvailableTimeSlots([]);
      setSelectedTimeSlots([]);
    }
  }, [selectedLocationId, currentDate, store.id_user]);

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

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locationId = Number(e.target.value);
    setSelectedLocationId(locationId);
  };

  const handleAdminClick = () => {
    router.push('/admin');
  };

  const handleLogout = () => {
    router.push('/auth');
  };

  const handleEdit = (id: number) => {
    console.log(`Редактировать бронирование с ID ${id}`);
  };

  const handleDelete = (id: number) => {
    console.log(`Удалить бронирование с ID ${id}`);
  };

  const handleVerifyCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerifyCode(e.target.value);
  };

  const handleVerifyBooking = async () => {
    if (!verifyCode) {
      alert('Пожалуйста, введите код проверки.');
      return;
    }

    try {
      const response = await postData(endpoints.verify_booking, { code: Number(verifyCode) });
      if (response instanceof Error) throw response;

      console.log('Данные бронирования:', response);
      setBookingDetails(response);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Ошибка при проверке бронирования:', error);
      alert('Не удалось проверить бронирование. Проверьте код и попробуйте снова.');
    }
  };

  const handleConfirmBooking = async () => {
    if (!bookingDetails) return;

    const slotIds = bookingDetails.time_slot.map(slot => slot.id_time_slot);

    const requestBody = {
      user_id: bookingDetails.user,
      room_id: bookingDetails.room,
      date: bookingDetails.date,
      review: bookingDetails.review ?? null,
      status: 'confirmed',
      slot: slotIds,
    };

    try {
      const response = await updateData(
        endpoints.apply_verify_code(bookingDetails.id_booking),
        requestBody
      );
      if (response instanceof Error) throw response;

      console.log('Бронирование успешно подтверждено:', response);
      alert('Бронирование подтверждено!');
      setIsModalOpen(false);
      setVerifyCode('');
      setBookingDetails(null);

      await fetchBookings();
    } catch (error) {
      console.error('Ошибка при подтверждении бронирования:', error);
      alert('Не удалось подтвердить бронирование. Попробуйте снова.');
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setVerifyCode('');
    setBookingDetails(null);
  };

  const handleAddRoom = () => {
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = async () => {
    if (!selectedLocationId) return;

    if (capacity < 1) {
      alert('Вместимость комнаты должна быть не менее 1 человека.');
      setCapacity(1);
      return;
    }

    const requestBody = {
      room_name: roomName,
      capacity,
      id_equipment: equipmentIds,
      id_location: selectedLocationId,
    };

    try {
      const response = await postData(endpoints.add_room(selectedLocationId), requestBody);
      if (response instanceof Error) throw response;

      console.log('Комната успешно добавлена:', response);
      alert('Комната добавлена!');
      setIsRoomModalOpen(false);
      setRoomName('');
      setCapacity(1);
      setEquipmentIds([]);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Ошибка при добавлении комнаты:', error);
      alert('Не удалось добавить комнату. Попробуйте снова.');
    }
  };

  const handleCancelRoom = () => {
    setIsRoomModalOpen(false);
    setRoomName('');
    setCapacity(1);
    setEquipmentIds([]);
  };

  const handleDeleteRoom = (room: Room) => {
    setRoomToDelete(room);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedLocationId || !roomToDelete) return;

    try {
      const response = await deleteData(endpoints.delete_room(selectedLocationId, roomToDelete.id_room));
      if (response instanceof Error) throw response;

      console.log('Комната успешно удалена:', response);
      alert('Комната удалена!');
      setIsDeleteModalOpen(false);
      setRoomToDelete(null);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Ошибка при удалении комнаты:', error);
      alert('Не удалось удалить комнату. Попробуйте снова.');
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setRoomToDelete(null);
  };

  const handleEquipmentToggle = (equipment: string, id: number) => {
    setEquipmentIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(eqId => eqId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setCapacity(value < 1 ? 1 : value);
  };

  // Обработчики для создания бронирования
  const handleAddBooking = () => {
    setIsBookingModalOpen(true);
  };

  const handleSaveBooking = async () => {
    if (!selectedRoomId || !currentDate || selectedTimeSlots.length === 0) {
      alert('Пожалуйста, выберите комнату и временные слоты.');
      return;
    }

    const requestBody = {
      user_id: store.id_user,
      room_id: selectedRoomId,
      date: currentDate,
      review: null,
      status: 'pending',
      slot: selectedTimeSlots,
    };

    try {
      const response = await postData(endpoints.create_booking, requestBody);
      if (response instanceof Error) throw response;

      console.log('Бронирование успешно создано:', response);
      alert('Бронирование создано!');
      setIsBookingModalOpen(false);
      setSelectedRoomId(null);
      setSelectedTimeSlots([]);
      await fetchBookings();
    } catch (error) {
      console.error('Ошибка при создании бронирования:', error);
      alert('Не удалось создать бронирование. Попробуйте снова.');
    }
  };

  const handleCancelBooking = () => {
    setIsBookingModalOpen(false);
    setSelectedRoomId(null);
    setSelectedTimeSlots([]);
  };

  const handleTimeSlotToggle = (slotId: number) => {
    if (availableTimeSlots.length === 0) return;

    const firstAvailableSlotId = availableTimeSlots[0].id_time_slot;
    const clickedIndex = availableTimeSlots.findIndex(slot => slot.id_time_slot === slotId);

    // Если выбранный слот не является первым доступным или следующим за последним выбранным
    if (selectedTimeSlots.length === 0) {
      if (slotId !== firstAvailableSlotId) {
        alert('Вы можете выбирать слоты только начиная с первого доступного.');
        return;
      }
      setSelectedTimeSlots([slotId]);
    } else {
      const lastSelectedIndex = availableTimeSlots.findIndex(slot => slot.id_time_slot === selectedTimeSlots[selectedTimeSlots.length - 1]);
      if (clickedIndex === lastSelectedIndex + 1) {
        // Добавляем следующий слот
        setSelectedTimeSlots([...selectedTimeSlots, slotId]);
      } else if (selectedTimeSlots.includes(slotId)) {
        // Удаляем слот, если он уже выбран (разрешено удалять только последний)
        if (slotId === selectedTimeSlots[selectedTimeSlots.length - 1]) {
          setSelectedTimeSlots(selectedTimeSlots.slice(0, -1));
        }
      } else {
        alert('Вы можете выбирать только следующий слот после последнего выбранного.');
      }
    }
  };

  const calendarValue = selectedDate ? new Date(selectedDate) : null;

  const filteredBookings = selectedDate
    ? bookings.filter((booking) => booking.date === selectedDate)
    : bookings;

  return (
    <>
      <header className={styles.header}>
        <span className={styles.title}>Панель менеджера</span>
        <div className={styles.actions}>
          {isLoading ? (
            <span>Загрузка...</span>
          ) : managerLocations.length > 0 ? (
            <select
              value={selectedLocationId || ''}
              onChange={handleLocationChange}
              className={styles.locationSelect}
            >
              {managerLocations.map((location) => (
                <option key={location.location_id} value={location.location_id}>
                  {location.name}
                </option>
              ))}
            </select>
          ) : (
            <span>Локации не найдены</span>
          )}
          {isAdmin && (
            <button className={styles.button} onClick={handleAdminClick}>
              Панель администратора
            </button>
          )}
          <button className={styles.logoutButton} onClick={handleLogout}>
            <img src="/svg/exit.svg" alt="Logout" className={styles.logoutIcon} width={24} height={24} />
          </button>
        </div>
      </header>

      <div className={styles.access_code}>
        <input
          type="number"
          max="999999"
          placeholder="Код проверки"
          value={verifyCode}
          onChange={handleVerifyCodeChange}
          className={styles.verifyCodeInput}
        />
        <button className={styles.check_button} onClick={handleVerifyBooking}>
          Проверить
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.left_menu}>
          <div className={styles.header_left_menu}>
            <span className={styles.menu_title}>Переговорные комнаты</span>
            <button className={styles.room_button} onClick={handleAddRoom}>
              Добавить
            </button>
          </div>
          {selectedLocationId ? (
            <RoomsManager locationId={selectedLocationId} onDelete={handleDeleteRoom} refreshKey={refreshKey} />
          ) : (
            <p>Выберите локацию для отображения комнат.</p>
          )}
        </div>
        <div className={styles.right_menu}>
          <div className={styles.header_rigth_menu}>
            <span className={styles.menu_title}>Бронирования</span>
            <button className={styles.room_button} onClick={handleAddBooking}>
              Добавить
            </button>
          </div>
          <div className={styles.filters}>
            <Calendar
              value={calendarValue}
              onChange={handleCalendarChange}
              dateFormat="dd.mm.yy"
              placeholder="ДД.ММ.ГГГГ"
              locale="ru"
              className={styles.customCalendar}
              panelClassName={styles.customPanel}
            />
          </div>
          <div className={styles.listBooking}>
            <BookingManager
              bookings={filteredBookings}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>

      {isModalOpen && bookingDetails && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeButton} onClick={handleCancel}>
              ✕
            </button>
            <h3>Бронирование найдено.<br />Подтвердить?</h3>
            <div className={styles.modalContent}>
              <p><strong>ID бронирования:</strong> {bookingDetails.id_booking}</p>
              <p><strong>Комната:</strong> {bookingDetails.room_name}</p>
              <p><strong>Локация:</strong> {bookingDetails.location_name}</p>
              <p><strong>Вместимость:</strong> {bookingDetails.capacity} чел.</p>
              <p><strong>Дата:</strong> {bookingDetails.date}</p>
              <p><strong>Время:</strong> {bookingDetails.time_slot.length > 0
                ? `${bookingDetails.time_slot[0].time_begin.slice(0, 5)} - ${bookingDetails.time_slot[bookingDetails.time_slot.length - 1].time_end.slice(0, 5)}`
                : 'Время не указано'}</p>
              <p><strong>Статус:</strong> {bookingDetails.status === 'pending' ? 'Ожидает подтверждения' : 'Подтверждено'}</p>
              <p><strong>Код подтверждения:</strong> {bookingDetails['verify code']}</p>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.confirmButton} onClick={handleConfirmBooking}>
                Подтвердить
              </button>
              <button className={styles.cancelButton} onClick={handleCancel}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {isRoomModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeButton} onClick={handleCancelRoom}>
              ✕
            </button>
            <h3>Детали о комнате</h3>
            <div className={styles.modalContent}>
              <div className={styles.inputInModal}>
                Название
                <input
                  type="text"
                  placeholder="Название"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className={styles.roomInput}
                />
              </div>
              <div className={styles.inputInModal}>
                Вместимость
                <input
                  type="number"
                  min={1}
                  max={15}
                  placeholder="Вместимость (человек)"
                  value={capacity}
                  onChange={handleCapacityChange}
                  className={styles.roomInput}
                />
              </div>
              <div className={styles.equipmentList}>
                {Object.entries(equipmentIcons).map(([equipment, icon], index) => (
                  <label key={index} className={styles.equipmentItem}>
                    <input
                      type="checkbox"
                      checked={equipmentIds.includes(index + 1)}
                      onChange={() => handleEquipmentToggle(equipment, index + 1)}
                    />
                    <img src={icon} alt={equipment} className={styles.equipmentIcon} width="24" height="24" />
                    {equipment}
                  </label>
                ))}
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.confirmButton} onClick={handleSaveRoom}>
                Сохранить
              </button>
              <button className={styles.cancelButton} onClick={handleCancelRoom}>
                Отменить
              </button>
            </div>
          </div>
        </div>
      )}

      {isBookingModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button className={styles.closeButton} onClick={handleCancelBooking}>
              ✕
            </button>
            <h3>Детали бронирования</h3>
            <div className={styles.modalContent}>
              <div className={styles.inputInModal}>
                Переговорная
                <select
                  value={selectedRoomId || ''}
                  onChange={(e) => setSelectedRoomId(Number(e.target.value))}
                  className={styles.roomInput}
                >
                  <option value="">Выберите комнату</option>
                  {rooms.map(room => (
                    <option key={room.id_room} value={room.id_room}>
                      {room.room_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.inputInModal}>
                Дата бронирования
                <p>{currentDate.split('-').reverse().join('.')}</p>
              </div>
              <div className={styles.inputInModal}>
                Доступное время
                <div className={styles.timeSlots}>
                  {isSlotsLoading ? (
                    <p>Загрузка слотов...</p>
                  ) : availableTimeSlots.length > 0 ? (
                    availableTimeSlots.map(slot => (
                      <button
                        key={slot.id_time_slot}
                        onClick={() => handleTimeSlotToggle(slot.id_time_slot)}
                        className={`${styles.timeSlot} ${
                          selectedTimeSlots.includes(slot.id_time_slot) ? styles.selectedTimeSlot : ''
                        }`}
                      >
                        {slot.time_begin.slice(0, 5)} - {slot.time_end.slice(0, 5)}
                      </button>
                    ))
                  ) : (
                    <p>Нет доступных слотов</p>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.confirmButton} onClick={handleSaveBooking}>
                Сохранить
              </button>
              <button className={styles.cancelButton} onClick={handleCancelBooking}>
                Отменить
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          roomName={roomToDelete ? roomToDelete.room_name : undefined}
        />
      )}
    </>
  );
};

export default Manager;