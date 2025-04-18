import { create } from 'zustand';
import { AppStore, UserData } from '../types/interfaces';

export const useStore = create<AppStore>((set) => ({
  isAuth: false,
  user: null,
  id_user: null,
  karma: null,
  token: null,
  setUserData: (user: UserData | null) => set({ user }),
  setUserKarma: (karma: number | null) => set({ karma }),
  setUserID: (userID: number | null) => set({ id_user: userID }),
})); 