import {
  currentPlayer,
  setCurrentPlayer,
  setSelectedPiece,
  setGameId,
  setGameEnded,
} from "./variables.js";
import { createNewGame } from "./api.js";

function updateStatus() {
  const statusElement = document.getElementById("status");
  statusElement.innerHTML = `Current turn: ${currentPlayer.toUpperCase()}`;
}

function displayGameId(gameId) {
  const id = document.querySelector(".currentGameId");
  id.textContent = gameId;
}

function displayLastMoveTimestamp(timestamp) {
  const lastMoveElement = document.getElementById("last-move-timestamp");
  const formattedTimestamp = new Date(timestamp).toLocaleString();
  lastMoveElement.textContent = `Last move made at: ${formattedTimestamp}`;
}

const playAgainButton = document.getElementById("play-again-btn");
playAgainButton.addEventListener("click", function () {
  setCurrentPlayer("black");
  setSelectedPiece(null);
  setGameId(null);
  setGameEnded(false);

  const timestamp = document.getElementById("last-move-timestamp");
  timestamp.innerHTML = "";

  const checkerBoard = document.getElementById("board");
  checkerBoard.innerHTML = "";

  playAgainButton.style.display = "none";

  const newGameButton = document.getElementById("new-game-btn");
  newGameButton.style.display = "block";

  createNewGame();
});

const newGameButton = document.getElementById("new-game-btn");
newGameButton.addEventListener("click", createNewGame);

function displayErrorMessage(message) {
  const boardElement = document.getElementById("board");
  boardElement.innerHTML = "";
  const newGameBtn = document.getElementById("new-game-btn");
  newGameBtn.style.display = "none";

  const errorMessageElement = document.createElement("div");
  errorMessageElement.classList.add("error-message");
  errorMessageElement.textContent = message;
  boardElement.appendChild(errorMessageElement);
}

export {
  updateStatus,
  displayGameId,
  displayLastMoveTimestamp,
  displayErrorMessage,
};
