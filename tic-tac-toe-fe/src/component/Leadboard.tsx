"use client";

import { useEffect, useState } from "react";
import { useNakama } from "@/lib/nakama/NakamaContext";
import {
  fetchLeaderboard,
  fetchMyRank,
  LeaderboardEntry,
} from "@/lib/nakama/leaderboard";

export default function Leaderboard() {
  const { session } = useNakama();
  const [records, setRecords] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    (async () => {
      try {
        const [top, me] = await Promise.all([
          fetchLeaderboard(session),
          fetchMyRank(session),
        ]);
        setRecords(top);
        setMyRank(me);
      } catch (e) {
        console.error("Leaderboard fetch failed:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  if (loading)
    return <div style={{ color: "#666", textAlign: "center" }}>Loading…</div>;

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-title">LEADERBOARD</div>

      {records.map((r) => {
        const isMe = r.user_id === session?.user_id;
        return (
          <div
            key={r.user_id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 10,
              marginBottom: 6,
              background: isMe ? "rgba(99,102,241,0.1)" : "transparent",
              border: isMe
                ? "1px solid rgba(99,102,241,0.3)"
                : "1px solid transparent",
            }}
          >
            <div
              style={{
                width: 28,
                textAlign: "center",
                fontSize: 13,
                color:
                  r.rank <= 3
                    ? ["#fbbf24", "#9ca3af", "#cd7c3f"][r.rank - 1]
                    : "rgba(255,255,255,0.3)",
                fontWeight: 700,
              }}
            >
              {r.rank <= 3 ? ["1", "2", "3"][r.rank - 1] : `#${r.rank}`}
            </div>
            <div
              style={{ flex: 1, fontSize: 14, fontWeight: isMe ? 600 : 400 }}
            >
              {r.username}
              {isMe && (
                <span
                  style={{
                    fontSize: 10,
                    background: "rgba(99,102,241,0.2)",
                    color: "#a5b4fc",
                    borderRadius: 4,
                    padding: "1px 5px",
                    marginLeft: 6,
                  }}
                >
                  YOU
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#2dd4bf",
              }}
            >
              {r.wins}W
            </div>
          </div>
        );
      })}
      {myRank && !records.find((r) => r.user_id === session?.user_id) && (
        <>
          <div
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.2)",
              fontSize: 12,
              margin: "8px 0",
            }}
          >
            • • •
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 10,
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.3)",
            }}
          >
            <div
              style={{
                width: 28,
                textAlign: "center",
                fontSize: 13,
                color: "rgba(255,255,255,0.3)",
                fontWeight: 700,
              }}
            >
              #{myRank.rank}
            </div>
            <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>
              {myRank.username}
              <span
                style={{
                  fontSize: 10,
                  background: "rgba(99,102,241,0.2)",
                  color: "#a5b4fc",
                  borderRadius: 4,
                  padding: "1px 5px",
                  marginLeft: 6,
                }}
              >
                YOU
              </span>
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#2dd4bf",
              }}
            >
              {myRank.wins}W
            </div>
          </div>
        </>
      )}
    </div>
  );
}
