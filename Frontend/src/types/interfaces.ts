export interface Room {
    id: number;
    name: string;
    capacity: string;
    location: string;
    icons: string[];
}

export interface UserData {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
}

export interface AppStore {
    isAuth: boolean;
    user: UserData | null;
    id_user: number | null;
    karma: number | null;
    token: string | null;
    setUserData: (user: UserData | null) => void;
    setUserKarma: (karma: number | null) => void;
    setUserID: (userID: number | null) => void;
}

export interface NavbarProps {
    title: string;
  }