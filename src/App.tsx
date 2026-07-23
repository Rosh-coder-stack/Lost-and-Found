import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ItemProvider } from './context/ItemContext';
import { NavigationProvider } from './context/NavigationContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { BottomNav } from './components/layout/BottomNav';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <AuthProvider>
      <ItemProvider>
        <NavigationProvider>
          <div className="min-h-screen bg-[#fbf8ff] text-[#1a1b22] flex flex-col font-sans selection:bg-[#00288e] selection:text-white pb-16 md:pb-0">
            <Navbar />
            <main className="flex-1">
              <AppRoutes />
            </main>
            <Footer />
            <BottomNav />
          </div>
        </NavigationProvider>
      </ItemProvider>
    </AuthProvider>
  );
}
