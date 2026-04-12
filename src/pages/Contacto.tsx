import React, { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Profile } from '@/src/types';
import { motion } from 'motion/react';
import { Instagram, Mail, Github } from 'lucide-react';

export default function Contacto() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .single();

      if (data) {
        setProfile(data);
      }
    }

    fetchProfile();
  }, []);

  return (
    <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-7xl font-serif mb-6">Contacto</h1>
        <p className="text-muted uppercase tracking-[0.3em] text-xs">Redes y enlaces directos</p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 md:p-12"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
          <div className="md:col-span-1">
            <div className="aspect-square bg-ink/5 overflow-hidden rounded-full border-4 border-paper shadow-xl max-w-[260px] mx-auto">
              <img
                src={profile?.avatar_url || 'https://picsum.photos/seed/artist/800/800'}
                alt="Foto de semblanza"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h2 className="text-3xl font-serif">{profile?.full_name || 'Melisa'}</h2>

            <div className="space-y-4">
              <a
                href="https://instagram.com/meloowie"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-lg hover:opacity-70 transition-opacity"
              >
                <Instagram className="w-5 h-5" /> @meloowiee
              </a>

              <a
                href="mailto:mxlymendozat@gmail.com"
                className="flex items-center gap-3 text-lg hover:opacity-70 transition-opacity"
              >
                <Mail className="w-5 h-5" /> mxlymendozat@gmail.com
              </a>

              <a
                href="mailto:me404086@uaeh.edu.mx"
                className="flex items-center gap-3 text-lg hover:opacity-70 transition-opacity"
              >
                <Mail className="w-5 h-5" /> me404086@uaeh.edu.mx
              </a>

              <a
                href="https://github.com/ma472168"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-lg hover:opacity-70 transition-opacity"
              >
                <Github className="w-5 h-5" /> github.com/ma472168
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
