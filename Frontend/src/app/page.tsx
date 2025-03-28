"use client";
import React, { useState, useEffect } from "react";
import TelegramWebApps from "@twa-dev/sdk";
import Navbar from "../components/Navbar";
import Filters from "../components/Filters";
import Rooms from "../components/Rooms";
import Modal from "../components/Modal";
import styles from "../styles/Home.module.css";

interface UserData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

const Home: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const initializeTelegram = () => {
      if (typeof window !== "undefined") {
        try {
          TelegramWebApps.ready();
          const data = TelegramWebApps.initDataUnsafe?.user.id;
          if (data) {
            setUserData(data);
          } else {
            console.warn("Данные пользователя недоступны. Запустите приложение в Telegram Mini App.");
            setUserData(null);
          }
        } catch (error) {
          console.error("Ошибка инициализации Telegram:", error);
          setUserData(null);
        }
      }
    };
    initializeTelegram();
  }, []);

  const handleBookClick = (): void => {
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <Filters />
      <Rooms onBookClick={handleBookClick} />
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} />
      <div className={styles.userId}>
        {userData ? (
          <p>Ваш Telegram ID: {userData}</p>
        ) : (
          <p>Загрузка ID пользователя...</p>
        )}
      </div>
    </div>
  );
};

export default Home;