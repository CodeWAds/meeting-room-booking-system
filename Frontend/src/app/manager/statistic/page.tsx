'use client';

import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { useRouter } from "next/navigation";
import styles from '../../../styles/Statistic.module.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ManagerPanel: React.FC = () => {
    const [showStats, setShowStats] = useState(false);
    const router = useRouter();

    const handleMainClick = () => {
        router.push("/manager");
    };

    const handleStatsClick = () => {
        router.push("manager/statistic");
    };

    const handleLogout = () => {
        router.push("/auth");
    };

    const chartData = {
        labels: ['5', '8', '8', '3', '5', '8', '7', '8', '8'],
        datasets: [
            {
                label: 'Dark Blue',
                data: [0, 0, 0, 8, 0, 0, 0, 0, 0],
                backgroundColor: '#1e90ff',
                borderRadius: 10,
            },
            {
                label: 'Light Blue',
                data: [5, 8, 8, 0, 5, 8, 7, 8, 8],
                backgroundColor: '#d3d3d3',
                borderRadius: 10,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Vertical Bars Card Title',
            },
        },
        scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true },
        },
    };

    return (
        <>
            <header className={styles.header}>
                <span className={styles.title}>Панель менеджера</span>
                <div className={styles.actions}>
                    <button className={styles.button} onClick={handleMainClick}>Главная</button>
                    <button className={styles.button} onClick={handleStatsClick}>Статистика</button>
                    <button className={styles.logoutButton} onClick={handleLogout}>
                        <img src="/svg/exit.svg" alt="Logout" className={styles.logoutIcon} width={24} height={24} />
                    </button>
                </div>
            </header>

            <div className={styles.content}>
                <aside className={styles.sidebar}>

                    <div className={styles.filterSection}>
                        <label>Выберите комнату</label>
                        <select className={styles.select}>
                            <option>Первая комната</option>
                            <option>Вторая комната</option>
                            <option>Третья комната</option>
                        </select>
                    </div>

                    <div className={styles.filterSection}>
                        <label>Выберите период</label>
                        <select className={styles.select}>
                            <option>Неделя</option>
                            <option>Месяц</option>
                            <option>Год</option>
                        </select>
                    </div>

                    <div className={styles.filterSection}>
                        <label>Вид статистики</label>
                        <select className={styles.select}>
                            <option>Выберите вид статистики</option>
                            <option>Гистограмма</option>
                            <option>График</option>
                        </select>
                    </div>

                    <button className={styles.showStatsButton} onClick={() => setShowStats(!showStats)}>
                        Показать статистику
                    </button>
                </aside>

                <main className={styles.main}>
                    {showStats && (
                        <div className={styles.chartContainer}>
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default ManagerPanel;
