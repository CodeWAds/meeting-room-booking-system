'use client';

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

