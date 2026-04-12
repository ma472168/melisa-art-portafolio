import React, { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Profile } from '@/src/types';
import { motion } from 'motion/react';

export default function Semblanza() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
      setLoading(false);
    }

    fetchProfile();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center italic font-serif">Cargando...</div>;

  return (
    <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <motion.header 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <h1 className="text-5xl md:text-7xl font-serif mb-6">Semblanza</h1>
        <p className="text-muted uppercase tracking-[0.3em] text-xs">Sobre la artista</p>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 items-start">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-1"
        >
          <div className="aspect-square bg-ink/5 overflow-hidden rounded-full border-4 border-paper shadow-xl">
            <img
              src={profile?.avatar_url || 'https://picsum.photos/seed/artist/800/800'}
              alt="Melisa"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-2 space-y-8"
        >
          <h2 className="text-3xl font-serif">{profile?.full_name || 'Melisa'}</h2>
          <div className="prose prose-lg text-ink/80 leading-relaxed font-light">
            {profile?.bio ? (
              profile.bio.split('\n').map((para, i) => (
                <p key={i} className="mb-6">{para}</p>
              ))
            ) : (
              <p>Estudiante de artes visuales apasionada por la exploración de formas y colores...</p>
            )}
          </div>
          
          <div className="pt-8 border-t border-ink/10">
            <h4 className="text-xs uppercase tracking-widest text-muted mb-2">Contacto</h4>
            <p className="text-xl font-serif">{profile?.email || 'melisa@example.com'}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
