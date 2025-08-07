import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts'; // 1. Impor font 'inter'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* 2. Terapkan class dari font ke elemen <body> */}
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}