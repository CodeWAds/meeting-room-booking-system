import type { Metadata } from "next";
import "../styles/global.css";
import App from "./App";


export const metadata: Metadata = {
    title: "Rooms",
    description: "This is a rooms app",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;

}>) {
    return (
        <html lang="ru">
            <body>
                <App>
                    {children}
                </App>
            </body>
        </html>
    );
}
