import {
  baseUrl,
  setGameId,
  setGameEnded,
  setMoveNumber,
  setCurrentPlayer,
  gameId,
} from "./variables.js";
import { initializeCheckersBoard } from "./board.js";
import {
  displayErrorMessage,
  displayGameId,
  displayLastMoveTimestamp,
} from "./ui.js";
import { checkWinner } from "./gameLogic.js";

async function createNewGame() {
  try {
    setGameEnded(false);
    setMoveNumber(0);
    setCurrentPlayer("white");
    const response = await fetch(`${baseUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player_black_id: "1",
        player_white_id: "2",
      }),
    });

    const data = await response.json();
    setGameId(data.game.id);
    initializeCheckersBoard(data.board.board_state.board);
    displayGameId(gameId);

    // Update URL with game ID without reloading the page
    const url = new URL(window.location.href);
    url.searchParams.set("gameId", gameId);
    history.pushState(null, "", url.toString());
  } catch (error) {
    console.error("Error creating game:", error);
    displayErrorMessage("Sorry, there was a problem loading the game data");
  }
}

async function fetchGameById(gameId) {
  try {
    const response = await fetch(`${baseUrl}/${gameId}`);

    if (!response.ok) {
      if (response.status === 404) {
        displayErrorMessage("No such data game ID. Go back to current game!");
      } else {
        displayErrorMessage("Sorry, there was a problem loading the game data");
      }
      return;
    }

    const data = await response.json();

    setCurrentPlayer(data.game.current_turn);
    setGameId(data.game.id);
    setMoveNumber(data.board.move_number);

    // Handle response and update UI accordingly
    const boardState = data.board.board_state.board || data.board.board_state;

    initializeCheckersBoard(boardState);
    displayGameId(gameId);

    if (data.game.timestamp) {
      displayLastMoveTimestamp(data.game.timestamp);
    }

    return data;
  } catch (error) {
    console.error("Error fetching game:", error);
    displayErrorMessage("Sorry, there was a problem loading the game data.");
  }
}

async function updateGame(id, boardState, currentTurn, moveNumber) {
  try {
    const response = await fetch(`${baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        board_state: JSON.stringify(boardState),
        current_turn: currentTurn,
        move_number: moveNumber,
      }),
    });

    const data = await response.json();
    checkWinner(boardState);
    return data;
  } catch (error) {
    console.error("There was a problem updating the game:", error);
  }
}

export { createNewGame, fetchGameById, updateGame };
