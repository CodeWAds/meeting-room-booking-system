module.exports = {
  apps: [
    {
      name: 'django-app', // Имя процесса в PM2
      script: 'gunicorn', // Команда для запуска Gunicorn
      args: 'project.wsgi:application --bind 127.0.0.1:3001', // WSGI и порт
      interpreter: '/home/sivann/meeting-room-booking-system/Backend/venv/bin/python3', // Путь к Python в venv
      cwd: '/home/sivann/meeting-room-booking-system/Backend', // Рабочая директория
      autorestart: true, // Перезапуск при сбое
      watch: false, // Отслеживание изменений (для разработки можно включить)
      max_memory_restart: '1G', // Перезапуск при превышении памяти
      env: {
        PYTHONPATH: '/home/sivann/meeting-room-booking-system/Backend', // Для поиска модулей
      },
    },
  ],
};
