import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Artwork, Discipline } from '@/src/types';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';

const FEATURED_ROTATION_MS = 4500;
const FEATURED_FADE_MS = 700;

type HomeProps = {
  onFooterVisibilityChange?: (visible: boolean) => void;
};

type GallerySortOption = 'recent' | 'year' | 'alphabetical';
type DisciplineFilterOption = 'all' | Discipline;

const DISCIPLINE_OPTIONS: { value: DisciplineFilterOption; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'grabado', label: 'Grabado' },
  { value: 'pintura', label: 'Pintura' },
  { value: 'fotografia', label: 'Fotografia' },
  { value: 'dibujo', label: 'Dibujo' },
];

function pickRandomArtwork(artworks: Artwork[], currentId?: string) {
  if (artworks.length === 0) return null;
  if (artworks.length === 1) return artworks[0];

  let nextArtwork = artworks[Math.floor(Math.random() * artworks.length)];
  while (nextArtwork.id === currentId) {
    nextArtwork = artworks[Math.floor(Math.random() * artworks.length)];
  }

  return nextArtwork;
}

export default function Home({ onFooterVisibilityChange }: HomeProps) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [featuredArtwork, setFeaturedArtwork] = useState<Artwork | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState<GallerySortOption>('recent');
  const [disciplineFilter, setDisciplineFilter] = useState<DisciplineFilterOption>('all');

  const visibleArtworks = useMemo(() => {
    const list = [...artworks];

    if (sortOption === 'alphabetical') {
      return list.sort((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }));
    }

    if (sortOption === 'year') {
      return list.sort((a, b) => {
        const yearA = Number.parseInt(a.year, 10);
        const yearB = Number.parseInt(b.year, 10);
        const safeYearA = Number.isNaN(yearA) ? Number.MIN_SAFE_INTEGER : yearA;
        const safeYearB = Number.isNaN(yearB) ? Number.MIN_SAFE_INTEGER : yearB;

        if (safeYearA !== safeYearB) {
          return safeYearB - safeYearA;
        }

        return a.title.localeCompare(b.title, 'es', { sensitivity: 'base' });
      });
    }

    const sorted = list.sort((a, b) => {
      const recentA = new Date(a.created_at).getTime();
      const recentB = new Date(b.created_at).getTime();
      return recentB - recentA;
    });

    if (disciplineFilter === 'all') {
      return sorted;
    }

    return sorted.filter((artwork) => artwork.discipline === disciplineFilter);
  }, [artworks, sortOption, disciplineFilter]);

  useEffect(() => {
    async function fetchArtworks() {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching artworks:', error);
      } else {
        const fetchedArtworks = data || [];
        setArtworks(fetchedArtworks);
        setFeaturedArtwork(pickRandomArtwork(fetchedArtworks));
      }
      setLoading(false);
    }

    fetchArtworks();
  }, []);

  const handleEnterGallery = () => {
    setShowGallery(true);
  };

  useEffect(() => {
    if (showGallery || artworks.length < 2 || !featuredArtwork) return;

    let cancelled = false;

    const timeoutId = window.setTimeout(() => {
      const nextArtwork = pickRandomArtwork(artworks, featuredArtwork.id);
      if (!nextArtwork) return;

      const preloadedImage = new window.Image();
      preloadedImage.src = nextArtwork.image_url;

      const commitNextArtwork = () => {
        if (!cancelled) {
          setFeaturedArtwork(nextArtwork);
        }
      };

      preloadedImage.onload = commitNextArtwork;
      preloadedImage.onerror = commitNextArtwork;
    }, FEATURED_ROTATION_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [artworks, featuredArtwork, showGallery]);

  useEffect(() => {
    if (!onFooterVisibilityChange) return;

    onFooterVisibilityChange(showGallery || !featuredArtwork);

    return () => {
      onFooterVisibilityChange(true);
    };
  }, [featuredArtwork, onFooterVisibilityChange, showGallery]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse font-serif text-xl italic">Cargando galería...</div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {featuredArtwork && !showGallery && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative min-h-[88vh] md:min-h-screen overflow-hidden cursor-pointer"
          onClick={handleEnterGallery}
        >
          <AnimatePresence mode="sync" initial={false}>
            <motion.img
              key={featuredArtwork.id}
              src={featuredArtwork.image_url}
              alt={featuredArtwork.title}
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.08, x: 0, y: 0 }}
              animate={{ opacity: 1, scale: 1.16, x: -18, y: -10 }}
              exit={{ opacity: 0, scale: 1.12 }}
              transition={{
                opacity: { duration: FEATURED_FADE_MS / 1000, ease: 'easeInOut' },
                scale: { duration: FEATURED_ROTATION_MS / 1000, ease: 'linear' },
                x: { duration: FEATURED_ROTATION_MS / 1000, ease: 'linear' },
                y: { duration: FEATURED_ROTATION_MS / 1000, ease: 'linear' },
              }}
              loading="eager"
              fetchPriority="high"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-b from-ink/35 via-ink/35 to-ink/70" />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="relative z-10 min-h-[88vh] md:min-h-screen flex flex-col items-center justify-center text-center px-6"
          >
            <p className="text-paper/80 uppercase tracking-[0.35em] text-[10px] sm:text-xs mb-5">Obra destacada</p>
            <AnimatePresence mode="wait">
              <motion.h1
                key={featuredArtwork.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="text-paper text-4xl sm:text-6xl md:text-7xl font-serif mb-6 max-w-5xl leading-tight"
              >
                {featuredArtwork.title}
              </motion.h1>
            </AnimatePresence>
            <p className="text-paper/90 text-sm sm:text-base uppercase tracking-[0.25em] border border-paper/40 px-6 py-3 backdrop-blur-sm">
              Haz click para ver la galeria
            </p>
          </motion.div>
        </motion.section>
      )}

      {(!featuredArtwork || showGallery) && (
        <div className="pt-32 px-6 max-w-7xl mx-auto">
          <div className="mb-10 flex flex-col gap-4">
            <p className="text-muted uppercase tracking-[0.25em] text-[10px]">Disciplina</p>
            <div className="flex flex-wrap gap-3">
              {DISCIPLINE_OPTIONS.map((option) => {
                const isActive = option.value === disciplineFilter;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDisciplineFilter(option.value)}
                    className={`px-6 py-3 text-xs uppercase tracking-[0.2em] border transition-colors ${
                      isActive
                        ? 'bg-ink text-paper border-ink'
                        : 'bg-paper text-ink border-ink/20 hover:border-ink/40'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

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
              Obras Seleccionadas - Melisa
            </motion.p>
          </header>

          {artworks.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-ink/10 rounded-lg">
              <p className="text-muted italic">Aún no hay obras en la galería.</p>
            </div>
          ) : visibleArtworks.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-ink/10 rounded-lg">
              <p className="text-muted italic">No hay obras cargadas para esta disciplina.</p>
            </div>
          ) : (
            <>
              <div className="mb-8 flex justify-end">
                <label className="text-xs uppercase tracking-[0.2em] text-muted flex items-center gap-3">
                  Ordenar por
                  <select
                    value={sortOption}
                    onChange={(event) => setSortOption(event.target.value as GallerySortOption)}
                    className="bg-paper border border-ink/15 px-3 py-2 text-xs uppercase tracking-[0.12em] text-ink outline-none focus:border-ink/40"
                    aria-label="Ordenar galería"
                  >
                    <option value="recent">Añadido recientemente</option>
                    <option value="year">Por año</option>
                    <option value="alphabetical">Orden alfabético</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 md:gap-12">
                {visibleArtworks.map((artwork, index) => (
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
                      <p className="text-muted text-xs md:text-sm italic line-clamp-1">
                        {artwork.discipline ? `${artwork.discipline} - ` : ''}
                        {artwork.medium}, {artwork.year}
                      </p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
