"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Session, Socket } from "@heroiclabs/nakama-js";
import {
  authenticateDevice,
  restoreSession,
  clearSession,
} from "@/lib/nakama/auth";
import { connectSocket, disconnectSocket } from "@/lib/nakama/socket";

interface NakamaContextType {
  session: Session | null;
  socket: Socket | null;
  isConnected: boolean;
  login: (username: string) => Promise<void>;
  logout: () => void;
}

const NakamaContext = createContext<NakamaContextType | null>(null);

export function NakamaProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Restore session on mount
  useEffect(() => {
    (async () => {
      try {
        const existing = await restoreSession();
        if (existing) {
          setSession(existing);
          const sock = await connectSocket(existing);
          setSocket(sock);
          setIsConnected(true);
        }
      } catch (e) {
        console.error("Session restore failed:", e);
      }
    })();
    return () => {
      disconnectSocket();
    };
  }, []);

  async function login(username: string) {
    let deviceId = localStorage.getItem("device_id");
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("device_id", deviceId);
    }
    const sess = await authenticateDevice(deviceId, username);
    setSession(sess);
    const sock = await connectSocket(sess);
    setSocket(sock);
    setIsConnected(true);
  }

  function logout() {
    disconnectSocket();
    clearSession();
    localStorage.removeItem("device_id");
    setSession(null);
    setSocket(null);
    setIsConnected(false);
  }

  return (
    <NakamaContext.Provider
      value={{ session, socket, isConnected, login, logout }}
    >
      {children}
    </NakamaContext.Provider>
  );
}

export function useNakama() {
  const ctx = useContext(NakamaContext);
  if (!ctx) throw new Error("useNakama must be used inside NakamaProvider");
  return ctx;
}
