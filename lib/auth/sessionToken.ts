// Server-only session primitives.
//
// Deliberately NOT a 'use server' module: nothing exported here may become a
// client-callable Server Action. Signing a token must only ever happen on the
// server, for a user the server has just authenticated.
import { randomUUID } from "crypto";
import { jwtVerify, SignJWT, JWTPayload } from "jose";
import { cookies } from "next/headers";
import { isValidObjectId } from "mongoose";
import { ISession } from "@/types/Types";
import { connectDB } from "../mongoose";
import User from "../models/user.model";

export const SESSION_COOKIE = "session";
const DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const key = new TextEncoder().encode(process.env.JWT_SECRET!);

/** What the cookie carries: the public session plus the session id (`sid`). */
export type SessionClaims = ISession & { sid: string };

/**
 * - `active`   – cookie is valid and is the user's current session
 * - `replaced` – the user has since signed in elsewhere (or was signed out everywhere)
 * - `none`     – no cookie, bad/expired signature, unknown user, or pre-sid token
 */
export type SessionStatus = "active" | "replaced" | "none";

export async function signSessionToken(claims: SessionClaims, expires: Date): Promise<string> {
  return new SignJWT({ ...claims, expires: expires.toISOString() } as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expires.getTime() / 1000))
    .sign(key);
}

export async function verifySessionToken(token: string | undefined): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload as unknown as SessionClaims;
  } catch {
    return null;
  }
}

/** Compare the token's session id with the one stored for the user. */
export async function checkClaimsAgainstDb(claims: SessionClaims | null): Promise<SessionStatus> {
  if (!claims?._id || !isValidObjectId(claims._id)) return "none";
  // Tokens issued before single-session enforcement have no sid: sign in again.
  if (!claims.sid) return "none";
  await connectDB();
  const user = await User.findById(claims._id).select("+activeSessionId").lean<{ activeSessionId?: string | null }>();
  if (!user) return "none";
  return user.activeSessionId === claims.sid ? "active" : "replaced";
}

export const toPublicSession = (claims: SessionClaims): ISession => ({
  _id: claims._id,
  name: claims.name,
  email: claims.email,
  org: claims.org,
  photo: claims.photo,
  expires: claims.expires,
});

async function writeCookie(token: string, expires: Date) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    expires,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

/**
 * Start a brand-new session for an authenticated user. Rotating
 * `activeSessionId` immediately invalidates every other browser's cookie.
 * Only call this after the server has verified the user's credentials.
 */
export async function issueSession(user: ISession): Promise<void> {
  const sid = randomUUID();
  await connectDB();
  await User.updateOne({ _id: user._id }, { activeSessionId: sid });
  const expires = new Date(Date.now() + DURATION_MS);
  await writeCookie(await signSessionToken({ ...user, sid }, expires), expires);
}

/** Re-sign the current session (same sid) with fresh profile data. */
export async function reissueSession(claims: SessionClaims, fresh: ISession): Promise<void> {
  const expires = new Date(Date.now() + DURATION_MS);
  await writeCookie(await signSessionToken({ ...fresh, sid: claims.sid }, expires), expires);
}

/** Sign the user out on every browser (e.g. after a password reset). */
export async function revokeAllSessions(userId: string): Promise<void> {
  await connectDB();
  await User.updateOne({ _id: userId }, { activeSessionId: randomUUID() });
}
