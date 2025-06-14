# Recetario MX 🍳

Recetario MX es una aplicación web moderna para compartir y descubrir recetas tradicionales mexicanas. Desarrollada con tecnologías modernas, esta plataforma permite a los usuarios explorar, compartir y guardar sus recetas favoritas de la gastronomía mexicana.

## Características Principales 🌟

- 📱 Interfaz moderna y responsive
- 🔍 Búsqueda y filtrado de recetas
- 📍 Integración con mapas para ubicar ingredientes y restaurantes
- 📝 Sistema de recetas paso a paso
- 🖼️ Soporte para imágenes de alta calidad
- 🔐 Autenticación de usuarios

## Tecnologías Utilizadas 🛠️

- [Next.js](https://nextjs.org/) - Framework de React para aplicaciones web
- [TypeScript](https://www.typescriptlang.org/) - Superset tipado de JavaScript
- [Prisma](https://www.prisma.io/) - ORM moderno para base de datos
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utility-first
- [Google Maps API](https://developers.google.com/maps) - Integración de mapas

## Requisitos Previos 📋

- Node.js 18.x o superior
- npm o yarn
- Base de datos PostgreSQL

## Instalación 🚀

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/recetario-mx.git
cd recetario-mx
```

2. Instala las dependencias:
```bash
npm install
# o
yarn install
```

3. Configura las variables de entorno:
   - Crea un archivo `.env` basado en `.env.example`
   - Añade las variables necesarias (API keys, etc.)

4. Inicia el servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## Estructura del Proyecto 📁

```
recetario-mx/
├── src/              # Código fuente principal
├── prisma/          # Esquemas y migraciones de la base de datos
├── public/          # Archivos estáticos
├── scripts/         # Scripts de utilidad
└── ...
```

## Contribuir 🤝

Las contribuciones son bienvenidas. Por favor, lee nuestras guías de contribución antes de enviar un pull request.

## Licencia 📄

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
