import { verify } from "crypto";
import { get } from "http";

export const BASE_URL = 'https://sivann.ru';

export const endpoints = {
  locations: `${BASE_URL}/location`,
  time_slots: (id_location) => `${BASE_URL}/location/${id_location}/time_slot/`,
  rooms: (id_location) => `${BASE_URL}/location/${id_location}/rooms/`,
  login_client: `${BASE_URL}/user/login_telegram/`,
  my_bookings: (id_user) => `${BASE_URL}/booking/user/${id_user}/`,
  create_booking: `${BASE_URL}/booking/create-booking/`,
  delete_booking: (id_booking) => `${BASE_URL}/booking/${id_booking}/delete/`,
  get_available_rooms: `${BASE_URL}/location/get_available_rooms/`,
  get_info_user: (id_user) => `${BASE_URL}/user/${id_user}/`,
  add_to_favourite: (id_user) => `${BASE_URL}/user/${id_user}/favourite_rooms/add_room/`,
  delete_favourite: (id_user, id_rooms) => `${BASE_URL}/user/${id_user}/favourite_rooms/${id_rooms}/delete/`,
  get_favourite_rooms: (id_user) => `${BASE_URL}/user/${id_user}/favourite_rooms/`,
  get_all_booking: `${BASE_URL}/booking/`,
  get_location_booking: (id_location) => `${BASE_URL}/booking/location/${id_location}/`,
  verify_booking: `${BASE_URL}/booking/verify_code/`,
  apply_verify_code: (booking_id)=>`${BASE_URL}/booking/${booking_id}/update`,
  get_roles: (id_user) => `${BASE_URL}/user/${id_user}/get_roles/`,
  add_room: (id_location) => `${BASE_URL}/location/${id_location}/rooms/create_room/`,
  delete_room: (id_location, id_room) => `${BASE_URL}/location/${id_location}/rooms/${id_room}/delete/`,
  update_room: (id_location, id_room) => `${BASE_URL}/location/${id_location}/rooms/${id_room}/update/`,
  update_booking: (id_booking) => `${BASE_URL}/booking/${id_booking}/update/`,
  
};