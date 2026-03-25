"use client";

import { useState } from "react";
import { useNakama } from "@/lib/nakama/NakamaContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, isConnected } = useNakama();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  if (isConnected) {
    router.push("/game");
    return null;
  }

  async function handleLogin() {
    if (!username.trim()) return;
    setLoading(true);
    setError("");
    try {
      await login(username.trim());
      router.push("/game");
    } catch (e: any) {
      if (e.status === 409) {
        setError("Username already exists");
        return;
      }
      setError(e?.message || JSON.stringify(e) || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="app-container">
        <div className="card">
          <div className="label">Welcome</div>
          <div className="heading">Enter the Arena</div>
          <input
            className="input"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            autoFocus
          />
          <button
            className="btn btn-primary"
            onClick={handleLogin}
            disabled={loading || !username.trim()}
          >
            {loading ? "Connecting…" : "Play Now →"}
          </button>
          {error && <div className="err">{error}</div>}
        </div>
      </div>
    </>
  );
}
