import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Read the role cookie (defaults to allowing navigation if no cookie is set yet during dev)
    const role = request.cookies.get('mealpe_role')?.value;

    if (!role) {
        return NextResponse.next();
    }

    // 1. Protect /admin routes: Only ADMIN can access
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
        const redirectUrl = role === 'STAFF' ? '/staff/scan' : '/student/schedule';
        return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // 2. Protect /staff routes: Only STAFF or ADMIN can access
    if (pathname.startsWith('/staff') && role === 'STUDENT') {
        return NextResponse.redirect(new URL('/student/schedule', request.url));
    }

    return NextResponse.next();
}

// Tell Next.js which routes this middleware should guard
export const config = {
    matcher: ['/student/:path*', '/staff/:path*', '/admin/:path*'],
};