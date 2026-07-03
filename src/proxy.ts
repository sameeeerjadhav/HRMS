import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key_12345";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin, /manager, /employee
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/manager') ||
    pathname.startsWith('/employee')
  ) {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      // Use jose to verify because jsonwebtoken doesn't work in Edge Runtime
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      
      const role = payload.role as string;
      
      // Basic Role Based Access Control
      if (pathname.startsWith('/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL(`/${role}`, request.url));
      }
      if (pathname.startsWith('/manager') && role !== 'manager' && role !== 'admin') {
        return NextResponse.redirect(new URL(`/${role}`, request.url));
      }
      
      return NextResponse.next();
    } catch (err) {
      // Invalid token
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // If already logged in, prevent going to login page
  if (pathname === '/') {
    const token = request.cookies.get('auth_token')?.value;
    if (token) {
      try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jose.jwtVerify(token, secret);
        const role = payload.role as string;
        
        return NextResponse.redirect(new URL(`/${role}`, request.url));
      } catch (err) {
        return NextResponse.next();
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
