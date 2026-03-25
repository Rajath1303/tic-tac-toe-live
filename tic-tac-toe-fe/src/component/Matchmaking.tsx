import { GamePhase } from "@/types";
import { Dispatch, SetStateAction } from "react";

export default function Matchmaking({
  searchTime,
  setPhase,
  onCancelMatch,
}: {
  searchTime: number;
  setPhase: Dispatch<SetStateAction<GamePhase>>;
  onCancelMatch?: () => void;
}) {
  return (
    <div className="card">
      <div className="mm-spinner" />
      <div className="heading text-center">Finding a match…</div>
      <div className="sub">
        {String(Math.floor(searchTime / 60)).padStart(2, "0")}:
        {String(searchTime % 60).padStart(2, "0")}
      </div>
      <button
        className="btn btn-danger"
        onClick={() => {
          setPhase("lobby");
          onCancelMatch?.();
        }}
      >
        Cancel
      </button>
    </div>
  );
}
