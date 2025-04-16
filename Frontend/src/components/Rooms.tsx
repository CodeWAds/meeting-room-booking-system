"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/Rooms.module.css";
import { Room } from "../types/interfaces";
import { postData, getData } from "../api/api-utils"; // Используем postData вместо getData
import { endpoints } from "../api/config";
import { useStore } from "../store/app-store";

interface RoomsProps {
  onBookClick: (roomName: string, roomId: number, date: string, timeStart: string, timeEnd: string) => void;
  selectedDate?: string;
  selectedTimeSlots?: { id: number; timeStart: string; timeEnd: string }[]; // Обновляем тип с id
  selectedLocation?: string; // Добавляем локацию
}

const Rooms: React.FC<RoomsProps> = ({ onBookClick, selectedDate, selectedTimeSlots, selectedLocation }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const store = useStore();
  const [favourites, setFavourites] = useState<Room[]>(() => {
    if (typeof window !== "undefined") {
      const savedFavourites = localStorage.getItem("favourites");
      return savedFavourites ? JSON.parse(savedFavourites) : [];
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableRooms = async () => {
      if (!selectedDate || !selectedTimeSlots || selectedTimeSlots.length === 0 || !selectedLocation) {
        setRooms([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const formattedDate = selectedDate.includes(".")
          ? formatDateToYYYYMMDD(selectedDate)
          : selectedDate;

        // Получаем массив ID слотов
        const timeSlotIds = selectedTimeSlots.map((slot) => slot.id);

        const params = {
          user_id: store.id_user,
          location: selectedLocation,
          date: formattedDate,
          time_slot: timeSlotIds, // Массив ID слотов
        };


        const response = await postData(endpoints.get_available_rooms, params);
        if (response instanceof Error) throw response;

        // Предполагаем, что сервер возвращает объект с полем available_rooms
        setRooms(response.available_rooms || []);
      } catch (error) {
        console.error("Ошибка при загрузке доступных комнат:", error);
        setRooms([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableRooms();
  }, [selectedDate, selectedTimeSlots, selectedLocation]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("favourites", JSON.stringify(favourites));
    }
  }, [favourites]);

  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== "undefined") {
        const savedFavourites = localStorage.getItem("favourites");
        setFavourites(savedFavourites ? JSON.parse(savedFavourites) : []);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, []);

  const toggleFavourite = (room: Room) => {
    if (favourites.some((fav) => fav.name === room.name && fav.location === room.location)) {
      setFavourites(
        favourites.filter((fav) => !(fav.name === room.name && fav.location === room.location))
      );
    } else {
      setFavourites([...favourites, room]);
    }
  };

  const formatDateToYYYYMMDD = (dateStr: string): string => {
    const [day, month, year] = dateStr.split(".");
    return `${year}-${month}-${day}`;
  };

  const handleBookClick = (room: Room) => {
    let date = selectedDate || "2025-04-10";
    let timeStart = "9:00";
    let timeEnd = "10:10";

    if (date.includes(".")) {
      date = formatDateToYYYYMMDD(date);
    }

    if (selectedTimeSlots && selectedTimeSlots.length > 0) {
      timeStart = selectedTimeSlots[0].timeStart;
      timeEnd = selectedTimeSlots[selectedTimeSlots.length - 1].timeEnd;
    }

    onBookClick(room.name, room.id, date, timeStart, timeEnd);
  };

  return (
    <div className={styles.rooms}>
      <h3>Теперь выберите подходящую для вас переговорную комнату</h3>
      {isLoading ? (
        <p>Загрузка комнат...</p>
      ) : rooms.length === 0 ? (
        <p>Нет доступных комнат для выбранного времени</p>
      ) : (
        <div className={styles.roomList}>
          {rooms.map((room, index) => (
            <div key={index} className={styles.roomCard}>
              <h4>{room.name}</h4>
              <p>Вместимость: {room.capacity}</p>
              <p>Локация: {room.location}</p>
              <div className={styles.roomIcons}>
                {room.icons && room.icons.map((icon, i) => (
                  <img key={i} src={icon} alt={`icon-${i}`} className={styles.roomIcon} />
                ))}
              </div>
              <button
                className={styles.bookBtn}
                onClick={() => handleBookClick(room)}
                disabled={!selectedDate || !selectedTimeSlots || selectedTimeSlots.length === 0}
              >
                Забронировать
              </button>
              <span onClick={() => toggleFavourite(room)} className={styles.favorite}>
                {favourites.some(
                  (fav) => fav.name === room.name && fav.location === room.location
                ) ? (
                  <img src="/svg/liked.svg" alt="liked" />
                ) : (
                  <img src="/svg/notliked.svg" alt="not liked" />
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Rooms;