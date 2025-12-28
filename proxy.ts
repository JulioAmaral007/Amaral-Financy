import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    },
  );

  // Refresh session if expired - important for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  // Define protected and public routes
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                      request.nextUrl.pathname.startsWith('/register')
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                           request.nextUrl.pathname.startsWith('/transactions') ||
                           request.nextUrl.pathname.startsWith('/categories') ||
                           request.nextUrl.pathname.startsWith('/profile')

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
