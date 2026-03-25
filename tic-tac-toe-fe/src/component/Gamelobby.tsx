export default function GameLobby({
  username,
  myRank,
  handleFindMatch,
}: {
  username: string;
  myRank: number | null;
  handleFindMatch: () => void;
}) {
  return (
    <div className="card">
      <div className="label">Welcome, {username}</div>
      <div className="heading">Tic-Tac-Toe</div>
      {myRank && <div> {`Rank:${myRank}`} </div>}
      <button className="btn btn-primary" onClick={handleFindMatch}>
        Find Online Match
      </button>
    </div>
  );
}
