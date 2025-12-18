import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Rotas públicas (não requerem autenticação)
  const publicRoutes = ['/login', '/esqueci-senha', '/reset-senha'];
  const isPublicRoute = publicRoutes.some(route => 
    req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith('/reset-senha/')
  );

  if (isPublicRoute) {
    // Se já está logado e está tentando acessar login/esqueci-senha, redireciona
    if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/esqueci-senha')) {
      return NextResponse.redirect(new URL('/organograma', req.url));
    }
    return response;
  }

  // Rotas protegidas
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Rota de usuários só para MASTER
  if (req.nextUrl.pathname.startsWith('/usuarios')) {
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (user?.role !== 'master') {
      return NextResponse.redirect(new URL('/organograma', req.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

