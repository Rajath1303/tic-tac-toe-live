import { Socket, Session } from "@heroiclabs/nakama-js";
import { getClient } from "./client";

let socket: Socket | null = null;

export async function connectSocket(session: Session): Promise<Socket> {
    if (socket) return socket;
    const useSSL = process.env.NEXT_PUBLIC_NAKAMA_USE_SSL === "true";
    socket = getClient().createSocket(useSSL, false);
    await socket.connect(session, true);
    return socket;
}

export function getSocket(): Socket | null {
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect(true);
        socket = null;
    }
}