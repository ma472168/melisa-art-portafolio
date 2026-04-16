export type Discipline = 'grabado' | 'pintura' | 'fotografia' | 'dibujo';

export interface Artwork {
  id: string;
  title: string;
  description: string;
  image_url: string;
  discipline?: Discipline;
  medium: string;
  dimensions: string;
  year: string;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  bio: string;
  email: string;
  avatar_url?: string;
}
