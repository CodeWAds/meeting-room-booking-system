import telebot

API_TOKEN = '8189499798:AAGy919abCRwJyeL_HiWm49TFnuvsh5mncA'
bot = telebot.TeleBot(API_TOKEN)

@bot.message_handler(commands=['start'])
def send_welcome(message):
    welcome_message = (
        "Привет! Я — чат-бот приложения Rooms. "
        "Буду заранее оповещать тебя о предстоящей брони, чтобы ты ничего не пропустил."
    )
    bot.reply_to(message, welcome_message)

if __name__ == '__main__':
    bot.polling()