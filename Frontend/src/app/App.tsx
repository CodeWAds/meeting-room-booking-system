'use client';

import Navbar from "../components/Navbar";
import { useStore } from "../store/app-store";
import { useEffect } from "react";
import TelegramWebApps from "@twa-dev/sdk";
import { postData } from "../api/api-utils";
import { endpoints } from "../api/config";

interface AppProps {
    children: React.ReactNode;
}

const App: React.FC<AppProps> = ({ children }) => {
    const store = useStore();

    useEffect(() => {
        const initializeTelegram = () => {
            if (typeof window !== "undefined") {
                try {
                    TelegramWebApps.ready();
                    const data = TelegramWebApps.initDataUnsafe.user;
                    if (data) {
                        store.setUserData(data);
                        console.log("Данные пользователя получены:", data);
                    } else {
                        console.warn("Нет данных о пользователе — проверь запуск внутри Telegram Mini App.");
                        store.setUserData(null);
                    }
                } catch (error) {
                    console.error("Ошибка инициализации Telegram:", error);
                    store.setUserData(null);
                }
            }
        };

        const createUser = async (username: string | undefined, telegramId: number | undefined) => {
            if (!username || !telegramId) {
                console.error("Недостаточно данных для создания пользователя");
                return;
            }
            const payload = { username, id_telegram: telegramId };
            return await postData(endpoints.login_client, payload);
        };

        initializeTelegram();

        // createUser("Джеки Чан", 1111111).then((data) => {
        //     if (data instanceof Error) {
        //         console.error("Ошибка при создании пользователя:", data);
        //     } else {
        //         store.setUserID(data.id_user);
        //     }
        // });
    }, []);

    useEffect(() => {
        if (store.id_user !== null) {
            console.log("User ID обновлён:", store.id_user);
        }
    }, [store.id_user]);
    return (
        <>
            {children}
        </>
    );
};

export default App;

