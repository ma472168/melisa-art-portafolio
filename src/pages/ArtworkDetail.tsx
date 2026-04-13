import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/src/lib/supabase';
import { Artwork, Profile } from '@/src/types';
import { motion } from 'motion/react';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ArtworkDetail() {
  const { id } = useParams();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    async function fetchData() {
      const { data: artworkData } = await supabase
        .from('artworks')
        .select('*')
        .eq('id', id)
        .single();

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .single();

      if (artworkData) setArtwork(artworkData);
      if (profileData) setProfile(profileData);
      setLoading(false);
    }

    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center italic font-serif">Cargando...</div>;
  if (!artwork) return <div className="min-h-screen flex items-center justify-center">Obra no encontrada.</div>;

  const contactEmail = profile?.email || 'mxlymendozat@gmail.com';
  const mailtoLink = `mailto:${contactEmail}?subject=Consulta sobre la obra: ${artwork.title}`;

  const handleImageMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <Link to="/" className="inline-flex items-center text-sm uppercase tracking-widest mb-12 hover:opacity-60 transition-opacity">
        <ArrowLeft className="w-4 h-4 mr-2" /> Volver a la galería
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-ink/5 aspect-[3/4] overflow-hidden cursor-zoom-in"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => {
            setIsZoomed(false);
            setZoomPosition({ x: 50, y: 50 });
          }}
          onMouseMove={handleImageMouseMove}
        >
          <img
            src={artwork.image_url}
            alt={artwork.title}
            className="w-full h-full object-contain"
            style={{
              transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
              transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              transition: isZoomed ? 'transform 120ms ease-out' : 'transform 260ms ease-out',
            }}
            referrerPolicy="no-referrer"
          />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col justify-center"
        >
          <h1 className="text-4xl md:text-6xl font-serif mb-4">{artwork.title}</h1>
          <p className="text-muted italic mb-8">{artwork.medium}, {artwork.year}</p>
          
          <div className="space-y-6 mb-12">
            <div>
              <h4 className="text-xs uppercase tracking-widest text-muted mb-2">Dimensiones</h4>
              <p className="text-lg">{artwork.dimensions}</p>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-widest text-muted mb-2">Descripción</h4>
              <p className="text-lg leading-relaxed text-ink/80">{artwork.description}</p>
            </div>
          </div>

          <a
            href={mailtoLink}
            className="inline-flex items-center justify-center px-8 py-4 bg-ink text-paper uppercase tracking-widest text-sm hover:bg-ink/90 transition-colors"
          >
            <Mail className="w-4 h-4 mr-3" /> Contactar para más información
          </a>
        </motion.div>
      </div>
    </div>
  );
}
