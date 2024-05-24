import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { Metadata } from 'next'; // Metadata 추가

// 새 객체 만들기
// export const metadata: Metadata = {
//   title: 'Acme Dashboard',
//   description: 'The official Next.js Course Dashboard, built with App Router.',
//   metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
// };

// 객체 업데이트
// %s 특정 페이지 제목으로 대체
export const metadata: Metadata = {
  title: {
    template: '%s | Acme Dashboard',
    default: 'Acme Dashboard',
  },
  description: 'The official Next.js Learn Dashboard built with App Router.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/*<body>{children}</body>*/}
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
