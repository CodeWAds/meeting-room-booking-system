'use client';

import Navbar from "../components/Navbar";

interface AppProps {
    children: React.ReactNode;
}

const App: React.FC<AppProps> = ({ children }) => {
    
    return (
        <>
        {children}
        </>
    );
};

export default App;

