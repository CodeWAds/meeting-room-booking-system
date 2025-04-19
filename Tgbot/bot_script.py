import telebot
from dotenv import load_dotenv
import os
import requests
import time
from threading import Thread, Lock
from datetime import datetime, timedelta
import logging
import sys

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('bot.log')
    ]
)
logger = logging.getLogger(__name__)

# Загрузка конфигурации
load_dotenv()

class BookingBot:
    def __init__(self):
        self.token = os.getenv('TELEGRAM_BOT_TOKEN')
        if not self.token:
            logger.error("Токен бота не найден в переменных окружения!")
            raise ValueError("Токен бота не найден")
            
        self.api_url = os.getenv('DJANGO_API_URL')
        if not self.api_url:
            logger.error("URL API не найден в переменных окружения!")
            raise ValueError("URL API не найден")
            
        self.bot = telebot.TeleBot(self.token, threaded=False)
        self.last_notification = {}
        self.lock = Lock()
        self.running = False
        self.setup_handlers()
        
    def setup_handlers(self):
        @self.bot.message_handler(commands=['start', 'help'])
        def handle_start(message):
            try:
                user = message.from_user
                welcome_msg = (
                    f"👋 Привет, {user.first_name or 'друг'}!\n\n"
                    "Я — чат-бот приложения Rooms.\n"
                    "Буду заранее оповещать тебя о предстоящей брони, чтобы ты ничего не пропустил.\n"
                )
                self.bot.reply_to(message, welcome_msg, parse_mode='Markdown')
            except Exception as e:
                logger.error(f"Ошибка в handle_start: {e}", exc_info=True)

    def get_upcoming_bookings(self):
        """Безопасное получение бронирований из API"""
        try:
            logger.info("Запрашиваю список бронирований...")
            response = requests.get(
                f"{self.api_url}upcoming-notifications/",
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            if isinstance(data, dict) and 'notifications' in data:
                bookings = data['notifications']
            elif isinstance(data, list):
                bookings = data
            else:
                logger.warning(f"Неожиданный формат ответа: {data}")
                return []
            
            logger.info(f"Получено {len(bookings)} бронирований")
            return bookings
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Ошибка запроса к API: {e}", exc_info=True)
        except Exception as e:
            logger.error(f"Неожиданная ошибка: {e}", exc_info=True)
        return []

    def send_notification(self, booking, minutes_before):
        """Отправка персонализированного уведомления"""
        try:
            if not booking.get('telegram_id'):
                logger.warning(f"Нет telegram_id в бронировании: {booking}")
                return False
                
            # Сортируем временные слоты
            time_slots = sorted(booking.get('time_slots', []), 
                              key=lambda x: x['time_begin'])
            
            if not time_slots:
                logger.warning(f"Нет временных слотов: {booking}")
                return False
                
            # Формируем общий интервал
            time_range = f"{time_slots[0]['time_begin']} - {time_slots[-1]['time_end']}"
            
            # Проверяем предыдущее уведомление
            hour_key = f"{booking['telegram_id']}_{booking['booking_id']}_60"
            was_hour_notification = hour_key in self.last_notification
            
            if minutes_before == 60:
                time_left = "1 час"
                emoji = "⏰"
                greeting = f"Привет, {booking.get('username', 'пользователь')}!\n\n"
            else:
                time_left = "15 минут"
                emoji = "🔔"
                greeting = "Пора поторопиться:\n\n" if was_hour_notification else f"Привет, {booking.get('username', 'пользователь')}!\n\n"
            
            # Формируем сообщение
            message = (
                f"{emoji} {greeting}"
                f"Напоминание о бронировании (через {time_left}):\n"
                f"📍 *Локация*: {booking.get('location_name', 'не указана')}\n"
                f"🏠 *Адрес*: {booking.get('location_address', 'не указан')}\n"
                f"🚪 *Комната*: {booking.get('room_name', 'не указана')}\n"
                f"📅 *Дата*: {booking.get('date', 'не указана')}\n"
                f"🕒 *Время*: {time_range}\n\n"
                f"Статус: ⏳ *Ожидает подтверждения*"
            )
            
            self.bot.send_message(
                booking['telegram_id'],
                message,
                parse_mode='Markdown'
            )
            return True
            
        except Exception as e:
            logger.error(f"Ошибка отправки уведомления: {e}", exc_info=True)
            return False

    def send_cancellation_notification(self, booking):
        """Отправка уведомления об отмене бронирования"""
        time_slots = sorted(booking.get('time_slots', []), 
                    key=lambda x: x['time_begin'])
        time_range = f"{time_slots[0]['time_begin']} - {time_slots[-1]['time_end']}"

        try:
            if not booking.get('telegram_id'):
                logger.warning(f"Нет telegram_id в бронировании: {booking}")
                return False

            message = (
                f"❌ Привет, {booking.get('username', 'пользователь')}!\n\n"
                "Ваше бронирование было отменено, так как оно не было подтверждено вовремя.\n"
                f"📍 *Локация*: {booking.get('location_name', 'не указана')}\n"
                f"🚪 *Комната*: {booking.get('room_name', 'не указана')}\n"
                f"📅 *Дата*: {booking.get('date', 'не указана')}\n"
                f"🕒 *Время*: {time_range}\n\n"
            )

            self.bot.send_message(
                booking['telegram_id'],
                message,
                parse_mode='Markdown'
            )
            return True

        except Exception as e:
            logger.error(f"Ошибка отправки уведомления об отмене: {e}", exc_info=True)
            return False

    def update_booking_review(self, booking_id):
        """Обновление рейтинга бронирования перед удалением"""
        try:
            logger.info(f"Обновление рейтинга бронирования {booking_id}...")
            response = requests.patch(
                f"{self.api_url}{booking_id}/update/",
                json={"review": -20},
                timeout=10
            )
            response.raise_for_status()
            logger.info(f"Рейтинг бронирования {booking_id} успешно обновлен.")
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"Ошибка обновления рейтинга бронирования {booking_id}: {e}", exc_info=True)
            return False

    def delete_booking(self, booking):
        """Удаление бронирования через API и уведомление клиента"""
        try:
            booking_id = booking['booking_id']
            logger.info(f"Удаление бронирования {booking_id}...")

            # Обновляем рейтинг бронирования
            if self.update_booking_review(booking_id):
                logger.info(f"Рейтинг бронирования {booking_id} обновлен перед удалением.")

            # Отправляем уведомление об отмене
            if self.send_cancellation_notification(booking):
                logger.info(f"Уведомление об отмене отправлено для бронирования {booking_id}")

            # Удаляем бронирование
            response = requests.delete(
                f"{self.api_url}{booking_id}/delete/",
                timeout=10
            )
            response.raise_for_status()
            logger.info(f"Бронирование {booking_id} успешно удалено.")
            return True
        except requests.exceptions.RequestException as e:
            logger.error(f"Ошибка удаления бронирования {booking_id}: {e}", exc_info=True)
            return False

    def check_bookings(self):
        """Проверка бронирований каждые 10 минут"""
        while self.running:
            try:
                now = datetime.now()
                logger.info("Начинаю проверку бронирований...")
                
                bookings = self.get_upcoming_bookings()
                notifications_sent = 0
                bookings_deleted = 0
                
                for booking in bookings:
                    if not isinstance(booking, dict):
                        continue
                        
                    required_fields = ['telegram_id', 'status', 'booking_id', 
                                    'date', 'time_slots', 'room_name']
                    if not all(k in booking for k in required_fields):
                        logger.warning(f"Неполные данные: {booking}")
                        continue
                        
                    if booking['status'].lower() != 'pending':
                        continue
                        
                    try:
                        booking_date = datetime.strptime(booking['date'], "%Y-%m-%d").date()
                        if booking_date != now.date():
                            continue
                            
                        # Проверяем все временные слоты
                        for slot in booking['time_slots']:
                            try:
                                start_time = datetime.strptime(slot['time_begin'], "%H:%M").time()
                                booking_datetime = datetime.combine(booking_date, start_time)
                                time_diff = (booking_datetime - now).total_seconds() / 60
                                
                                logger.info(f"Время до бронирования {booking['booking_id']}: {time_diff} минут")
                                
                                if 55 < time_diff <= 65:  
                                    if self.send_appropriate_notification(booking, 60):
                                        notifications_sent += 1
                                elif 10 < time_diff <= 20:  
                                    if self.send_appropriate_notification(booking, 15):
                                        notifications_sent += 1
                                elif time_diff < -5:  
                                    if self.delete_booking(booking):
                                        bookings_deleted += 1
                                        
                            except ValueError as e:
                                logger.error(f"Ошибка времени: {e}", exc_info=True)
                                continue
                                
                    except ValueError as e:
                        logger.error(f"Ошибка даты: {e}", exc_info=True)
                        continue
                
                logger.info(f"Проверка завершена. Отправлено уведомлений: {notifications_sent}, удалено бронирований: {bookings_deleted}")
                time.sleep(60)
                
            except Exception as e:
                logger.error(f"Критическая ошибка: {e}", exc_info=True)
                time.sleep(60)

    def send_appropriate_notification(self, booking, minutes_before):
        """Отправляет уведомление с проверкой дубликатов"""
        key = f"{booking['telegram_id']}_{booking['booking_id']}_{minutes_before}"
        
        with self.lock:
            last_sent = self.last_notification.get(key)
            if last_sent and (datetime.now() - last_sent) < timedelta(hours=23):
                logger.info(f"Уведомление уже отправлено ранее: {key}")
                return False
                
            if self.send_notification(booking, minutes_before):
                self.last_notification[key] = datetime.now()
                logger.info(f"Уведомление отправлено (за {minutes_before} мин): {key}")
                return True
            return False

    def run(self):
        """Запуск бота"""
        logger.info("Запускаю бота...")
        self.running = True
        
        # Запускаем фоновую проверку
        notification_thread = Thread(target=self.check_bookings, daemon=True)
        notification_thread.start()
        
        try:
            self.bot.polling(none_stop=True, skip_pending=True, timeout=20)
        except telebot.apihelper.ApiTelegramException as e:
            if e.error_code == 409:
                logger.error("Ошибка: уже запущен другой экземпляр бота")
            else:
                logger.error(f"Ошибка Telegram API: {e}", exc_info=True)
        except Exception as e:
            logger.error(f"Фатальная ошибка: {e}", exc_info=True)
        finally:
            self.running = False
            notification_thread.join()
            logger.info("Бот остановлен")

if __name__ == '__main__':
    try:
        bot = BookingBot()
        bot.run()
    except Exception as e:
        logger.critical(f"Ошибка запуска: {e}", exc_info=True)
        sys.exit(1)