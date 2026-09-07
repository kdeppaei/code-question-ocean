import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CodeDive 程式題海｜程式語言刷題與教學',
  description: 'C、C++、Python、SQL、GDB 的互動刷題與繁體中文教學網站。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-Hant"><body>{children}</body></html>;
}
