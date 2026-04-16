<h1 align="center">Melisa Art Portfolio</h1>

<p align="center">
  Portafolio digital de proyectos artisticos para exhibicion, curaduria y gestion de obra.
</p>

<p align="center">
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-1f2937?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.x-1f2937?style=for-the-badge&logo=typescript&logoColor=3178C6" alt="TypeScript" /></a>
  <a href="https://vite.dev"><img src="https://img.shields.io/badge/Vite-6-1f2937?style=for-the-badge&logo=vite&logoColor=646CFF" alt="Vite 6" /></a>
  <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Postgres%20%2B%20Storage-1f2937?style=for-the-badge&logo=supabase&logoColor=3ECF8E" alt="Supabase" /></a>
  <a href="https://vercel.com"><img src="https://img.shields.io/badge/Deploy-Vercel-1f2937?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/last-commit/ma472168/melisa-art-portafolio?style=flat-square&color=334155" alt="Last commit" />
  <img src="https://img.shields.io/github/languages/top/ma472168/melisa-art-portafolio?style=flat-square&color=334155" alt="Top language" />
  <img src="https://img.shields.io/github/repo-size/ma472168/melisa-art-portafolio?style=flat-square&color=334155" alt="Repo size" />
</p>

## TL;DR

- Galeria artistica inmersiva con intro animada por disciplina.
- Dashboard para administracion de obra y perfil.
- Infraestructura cloud: frontend en Vercel, datos y storage en Supabase.
- Stack moderno y mantenible con React + TypeScript + Vite.

## Vision del proyecto

Este sitio fue disenado como una galeria digital contemporanea con foco en:

- Curaduria visual de obra artistica.
- Navegacion editorial por disciplina.
- Escalabilidad para nuevas piezas y nuevas categorias.
- Publicacion rapida en web con stack moderno.

## Caracteristicas principales

- Home inmersivo con obra destacada rotativa.
- Intro animada para elegir disciplina antes de entrar al portafolio.
- Filtros de galeria por:
  - Aniadido recientemente.
  - Anio.
  - Orden alfabetico.
  - Disciplina (grabado, pintura, fotografia, dibujo).
- Vista de detalle por obra con zoom y contacto directo por email.
- Dashboard privado para crear, editar y eliminar obras.
- Edicion de semblanza/perfil de artista.
- Carga de imagenes y consumo de datos desde Supabase.

## Stack tecnologico

### Frontend

- React 19
- TypeScript
- Vite 6
- React Router
- Tailwind CSS 4
- Motion (animaciones)
- Lucide React (iconos)

### Backend y datos

- Supabase (PostgreSQL + Auth + Storage)
- @supabase/supabase-js

### Deploy

- Vercel (frontend)
- Supabase (infra de datos)

## Arquitectura del proyecto

```text
src/
  components/
    Navbar.tsx
  lib/
    supabase.ts
    utils.ts
  pages/
    Home.tsx
    ArtworkDetail.tsx
    Dashboard.tsx
    Login.tsx
    Semblanza.tsx
    Contacto.tsx
  App.tsx
  main.tsx
  types.ts
```

## Estadisticas del proyecto

Medicion tomada sobre el repositorio (excluyendo node_modules, dist y .git).

### Estructura

- Archivos totales: 25
- Archivos en src: 13
- Modulos TS/TSX: 12
- Paginas: 6
- Componentes: 1
- Archivos de libreria interna: 2
- Rutas de aplicacion: 6

### Lineas por lenguaje

- TypeScript (.ts): 57
- TSX (.tsx): 1315
- CSS (.css): 42
- HTML (.html): 16

Total aproximado de codigo de aplicacion (TS + TSX + CSS + HTML): **1430 lineas**.

### Archivos de mayor tamano (top)

1. src/pages/Dashboard.tsx - 441 lineas
2. src/pages/Home.tsx - 384 lineas
3. src/pages/ArtworkDetail.tsx - 102 lineas
4. src/pages/Contacto.tsx - 84 lineas
5. src/components/Navbar.tsx - 77 lineas

## Variables de entorno

Crea un archivo `.env` en la raiz con:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## Instalacion y ejecucion local

```bash
npm install
npm run dev
```

App local:

- http://localhost:3000

## Scripts disponibles

```bash
npm run dev      # entorno local
npm run build    # build de produccion
npm run preview  # preview de build
npm run lint     # chequeo typescript (tsc --noEmit)
```

## Modelo de datos (resumen)

Tabla principal esperada: `artworks`

Campos usados en frontend:

- id
- title
- description
- image_url
- discipline (grabado | pintura | fotografia | dibujo)
- medium
- dimensions
- year
- created_at

Tabla de perfil:

- profiles (full_name, bio, email, avatar_url)

## Deploy recomendado

### Vercel

1. Importar repositorio en Vercel.
2. Configurar variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
3. Deploy automatico desde rama main.

### Supabase

1. Crear proyecto.
2. Crear tablas `artworks` y `profiles`.
3. Configurar politicas RLS segun permisos de lectura/escritura deseados.
4. Crear bucket para imagenes (por defecto `artworks`).

## Roadmap sugerido

- Tests de integracion para dashboard y filtros.
- Optimizacion de imagenes y analisis de bundle.
- Analytics de visitas por disciplina.
- Internacionalizacion ES/EN.

## Autor

Desarrollo y programacion por xenredda.

---
