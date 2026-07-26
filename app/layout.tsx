import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '배리어프리 셀프오더 플랫폼 | 스마트 QR 키오스크 PWA',
  description: '시각, 청각, 지체 장애인 및 고령자 전용 스마트폰 셀프오더 PWA 프로토타입. GSAP 모션, Framer Motion, 고대비, 음성안내(TTS) 지원.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased dark" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-yellow-400 selection:text-slate-950" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
