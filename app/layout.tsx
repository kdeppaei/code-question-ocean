import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CodeDive 程式題海｜程式語言刷題與教學',
  description: 'C、C++、Python、SQL、GDB 的互動刷題與繁體中文教學網站。',
  metadataBase: new URL('https://codedive-practice-lab.kdeppaei2.chatgpt.site'),
  openGraph: {
    title: 'CodeDive 程式題海',
    description: '學觀念、寫程式、刷題目：C、C++、Python、SQL、GDB 的互動學習平台。',
    url: 'https://codedive-practice-lab.kdeppaei2.chatgpt.site',
    siteName: 'CodeDive 程式題海',
    locale: 'zh_TW',
    type: 'website',
    images: [{ url: '/og.png', width: 1731, height: 909, alt: 'CodeDive 程式題海｜學觀念・寫程式・刷題目' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeDive 程式題海',
    description: 'C、C++、Python、SQL、GDB 的互動刷題與繁體中文教學。',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
