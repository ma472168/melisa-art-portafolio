import React, { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Artwork } from '@/src/types';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArtworks() {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching artworks:', error);
      } else {
        setArtworks(data || []);
      }
      setLoading(false);
    }

    fetchArtworks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse font-serif text-xl italic">Cargando galería...</div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <header className="mb-20 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-serif mb-6"
        >
          Portafolio
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted uppercase tracking-[0.3em] text-xs"
        >
          Obras Seleccionadas — Melisa
        </motion.p>
      </header>

      {artworks.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-ink/10 rounded-lg">
          <p className="text-muted italic">Aún no hay obras en la galería.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 md:gap-12">
          {artworks.map((artwork, index) => (
            <motion.div
              key={artwork.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <Link to={`/artwork/${artwork.id}`}>
                <div className="aspect-[2/3] md:aspect-[3/4] overflow-hidden bg-ink/5 mb-3 md:mb-6 relative">
                  <img
                    src={artwork.image_url}
                    alt={artwork.title}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-ink/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <span className="text-white uppercase tracking-widest text-xs border border-white/40 px-4 py-2">Ver Detalles</span>
                  </div>
                </div>
                <h3 className="text-base md:text-xl font-serif mb-1 line-clamp-1">{artwork.title}</h3>
                <p className="text-muted text-xs md:text-sm italic line-clamp-1">{artwork.medium}, {artwork.year}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
