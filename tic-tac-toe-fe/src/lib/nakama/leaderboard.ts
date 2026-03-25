import { getClient } from "./client";
import { Session } from "@heroiclabs/nakama-js";

export interface LeaderboardEntry {
    rank: number;
    username: string;
    wins: number;
    user_id: string;
}

export async function fetchLeaderboard(session: Session): Promise<LeaderboardEntry[]> {
    const result = await getClient().listLeaderboardRecords(
        session,
        "tictactoe_wins",
        [],
        10
    );

    return (result.records ?? []).map(r => ({
        rank: Number(r.rank),
        username: r.username ?? "Unknown",
        wins: Number(r.score),
        user_id: r.owner_id ?? "",
    }));
}

export async function fetchMyRank(session: Session): Promise<LeaderboardEntry | null> {
    const result = await getClient().listLeaderboardRecordsAroundOwner(
        session,
        "tictactoe_wins",
        session.user_id!,
        3
    );
    const mine = result.records?.find(r => r.owner_id === session.user_id);
    if (!mine) return null;
    return {
        rank: Number(mine.rank),
        username: mine.username ?? "You",
        wins: Number(mine.score),
        user_id: mine.owner_id ?? "",
    };
}