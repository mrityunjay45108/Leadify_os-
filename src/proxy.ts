import { UserRole } from '@prisma/client'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes accessible by role
const roleRoutes: Record<string, UserRole[]> = {
  '/dashboard':  ['OWNER', 'ADMIN', 'EMPLOYEE'],
  '/clients':    ['OWNER', 'ADMIN', 'EMPLOYEE'],
  '/orders':     ['OWNER', 'ADMIN', 'EMPLOYEE'],
  '/scripts':    ['OWNER', 'ADMIN', 'EMPLOYEE'],
  '/creators':   ['OWNER', 'ADMIN', 'EMPLOYEE'],
  '/shoots':     ['OWNER', 'ADMIN', 'EMPLOYEE'],
  '/videos':     ['OWNER', 'ADMIN', 'EMPLOYEE'],
  '/tasks':      ['OWNER', 'ADMIN', 'EMPLOYEE'],
  '/financials': ['OWNER', 'ADMIN'],
  '/employees':  ['OWNER', 'ADMIN'],
  '/reports':    ['OWNER', 'ADMIN'],
  '/settings':   ['OWNER'],
  '/portal':     ['CLIENT'],
}

export default auth((req: NextRequest & { auth: { user: { role: UserRole } } | null }) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Public routes
  if (pathname === '/login' || pathname === '/') {
    if (session?.user) {
      const redirectPath = session.user.role === 'CLIENT' ? '/portal' : '/dashboard'
      return NextResponse.redirect(new URL(redirectPath, req.url))
    }
    return NextResponse.next()
  }

  // Unauthenticated — send to login
  if (!session?.user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const userRole = session.user.role

  // Check route permissions
  for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(userRole)) {
        const fallback = userRole === 'CLIENT' ? '/portal' : '/dashboard'
        return NextResponse.redirect(new URL(fallback, req.url))
      }
      break
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
