export type Cell = "X" | "O" | null;

export const OP_CODE = {
    GAME_STATE: 1,
    MOVE: 2,
    GAME_OVER: 3,
    RESTART: 4,
    RESTART_REQUEST: 5,
    RESTART_ACCEPT: 6,
} as const;

export interface ServerGameState {
    board: Cell[];
    current_turn: "X" | "O";
    players: { x: string; o: string };
    winner: Cell | "draw" | null;
    your_mark: "X" | "O";
}

export interface MovePayload {
    position: number;
}