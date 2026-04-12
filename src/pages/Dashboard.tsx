import React, { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Artwork, Profile } from '@/src/types';
import { motion } from 'motion/react';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

export default function Dashboard() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingArtwork, setEditingArtwork] = useState<Partial<Artwork> | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const artworkBucket = import.meta.env.VITE_SUPABASE_ARTWORKS_BUCKET || 'artworks';

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: artworksData } = await supabase.from('artworks').select('*').order('created_at', { ascending: false });
    const { data: profileData } = await supabase.from('profiles').select('*').limit(1).single();
    
    if (artworksData) setArtworks(artworksData);
    if (profileData) setProfile(profileData);
    setLoading(false);
  }

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
  };

  const uploadArtworkImage = async (file: File): Promise<string> => {
    const userResult = await supabase.auth.getUser();
    const userId = userResult.data.user?.id || 'public';
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(artworkBucket)
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type || 'application/octet-stream',
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(artworkBucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSaveArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArtwork) return;

    setIsUploadingImage(true);

    try {
      let imageUrl = editingArtwork.image_url || '';
      if (imageFile) {
        imageUrl = await uploadArtworkImage(imageFile);
      }

      if (!imageUrl) {
        alert('Debes subir una imagen o agregar una URL.');
        setIsUploadingImage(false);
        return;
      }

      const artworkToSave = {
        ...editingArtwork,
        image_url: imageUrl,
        created_at: editingArtwork.id ? editingArtwork.created_at : new Date().toISOString(),
      };

      let error;
      if (editingArtwork.id) {
        const { error: err } = await supabase.from('artworks').update(artworkToSave).eq('id', editingArtwork.id);
        error = err;
      } else {
        const { error: err } = await supabase.from('artworks').insert([artworkToSave]);
        error = err;
      }

      if (error) {
        alert('Error guardando obra: ' + error.message);
      } else {
        setEditingArtwork(null);
        setImageFile(null);
        fetchData();
      }
    } catch (error: any) {
      alert('Error subiendo imagen: ' + (error?.message || 'Error desconocido'));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteArtwork = async (id: string) => {
    if (!confirm('¿Estás segura de que quieres eliminar esta obra?')) return;
    const { error } = await supabase.from('artworks').delete().eq('id', id);
    if (error) alert('Error eliminando obra: ' + error.message);
    else fetchData();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const { error } = await supabase.from('profiles').update(profile).eq('id', profile.id);
    if (error) {
      alert('Error guardando perfil: ' + error.message);
    } else {
      setIsEditingProfile(false);
      fetchData();
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center italic font-serif">Cargando dashboard...</div>;

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-2">Dashboard</h1>
          <p className="text-muted uppercase tracking-widest text-xs">Gestiona tu portafolio y semblanza</p>
        </div>
        <button
          onClick={() => {
            setImageFile(null);
            setEditingArtwork({ title: '', description: '', image_url: '', medium: '', dimensions: '', year: new Date().getFullYear().toString() });
          }}
          className="inline-flex items-center px-6 py-3 bg-ink text-paper uppercase tracking-widest text-xs hover:bg-ink/90 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" /> Nueva Obra
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Profile Section */}
        <div className="lg:col-span-1">
          <div className="glass p-8 sticky top-32">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-serif">Tu Semblanza</h2>
              <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="text-muted hover:text-ink transition-colors">
                {isEditingProfile ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              </button>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={profile?.full_name || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                    className="w-full bg-paper/50 border border-ink/10 p-2 text-sm focus:border-ink outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted mb-1">Email de Contacto</label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="w-full bg-paper/50 border border-ink/10 p-2 text-sm focus:border-ink outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted mb-1">URL Avatar</label>
                  <input
                    type="text"
                    value={profile?.avatar_url || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, avatar_url: e.target.value } : null)}
                    className="w-full bg-paper/50 border border-ink/10 p-2 text-sm focus:border-ink outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-muted mb-1">Biografía</label>
                  <textarea
                    rows={8}
                    value={profile?.bio || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                    className="w-full bg-paper/50 border border-ink/10 p-2 text-sm focus:border-ink outline-none resize-none"
                  />
                </div>
                <button type="submit" className="w-full bg-ink text-paper py-3 uppercase tracking-widest text-[10px] hover:bg-ink/90 transition-colors">
                  Guardar Cambios
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="aspect-square bg-ink/5 overflow-hidden rounded-full mb-6">
                  <img src={profile?.avatar_url || 'https://picsum.photos/seed/artist/400/400'} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <h3 className="text-lg font-serif">{profile?.full_name || 'Melisa'}</h3>
                <p className="text-sm text-muted line-clamp-4 italic">{profile?.bio || 'Sin biografía.'}</p>
                <p className="text-xs tracking-widest uppercase text-muted">{profile?.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Artworks List Section */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-serif mb-8">Tus Obras ({artworks.length})</h2>
          <div className="space-y-4">
            {artworks.map((artwork) => (
              <div key={artwork.id} className="glass p-3 md:p-4 flex items-center gap-3 md:gap-6 group">
                <div className="w-14 h-14 md:w-20 md:h-20 bg-ink/5 overflow-hidden flex-shrink-0">
                  <img src={artwork.image_url} alt={artwork.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-serif text-base md:text-lg line-clamp-1">{artwork.title}</h3>
                  <p className="text-[10px] md:text-xs text-muted uppercase tracking-widest line-clamp-1">{artwork.medium}, {artwork.year}</p>
                </div>
                <div className="flex items-center gap-1 md:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setEditingArtwork(artwork);
                    }}
                    className="p-1.5 md:p-2 hover:bg-ink/5 rounded-full transition-colors text-muted hover:text-ink"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteArtwork(artwork.id)} className="p-1.5 md:p-2 hover:bg-red-50 rounded-full transition-colors text-muted hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Artwork Modal */}
      {editingArtwork && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-ink/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-paper w-full max-w-2xl max-h-[90vh] overflow-y-auto p-10 shadow-2xl relative"
          >
            <button
              onClick={() => {
                setImageFile(null);
                setEditingArtwork(null);
              }}
              className="absolute top-6 right-6 text-muted hover:text-ink"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-3xl font-serif mb-8">{editingArtwork.id ? 'Editar Obra' : 'Nueva Obra'}</h2>
            
            <form onSubmit={handleSaveArtwork} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase tracking-widest text-muted mb-2">Título</label>
                <input
                  type="text"
                  required
                  value={editingArtwork.title || ''}
                  onChange={(e) => setEditingArtwork({ ...editingArtwork, title: e.target.value })}
                  className="w-full border-b border-ink/20 py-2 focus:border-ink outline-none transition-colors"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase tracking-widest text-muted mb-2">Imagen</label>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="w-full text-sm"
                  />
                  <p className="text-[10px] uppercase tracking-widest text-muted">O pega una URL manual</p>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={editingArtwork.image_url || ''}
                      onChange={(e) => setEditingArtwork({ ...editingArtwork, image_url: e.target.value })}
                      className="flex-grow border-b border-ink/20 py-2 focus:border-ink outline-none transition-colors"
                      placeholder="https://..."
                    />
                    {editingArtwork.image_url && (
                      <div className="w-12 h-12 bg-ink/5 border border-ink/10 overflow-hidden">
                        <img src={editingArtwork.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted mb-2">Técnica / Medio</label>
                <input
                  type="text"
                  required
                  value={editingArtwork.medium || ''}
                  onChange={(e) => setEditingArtwork({ ...editingArtwork, medium: e.target.value })}
                  className="w-full border-b border-ink/20 py-2 focus:border-ink outline-none transition-colors"
                  placeholder="Óleo sobre lienzo"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted mb-2">Dimensiones</label>
                <input
                  type="text"
                  required
                  value={editingArtwork.dimensions || ''}
                  onChange={(e) => setEditingArtwork({ ...editingArtwork, dimensions: e.target.value })}
                  className="w-full border-b border-ink/20 py-2 focus:border-ink outline-none transition-colors"
                  placeholder="100 x 80 cm"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-muted mb-2">Año</label>
                <input
                  type="text"
                  required
                  value={editingArtwork.year || ''}
                  onChange={(e) => setEditingArtwork({ ...editingArtwork, year: e.target.value })}
                  className="w-full border-b border-ink/20 py-2 focus:border-ink outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase tracking-widest text-muted mb-2">Descripción</label>
                <textarea
                  rows={4}
                  value={editingArtwork.description || ''}
                  onChange={(e) => setEditingArtwork({ ...editingArtwork, description: e.target.value })}
                  className="w-full border border-ink/10 p-4 focus:border-ink outline-none transition-colors resize-none"
                />
              </div>

              <div className="md:col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={isUploadingImage}
                  className="w-full bg-ink text-paper py-4 uppercase tracking-widest text-xs hover:bg-ink/90 transition-colors disabled:opacity-60"
                >
                  {isUploadingImage ? 'Subiendo imagen...' : editingArtwork.id ? 'Actualizar Obra' : 'Publicar Obra'}
                </button>
                {editingArtwork.id && (
                  <button
                    type="button"
                    onClick={async () => {
                      await handleDeleteArtwork(editingArtwork.id as string);
                      setImageFile(null);
                      setEditingArtwork(null);
                    }}
                    className="w-full mt-3 border border-red-300 text-red-600 py-3 uppercase tracking-widest text-xs hover:bg-red-50 transition-colors"
                  >
                    Eliminar Obra
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
