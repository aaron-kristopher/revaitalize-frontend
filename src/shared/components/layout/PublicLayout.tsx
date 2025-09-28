import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/shared/components/common/Navbar';
import Footer from '@/shared/components/common/Footer';

const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <main className="flex-grow pt-16">
        <Outlet />
        <Footer />
      </main>
    </div>
  );
};

export default PublicLayout;
