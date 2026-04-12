/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import Navbar from '@/src/components/Navbar';
import Home from '@/src/pages/Home';
import ArtworkDetail from '@/src/pages/ArtworkDetail';
import Semblanza from '@/src/pages/Semblanza';
import Contacto from '@/src/pages/Contacto';
import Login from '@/src/pages/Login';
import Dashboard from '@/src/pages/Dashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;
  if (!session) return <Navigate to="/login" />;

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-paper selection:bg-ink selection:text-paper">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/artwork/:id" element={<ArtworkDetail />} />
          <Route path="/semblanza" element={<Semblanza />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
        
        <footer className="py-20 px-6 border-t border-ink/5 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-muted">
            Programado por xenredda ·{' '}
            <a
              href="https://github.com/ma472168/melisa-art-portafolio"
              target="_blank"
              rel="noreferrer"
              className="underline hover:opacity-70 transition-opacity"
            >
              Repositorio
            </a>
          </p>
        </footer>
      </div>
    </Router>
  );
}
