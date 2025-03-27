import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Room {
  name: string;
  capacity: string;
  location: string;
  icons: string[];
}

interface FavouritesContextType {
  favourites: Room[];
  toggleFavourite: (room: Room) => void;
}

const FavouritesContext = createContext<FavouritesContextType | undefined>(undefined);

export const FavouritesProvider = ({ children }: { children: ReactNode }) => {
  const [favourites, setFavourites] = useState<Room[]>([]);

  const toggleFavourite = (room: Room) => {
    if (favourites.some((fav) => fav.name === room.name && fav.location === room.location)) {
      setFavourites(favourites.filter((fav) => !(fav.name === room.name && fav.location === room.location)));
    } else {
      setFavourites([...favourites, room]);
    }
  };

  return (
    <FavouritesContext.Provider value={{ favourites, toggleFavourite }}>
      {children}
    </FavouritesContext.Provider>
  );
};

export const useFavourites = () => {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
};