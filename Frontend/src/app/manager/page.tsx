"use client";

import { useState } from "react";
import '../../CalendarLocale';
import React from "react";
import styles from "../../styles/Manager.module.css";
import { useRouter } from "next/navigation";
import { Calendar } from 'primereact/calendar';
import RoomsManager from "../../components/RoomsManager";
import BookingManager from "../../components/BookingManager";

const Manager: React.FC = () => {
    const router = useRouter();

    const [selectedDate, setSelectedDate] = useState<string>('');

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

    const handleMainClick = () => {
        router.push("/manager");
    };

    const handleStatsClick = () => {
        router.push("manager/statistic");
    };

    const handleLogout = () => {
        router.push("/auth");
    };

    const calendarValue = selectedDate ? new Date(selectedDate) : null;

    const handleEdit = () => {
        console.log('Редактировать нажато');
      };
    
      const handleDelete = () => {
        console.log('Удалить нажато');
      };

    return (
        <>
            <header className={styles.header}>
                <span className={styles.title}>Панель менеджера</span>
                <div className={styles.actions}>
                    <button className={styles.button} onClick={handleMainClick}>
                        Главная
                    </button>
                    <button className={styles.button} onClick={handleStatsClick}>
                        Статистика
                    </button>
                    <button className={styles.logoutButton} onClick={handleLogout}>
                        <img src="/svg/exit.svg" alt="Logout" className={styles.logoutIcon} width={24} height={24} />
                    </button>
                </div>
            </header>

            <div className={styles.access_code}>
                <input type="number" max="999999" placeholder="Код проверки" />
                <button className={styles.check_button}>Проверить</button>
            </div>

            <div className={styles.content}>
                <div className={styles.left_menu}>
                    <div className={styles.header_left_menu}>
                        <span className={styles.menu_title}>Переговорные комнаты</span>
                        <button className={styles.room_button}>Добавить</button>
                    </div>
                    <RoomsManager />
                </div>
                <div className={styles.right_menu}>
                    <div className={styles.header_rigth_menu}>
                        <span className={styles.menu_title}>Бронирования</span>
                        <button className={styles.room_button}>Добавить</button>
                    </div>
                    <div className={styles.filters}>
                        <input type="text" placeholder="Поиск" className={styles.search_input} />
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
                    <div className={styles.listBooking}>
                    <BookingManager
                        date="15 августа 2023"
                        time="14:00 - 15:30"
                        location="1 корпус, 2 этаж"
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                    </div>
                </div>
            </div>
        </>
    )
};

export default Manager;