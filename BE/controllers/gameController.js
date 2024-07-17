const gameInitilizeBoardState = require("../utils/gameUtils");
const pool = require("../PostgreSQL/dataBase");
const queries = require("../queries");

const createNewGame = async (req, res) => {
  const { player_black_id, player_white_id } = req.body;
  const currentTurn = "black";
  const initialBoardState = gameInitilizeBoardState.initializeBoardState();

  try {
    const result = await pool.query(queries.insertingIntoGamePlayers, [
      player_black_id,
      player_white_id,
      currentTurn,
    ]);
    const gameId = result.rows[0].id;

    await pool.query(queries.insertIntoBoardState, [
      gameId,
      initialBoardState,
      0,
    ]);

    res.status(201).json({
      game: {
        id: gameId,
        player_black_id,
        player_white_id,
        current_turn: currentTurn,
      },
      board: {
        id: gameId,
        game_id: gameId,
        board_state: initialBoardState,
        move_number: 0,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const currentGameById = async (req, res) => {
  const { id } = req.params;

  try {
    const gameResult = await pool.query(queries.selectFromGameById, [id]);
    if (gameResult.rows.length === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    const boardResult = await pool.query(
      queries.selectLatestBoardStateByGameId,
      [id]
    );
    if (boardResult.rows.length === 0) {
      return res.status(404).json({ error: "Board state not found" });
    }

    res.json({
      game: gameResult.rows[0],
      board: boardResult.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateGameBoardState = async (req, res) => {
  const { id } = req.params;
  const { board_state, current_turn, move_number } = req.body;

  try {
    // Update game turn
    const gameResult = await pool.query(
      queries.updateGameTurnAndTimeStampById,
      [current_turn, id]
    );

    if (gameResult.rows.length === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    // Insert new board state
    const boardResult = await pool.query(queries.insertIntoBoards, [
      id,
      board_state,
      move_number,
    ]);

    if (boardResult.rowCount === 0) {
      console.error(
        `Failed to insert new board state for game ${id}. Query result:`,
        boardResult
      );
      return res.status(500).json({ error: "Failed to update board state" });
    }

    res.json({
      game: gameResult.rows[0],
      board: boardResult.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createNewGame,
  currentGameById,
  updateGameBoardState,
};
