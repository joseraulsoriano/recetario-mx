// Comentado temporalmente para desarrollo
/*
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Si el usuario no está autenticado, redirigir a la página de inicio de sesión
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Rutas que requieren autenticación
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/recipes/:path*',
    '/ingredients/:path*',
    '/meal-plans/:path*',
    '/profile/:path*',
  ],
};
*/

// Middleware temporal que permite acceso a todas las rutas
export function middleware() {}
export const config = {
  matcher: []
}; 