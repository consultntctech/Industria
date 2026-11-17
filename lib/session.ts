'use server'

// Client-callable session actions. Every export here only reads or ends the
// caller's *own* session. Issuing sessions lives in lib/auth/sessionToken.ts,
// which is not a Server Action module and cannot be called from the browser.
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ISession } from '@/types/Types';
import { connectDB } from './mongoose';
import User from './models/user.model';
import {
    SESSION_COOKIE,
    SessionStatus,
    checkClaimsAgainstDb,
    reissueSession,
    toPublicSession,
    verifySessionToken,
} from './auth/sessionToken';

/** Verified claims + their status, computed once per request. */
const readSession = cache(async () => {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    const claims = await verifySessionToken(token);
    const status: SessionStatus = claims ? await checkClaimsAgainstDb(claims) : 'none';
    return { claims, status };
});

/**
 * The signed-in user, or null. Returns null when this browser's session has
 * been replaced by a newer sign-in elsewhere.
 */
export async function getSession(): Promise<ISession | null> {
    const { claims, status } = await readSession();
    if (!claims || status !== 'active') return null;
    return toPublicSession(claims);
}

/**
 * Polled by the dashboard so a browser learns quickly that it was signed out
 * (another sign-in replaced it). Clears the dead cookie when it was.
 */
export async function checkSessionStatus(): Promise<{ status: SessionStatus }> {
    const { status } = await readSession();
    if (status !== 'active') {
        const store = await cookies();
        if (store.get(SESSION_COOKIE)) store.delete(SESSION_COOKIE);
    }
    return { status };
}

/** Re-sign the current session with the user's latest name/photo from the DB. */
export async function refreshSession(): Promise<ISession | null> {
    const { claims, status } = await readSession();
    if (!claims || status !== 'active') return null;
    await connectDB();
    const user = await User.findById(claims._id).select('name email photo org').lean<{
        _id: unknown; name: string; email: string; photo?: string; org: unknown;
    }>();
    if (!user) return null;
    const fresh: ISession = {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        photo: user.photo ?? '',
        org: String(user.org),
    };
    await reissueSession(claims, fresh);
    return fresh;
}

export async function destroySession() {
    const { claims, status } = await readSession();
    // Ending the current session also invalidates its token server-side.
    if (claims && status === 'active') {
        await connectDB();
        await User.updateOne(
            { _id: claims._id, activeSessionId: claims.sid },
            { activeSessionId: null },
        );
    }
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
    redirect('/');
}
