import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, checkClaimsAgainstDb, verifySessionToken } from "./lib/auth/sessionToken";

const publicRoutes = ['/', '/forgot', '/reset-password'];

export default async function proxy(req:NextRequest){
    const path = req.nextUrl.pathname;
    const isProtectedRoute = path.startsWith('/dashboard');
    const isPublicRoute = publicRoutes.includes(path);

    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const claims = await verifySessionToken(token);
    // One session per user: a cookie whose session id is no longer the user's
    // current one (they signed in elsewhere) counts as signed out.
    const status = claims ? await checkClaimsAgainstDb(claims) : 'none';
    const signedIn = status === 'active';

    if(isProtectedRoute && !signedIn){
        const url = new URL('/', req.nextUrl);
        if(status === 'replaced') url.searchParams.set('signedOut', 'elsewhere');
        const res = NextResponse.redirect(url);
        if(token) res.cookies.delete(SESSION_COOKIE);
        return res;
    }
    if(isPublicRoute && signedIn){
        return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }

    const res = NextResponse.next();
    // Drop a dead cookie so it isn't re-checked on every request.
    if(token && !signedIn) res.cookies.delete(SESSION_COOKIE);
    return res;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.ico$).*)']
}
