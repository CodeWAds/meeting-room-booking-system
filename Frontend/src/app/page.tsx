"use client";
import React, { useState, useEffect } from "react";
import TelegramWebApps from "@twa-dev/sdk";
import Navbar from "../components/Navbar";
import Filters from "../components/Filters";
import Rooms from "../components/Rooms";
import Modal from "../components/Modal";
import styles from "../styles/Home.module.css";
import { useStore } from "../store/app-store";


const Home: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const store = useStore();

  useEffect(() => {
    const initializeTelegram = () => {
      if (typeof window !== "undefined") {
        try {
          TelegramWebApps.ready();
          const data = TelegramWebApps.initDataUnsafe.user;
          if (data) {
            store.setUserData(data);
          } else {
            console.warn("Данные пользователя недоступны. Запустите приложение в Telegram Mini App.");
            store.setUserData(null);
          }
        } catch (error) {
          console.error("Ошибка инициализации Telegram:", error);
          store.setUserData(null);
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
      <Navbar title="Rooms - пространство для идей и решений"/>
      <Filters />
      <Rooms onBookClick={handleBookClick} />
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default Home;