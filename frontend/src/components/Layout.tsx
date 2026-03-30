import { ReactNode } from 'react';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <main className="flex-1 pb-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
