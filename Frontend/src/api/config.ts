export const BASE_URL = 'https://sivann.ru';

export const endpoints = {
  locations: `${BASE_URL}/location`,
  time_slots: (id_location) => `${BASE_URL}/location/${id_location}/time_slot/`,
  rooms: (id_location) => `${BASE_URL}/location/${id_location}/rooms/`,
};