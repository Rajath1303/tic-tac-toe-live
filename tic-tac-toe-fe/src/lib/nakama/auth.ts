import { Session } from "@heroiclabs/nakama-js";
import { getClient } from "./client";

const SESSION_KEY = "nakama_session";

export async function authenticateDevice(
    deviceId: string,
    username: string
): Promise<Session> {
    const session = await getClient().authenticateDevice(deviceId, true, username);
    if (typeof window !== "undefined") {
        localStorage.setItem(
            SESSION_KEY,
            JSON.stringify({
                token: session.token,
                refresh_token: session.refresh_token,
            })
        );
    }
    return session;
}

export async function restoreSession(): Promise<Session | null> {
    if (typeof window === "undefined") return null;

    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const session = Session.restore(parsed.token, parsed.refresh_token);

    if (session.isexpired(Date.now() / 1000)) {
        try {
            const refreshed = await getClient().sessionRefresh(session);
            localStorage.setItem(
                SESSION_KEY,
                JSON.stringify({
                    token: refreshed.token,
                    refresh_token: refreshed.refresh_token,
                })
            );
            return refreshed;
        } catch {
            localStorage.removeItem(SESSION_KEY);
            return null;
        }
    }

    return session;
}

export function clearSession() {
    if (typeof window !== "undefined") {
        localStorage.removeItem(SESSION_KEY);
    }
}