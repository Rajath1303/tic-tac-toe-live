"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useNakama } from "@/lib/nakama/NakamaContext";
import TicTacToe, { ExternalGameState } from "@/component/TicTacToe";
import { joinMatchmaker, leaveMatchmaker } from "@/lib/nakama/matchmaking";
import { OP_CODE, Cell } from "@/lib/nakama/types";
import { useRouter } from "next/navigation";

import { getClient } from "@/lib/nakama/client";
import { fetchMyRank } from "@/lib/nakama/leaderboard";

export default function GamePage() {
  const { socket, session, isConnected } = useNakama();
  const router = useRouter();
  const [mmTicket, setMmTicket] = useState<string | null>(null);
  const [restartRequested, setRestartRequested] = useState(false);
  const [opponentWantsRestart, setOpponentWantsRestart] = useState(false);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [matchmakingStatus, setMatchmakingStatus] = useState<
    "idle" | "searching" | "found"
  >("idle");
  const [gameState, setGameState] = useState<ExternalGameState | undefined>(
    undefined,
  );

  const matchIdRef = useRef<string | null>(null);
  const WINNING_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  function checkWinner(board: Cell[]): Cell | "draw" | null {
    for (const line of WINNING_LINES) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c])
        return board[a];
    }
    if (board.every(Boolean)) return "draw";
    return null;
  }
  useEffect(() => {
    if (!isConnected) return;
    if (!session?.username) router.replace("/login");
    if (session) {
      fetchMyRank(session).then((rank) => {
        setMyRank(rank?.rank || null);
      });
    }
  }, [session, isConnected]);
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.onmatchmakermatched = async (matched) => {
      console.log("Matched:", JSON.stringify(matched));

      try {
        const match = await socket.joinMatch(matched.match_id, matched.token);
        console.log("Joined match:", match.match_id);
        matchIdRef.current = match.match_id;
        setMmTicket(null);
        const myUserId = session?.user_id;
        const allUsers = matched.users ?? [];
        const sorted = [...allUsers].sort((a, b) =>
          a.presence.user_id.localeCompare(b.presence.user_id),
        );

        console.log(
          "Sorted users:",
          sorted.map((u) => `${u.presence.username}:${u.presence.user_id}`),
        );
        console.log("My user_id:", myUserId);

        const isX = sorted[0]?.presence.user_id === myUserId;
        console.log("I am:", isX ? "X" : "O");

        setGameState({
          board: Array(9).fill(null),
          currentTurn: "X",
          myMark: isX ? "X" : "O",
          players: {
            x: sorted[0]?.presence.username ?? "Player X",
            o: sorted[1]?.presence.username ?? "Player O",
          },
          winner: null,
        });

        setMatchmakingStatus("found");
      } catch (e: any) {
        console.error("Join match failed:", JSON.stringify(e));
        setMatchmakingStatus("idle");
      }
    };

    socket.onmatchdata = (data) => {
      try {
        const decoded = new TextDecoder().decode(data.data);
        const payload = JSON.parse(decoded);

        switch (data.op_code) {
          case OP_CODE.MOVE: {
            if (data?.presence?.user_id === session?.user_id) break;
            setGameState((prev) => {
              if (!prev) return prev;
              const position = payload.position;
              if (prev.board[position]) return prev; // already filled

              const newBoard = [...prev.board] as Cell[];
              const opponentMark = prev.myMark === "X" ? "O" : "X";
              newBoard[position] = opponentMark;
              const result = checkWinner(newBoard);
              return {
                ...prev,
                board: newBoard,
                currentTurn: prev.currentTurn === "X" ? "O" : "X",
                winner: result,
              };
            });
            break;
          }

          case OP_CODE.GAME_STATE:
            setGameState((prev) =>
              prev
                ? {
                    ...prev,
                    board: payload.board ?? prev.board,
                    currentTurn: payload.current_turn ?? prev.currentTurn,
                    players: payload.players ?? prev.players,
                  }
                : prev,
            );
            break;

          case OP_CODE.GAME_OVER:
            setGameState((prev) =>
              prev
                ? {
                    ...prev,
                    board: payload.board ?? prev.board,
                    winner: payload.winner,
                  }
                : prev,
            );
            break;

          case OP_CODE.RESTART:
            setGameState((prev) =>
              prev
                ? {
                    ...prev,
                    board: Array(9).fill(null),
                    currentTurn: "X",
                    winner: null,
                  }
                : prev,
            );
            break;
          case OP_CODE.RESTART_REQUEST:
            setOpponentWantsRestart(true);
            break;

          case OP_CODE.RESTART_ACCEPT:
            setOpponentWantsRestart(false);
            setRestartRequested(false);
            setGameState((prev) =>
              prev
                ? {
                    ...prev,
                    board: Array(9).fill(null),
                    currentTurn: "X",
                    winner: null,
                  }
                : prev,
            );
            break;
        }
      } catch (e) {
        console.error("Match data parse error:", e);
      }
    };
    socket.onmatchpresence = (presence) => {
      if (presence.leaves && presence.leaves.length > 0) {
        console.log("Opponent disconnected");
      }
    };

    return () => {
      socket.onmatchmakermatched = () => {};
      socket.onmatchdata = () => {};
      socket.onmatchpresence = () => {};
    };
  }, [socket, isConnected, session]);

  async function submitWinToLeaderboard() {
    if (!session) return;
    try {
      await getClient().writeLeaderboardRecord(session, "tictactoe_wins", {
        score: "1",
      });
      console.log("Score submitted to leaderboard");
    } catch (e) {
      console.error("Leaderboard submit failed:", JSON.stringify(e));
    }
  }
  const handleFindMatch = useCallback(
    async (_username: string) => {
      if (!socket) return;
      try {
        setMatchmakingStatus("searching");
        const ticket = await joinMatchmaker(socket);
        setMmTicket(ticket);
        console.log("Matchmaking ticket:", ticket);
      } catch (e: any) {
        console.error("Matchmaking error:", JSON.stringify(e));
        setMatchmakingStatus("idle");
      }
    },
    [socket],
  );

  const handleCancelMatch = useCallback(async () => {
    if (!socket || !mmTicket) return;
    try {
      await leaveMatchmaker(socket, mmTicket);
      setMmTicket(null);
      setMatchmakingStatus("idle");
    } catch (e: any) {
      console.error("Cancel error:", JSON.stringify(e));
    }
  }, [socket, mmTicket]);

  const handleSendMove = useCallback(
    async (position: number) => {
      if (!socket || !matchIdRef.current) return;
      let hasSubmitted = false;
      setGameState((prev) => {
        if (!prev || prev.board[position]) return prev;
        const newBoard = [...prev.board] as Cell[];
        newBoard[position] = prev.myMark;
        const winner = checkWinner(newBoard);
        if (
          winner &&
          winner !== "draw" &&
          winner === prev.myMark &&
          !hasSubmitted
        ) {
          hasSubmitted = true;
          submitWinToLeaderboard();
        }
        return {
          ...prev,
          board: newBoard,
          currentTurn: prev.currentTurn === "X" ? "O" : "X",
          winner: winner,
        };
      });

      const payload = JSON.stringify({ position });
      await socket.sendMatchState(matchIdRef.current, OP_CODE.MOVE, payload);
    },
    [socket],
  );

  const handlePlayAgain = useCallback(async () => {
    if (!socket || !matchIdRef.current) return;

    if (opponentWantsRestart) {
      await socket.sendMatchState(
        matchIdRef.current,
        OP_CODE.RESTART_ACCEPT,
        "{}",
      );
      setOpponentWantsRestart(false);
      setRestartRequested(false);
      setGameState((prev) =>
        prev
          ? {
              ...prev,
              board: Array(9).fill(null),
              currentTurn: "X",
              winner: null,
            }
          : prev,
      );
    } else {
      setRestartRequested(true);
      await socket.sendMatchState(
        matchIdRef.current,
        OP_CODE.RESTART_REQUEST,
        "{}",
      );
    }
  }, [socket, opponentWantsRestart]);

  if (!isConnected) {
    return (
      <div className="app-container">
        <div className="card flex flex-col justify-center items-center">
          <div>Not connected to Nakama.</div>
          <a href="/" style={{ color: "#818cf8", fontSize: 14 }}>
            Go to login →
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {session?.username && (
        <TicTacToe
          onFindMatch={handleFindMatch}
          onSendMove={handleSendMove}
          onCancelMatch={handleCancelMatch}
          onPlayAgain={handlePlayAgain}
          externalGameState={gameState}
          matchmakingStatus={matchmakingStatus}
          restartRequested={restartRequested} // ← add
          opponentWantsRestart={opponentWantsRestart}
          username={session.username}
          myRank={myRank}
        />
      )}
    </>
  );
}
