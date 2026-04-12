import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="text-2xl font-serif tracking-tight">
          Melisa <span className="italic font-light">Art</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-sm uppercase tracking-widest hover:opacity-60 transition-opacity">Galería</Link>
          <Link to="/semblanza" className="text-sm uppercase tracking-widest hover:opacity-60 transition-opacity">Semblanza</Link>
          {user ? (
            <div className="flex items-center space-x-6">
              <Link to="/dashboard" className="text-sm uppercase tracking-widest hover:opacity-60 transition-opacity flex items-center">
                <User className="w-4 h-4 mr-2" /> Dashboard
              </Link>
              <button onClick={handleLogout} className="text-sm uppercase tracking-widest hover:opacity-60 transition-opacity">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-sm uppercase tracking-widest hover:opacity-60 transition-opacity">Login</Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-20 left-0 right-0 bg-paper border-b border-ink/5 p-6 flex flex-col space-y-6"
          >
            <Link to="/" onClick={() => setIsOpen(false)} className="text-lg uppercase tracking-widest">Galería</Link>
            <Link to="/semblanza" onClick={() => setIsOpen(false)} className="text-lg uppercase tracking-widest">Semblanza</Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-lg uppercase tracking-widest">Dashboard</Link>
                <button onClick={handleLogout} className="text-lg uppercase tracking-widest text-left">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-lg uppercase tracking-widest">Login</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
