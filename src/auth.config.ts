import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');

      if (isOnAdmin) {
        if (!isLoggedIn) return false;
        // Permite o acesso e deixa o layout validar a role específica
        return true; 
      }

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // If logged in and on login page, redirect to dashboard
        if (nextUrl.pathname === '/login') {
             // Verificar role para redirecionar corretamente?
             // Por padrão vai pro dashboard, mas o usuário admin pode navegar pro /admin depois.
             return Response.redirect(new URL('/dashboard', nextUrl));
        }
      }
      return true;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig
