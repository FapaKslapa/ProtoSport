import {initDb} from '@/lib/db';
import { Inter } from 'next/font/google';
import './globals.css';

initDb();

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter',
});

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="it" className={inter.variable}>
        <body className="font-inter">{children}</body>
        </html>
    );
}