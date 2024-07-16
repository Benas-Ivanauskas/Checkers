const insertingIntoGamePlayers =
  "INSERT INTO games (player_black_id, player_White_id, current_turn) VALUES ($1, $2, $3) RETURNING *";
const insertIntoBoardState =
  "INSERT INTO boards (game_id, board_state, move_number) VALUES ($1, $2, $3)";
const selectFromGameById = "SELECT * FROM games WHERE id = $1";
const selectLatestBoardStateByGameId =
  "SELECT * FROM boards WHERE game_id = $1 ORDER BY move_number DESC LIMIT 1";
const updateGameTurnAndTimeStampById = `
  UPDATE games
  SET current_turn = $1, timestamp = CURRENT_TIMESTAMP
  WHERE id = $2
  RETURNING *
`;
const insertIntoBoards = `
  INSERT INTO boards (game_id, board_state, move_number)
  VALUES ($1, $2, $3)
  RETURNING *
`;

module.exports = {
  insertingIntoGamePlayers,
  insertIntoBoardState,
  selectFromGameById,
  selectLatestBoardStateByGameId,
  updateGameTurnAndTimeStampById,
  insertIntoBoards,
};
