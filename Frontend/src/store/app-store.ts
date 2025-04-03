import { create } from 'zustand';

interface UserData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface AppStore {
  isAuth: boolean;
  user: UserData | null;
  karma: number | null;
  token: string | null;
  setUserData: (user: UserData | null) => void;
  setUserKarma: (karma: number | null) => void;
}

export const useStore = create<AppStore>((set) => ({
  isAuth: false,
  user: null,
  karma: null,
  token: null,
  setUserData: (user: UserData | null) => set({ user }),
  setUserKarma: (karma: number | null) => set({ karma })
})); 