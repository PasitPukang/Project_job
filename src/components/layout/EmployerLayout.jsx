import React from 'react';
import { Outlet } from 'react-router-dom';
import EmployerNavbar from './EmployerNavbar';
import Footer from './Footer';

export default function EmployerLayout() {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f3f4f6]">
      <EmployerNavbar />
      <main className="flex-1 pb-12">
        <Outlet />
      </main>
      <Footer showCTA={false} />
    </div>
  );
}
