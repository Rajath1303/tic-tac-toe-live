"use client";

import { useState, useEffect, useCallback } from "react";
import { Cell } from "@/lib/nakama/types";
import Leaderboard from "./Leadboard";
import Gamelobby from "./Gamelobby";
import Matchmaking from "./Matchmaking";
import { GamePhase } from "@/types";

export interface ExternalGameState {
  board: Cell[];
  currentTurn: "X" | "O";
  myMark: "X" | "O";
  players: { x: string; o: string };
  winner: Cell | "draw" | null;
}

interface Props {
  onSendMove?: (position: number) => void;
  onFindMatch?: (username: string) => void;
  onCancelMatch?: () => void;
  onPlayAgain?: () => void;
  externalGameState?: ExternalGameState;
  matchmakingStatus?: "idle" | "searching" | "found";
  restartRequested?: boolean;
  opponentWantsRestart?: boolean;
  username: string;
  myRank: number | null;
}

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

function checkWinner(board: Cell[]): {
  winner: Cell | "draw" | null;
  line: number[] | null;
} {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return { winner: board[a], line };
  }
  if (board.every(Boolean)) return { winner: "draw", line: null };
  return { winner: null, line: null };
}
export default function TicTacToe({
  onSendMove,
  onFindMatch,
  onCancelMatch,
  onPlayAgain,
  externalGameState,
  matchmakingStatus = "idle",
  restartRequested,
  opponentWantsRestart,
  username,
  myRank,
}: Props) {
  const [phase, setPhase] = useState<GamePhase>("lobby");
  const [localBoard, setLocalBoard] = useState<Cell[]>(Array(9).fill(null));
  const board = externalGameState?.board ?? localBoard;
  const [myMark, setMyMark] = useState<"X" | "O">("X");
  const [currentTurn, setCurrentTurn] = useState<"X" | "O">("X");
  const [winResult, setWinResult] = useState<{
    winner: Cell | "draw" | null;
    line: number[] | null;
  }>({ winner: null, line: null });
  const [players, setPlayers] = useState({ x: "Player X", o: "Player O" });
  const [searchTime, setSearchTime] = useState(0);

  useEffect(() => {
    if (matchmakingStatus === "found") setPhase("playing");
  }, [matchmakingStatus]);

  useEffect(() => {
    if (!externalGameState) return;
    if (externalGameState.currentTurn)
      setCurrentTurn(externalGameState.currentTurn);
    if (externalGameState.players) setPlayers(externalGameState.players);
    if (externalGameState.myMark) setMyMark(externalGameState.myMark);
    if (
      externalGameState.winner !== undefined &&
      externalGameState.winner !== null
    ) {
      const result = checkWinner(externalGameState.board ?? board);
      setWinResult(result);
      setPhase("gameover");
    }
  }, [externalGameState]);

  useEffect(() => {
    if (phase !== "matchmaking") {
      setSearchTime(0);
      return;
    }
    const t = setInterval(() => setSearchTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const handleCellClick = useCallback(
    (idx: number) => {
      if (board[idx] || winResult.winner || phase === "gameover") return;

      if (onSendMove) {
        if (currentTurn !== myMark) return;
        onSendMove(idx);
        return;
      }

      const newBoard = [...localBoard];
      newBoard[idx] = currentTurn;
      setLocalBoard(newBoard);
      const result = checkWinner(newBoard);
      setWinResult(result);
      if (result.winner) {
        setPhase("gameover");
        return;
      }
      setCurrentTurn((t) => (t === "X" ? "O" : "X"));
    },
    [board, currentTurn, myMark, onSendMove, winResult],
  );

  const handleFindMatch = () => {
    if (!username.trim()) return;
    setPhase("matchmaking");
    onFindMatch?.(username.trim());
  };

  const handlePlayAgain = () => {
    setLocalBoard(Array(9).fill(null));
    setWinResult({ winner: null, line: null });
    setCurrentTurn("X");
    setPhase("playing");
    onPlayAgain?.();
  };

  const isMyTurn = !onSendMove || currentTurn === myMark;
  const myName = myMark === "X" ? players.x : players.o;
  const oppName = myMark === "X" ? players.o : players.x;

  return (
    <>
      <div className="app-container">
        {phase === "lobby" && (
          <Gamelobby
            username={username}
            handleFindMatch={handleFindMatch}
            myRank={myRank}
          />
        )}
        {phase === "matchmaking" && (
          <Matchmaking
            onCancelMatch={onCancelMatch}
            searchTime={searchTime}
            setPhase={setPhase}
          />
        )}
        {(phase === "playing" || phase === "gameover") && (
          <div className="card">
            <div className="board-container">
              <div
                className={`chip ${currentTurn === "X" && !winResult.winner ? "x-active" : "dim"}`}
              >
                <div className="chip-tag x">
                  X{myMark === "X" ? <span className="you-tag">YOU</span> : ""}
                </div>
                <div className="chip-name">{players.x}</div>
              </div>
              <div className="vs">VS</div>
              <div
                className={`chip ${currentTurn === "O" && !winResult.winner ? "o-active" : "dim"}`}
              >
                <div className="chip-tag o">
                  O{myMark === "O" ? <span className="you-tag">YOU</span> : ""}
                </div>
                <div className="chip-name">{players.o}</div>
              </div>
            </div>
            {phase === "playing" && (
              <div className="turn-bar">
                <div className={`dot ${currentTurn.toLowerCase()}`} />
                {isMyTurn ? (
                  <span className="turn-you">Your turn</span>
                ) : (
                  <span>Waiting for opponent…</span>
                )}
              </div>
            )}
            {phase === "gameover" && (
              <div
                className={`result ${winResult.winner === "draw" ? "draw" : "win"}`}
              >
                <div className="result-title">
                  {winResult.winner === "draw"
                    ? "It's a Draw!"
                    : winResult.winner === myMark
                      ? "You Win!"
                      : `${winResult.winner === "X" ? players.x : players.o} Wins!`}
                </div>
                <div className="result-sub">
                  {winResult.winner === "draw"
                    ? "Well played by both"
                    : winResult.winner === myMark
                      ? "+1 win"
                      : "Better luck next time"}
                </div>
              </div>
            )}
            <div className="board">
              {board.map((cell, idx) => {
                const isWinCell = winResult.line?.includes(idx);
                const cantClick = phase === "gameover" || !!cell || !isMyTurn;
                return (
                  <div
                    key={idx}
                    className={[
                      "cell",
                      cell ? "filled" : "",
                      cantClick && !cell ? "no-hover" : "",
                      isWinCell ? "win-cell" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => handleCellClick(idx)}
                  >
                    {cell && (
                      <span className={`mark ${cell.toLowerCase()}`}>
                        {cell}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {phase === "gameover" && (
              <>
                {opponentWantsRestart && !restartRequested && (
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 13,
                      color: "#2dd4bf",
                      marginBottom: 10,
                    }}
                  >
                    Opponent wants a rematch!
                  </div>
                )}
                <Leaderboard />

                <button
                  className="btn btn-primary"
                  onClick={handlePlayAgain}
                  disabled={restartRequested && !opponentWantsRestart}
                >
                  {restartRequested && !opponentWantsRestart
                    ? "Waiting for opponent…"
                    : opponentWantsRestart
                      ? "Accept Rematch ✓"
                      : "Play Again"}
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setPhase("lobby");
                    setLocalBoard(Array(9).fill(null));
                    setWinResult({ winner: null, line: null });
                  }}
                >
                  Back to Lobby
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
