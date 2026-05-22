import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import Export from './pages/Export';
import Import from './pages/Import';
import Scanner from './pages/Scanner';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/export" element={<Export />} />
        <Route path="/admin" element={<Import />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Close sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <BrowserRouter>
      <div className={`app-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Overlay for mobile/tablet sidebar */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <div className="app-main">
          <Header onToggleSidebar={toggleSidebar} />
          <main className="app-content">
            <AnimatedRoutes />
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
