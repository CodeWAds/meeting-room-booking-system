'use client';

import React, { useState, useEffect } from 'react';
import TelegramWebApps from '@twa-dev/sdk';
import Navbar from '../components/Navbar';
import Filters from '../components/Filters';
import Rooms from '../components/Rooms';
import Modal from '../components/Modal';
import styles from '../styles/Home.module.css';
import { useStore } from '../store/app-store';
import { postData } from '../api/api-utils';
import { endpoints } from '../api/config';

interface TimeSlot {
  id: number;
  timeStart: string;
  timeEnd: string;
}

const Home: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [bookingDetails, setBookingDetails] = useState<{
    roomName?: string;
    date?: string;
    timeStart?: string;
    timeEnd?: string;
    roomId?: number;
    slot?: number[];
  }>({});
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[] | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);
  const store = useStore();

  const handleBookClick = (
    roomName: string,
    roomId: number,
    date: string,
    timeStart: string,
    timeEnd: string
  ): void => {
    // Проверяем наличие userId
    if (!store.user?.id) {
      alert('Ошибка: пользователь не авторизован. Пожалуйста, войдите в систему.');
      return;
    }

    // Проверяем наличие слотов
    const slot = calculateSlots();
    if (!slot || slot.length === 0) {
      alert('Ошибка: не выбраны временные слоты для бронирования.');
      return;
    }

    setBookingDetails({ roomName, roomId, date, timeStart, timeEnd, slot });
    setIsModalOpen(true);
  };

  const calculateSlots = (): number[] => {
    if (!selectedTimeSlots || selectedTimeSlots.length === 0) {
      console.warn('Слоты не выбраны');
      return [];
    }

    return selectedTimeSlots.map((slot) => slot.id);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
  };

  const handleFilterChange = (date: string, timeSlots: TimeSlot[], location: string) => {
    setSelectedDate(date);
    setSelectedTimeSlots(timeSlots);
    setSelectedLocation(location);
  };

  return (
    <div className={styles.container}>
      <Navbar title="Rooms - пространство для идей и решений" />
      <Filters onFilterChange={handleFilterChange} />
      <Rooms
        onBookClick={handleBookClick}
        selectedDate={selectedDate}
        selectedTimeSlots={selectedTimeSlots}
        selectedLocation={selectedLocation}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        roomName={bookingDetails.roomName}
        roomId={bookingDetails.roomId}
        date={bookingDetails.date}
        timeStart={bookingDetails.timeStart}
        timeEnd={bookingDetails.timeEnd}
        userId={store.user?.id}
        slot={bookingDetails.slot}
      />
    </div>
  );
};

export default Home;