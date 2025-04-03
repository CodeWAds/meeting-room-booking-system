import React, { createContext, useState } from 'react';

// Создаем контекст
export const BookingContext = createContext();

// Провайдер для контекста
export const BookingProvider = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(''); // Выбранная дата
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(''); // Выбранный временной слот
  const [selectedRoom, setSelectedRoom] = useState(null); // Выбранная комната

  return (
    <BookingContext.Provider
      value={{
        selectedDate,
        setSelectedDate,
        selectedTimeSlot,
        setSelectedTimeSlot,
        selectedRoom,
        setSelectedRoom,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};