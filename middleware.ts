import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./lib/session";

const publicRoutes = ['/', '/forgot', '/reset'];

export default async function middleware(req:NextRequest){
    const path = req.nextUrl.pathname;
    const isProtectedRoute = path.startsWith('/dashboard');
    const isPublicRoute = publicRoutes.includes(path);
    const session = await getSession();

    if(isProtectedRoute && !session){
        return NextResponse.redirect(new URL('/', req.nextUrl));
    }
    else if(isPublicRoute && session){
        return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)']
}