export const baseUrl = "http://localhost:3000/api/games";
export let currentPlayer = "black";
export let selectedPiece = null;
export let gameId = null;
export let moveNumber = 0;
export let gameEnded = false;

export function setCurrentPlayer(player) {
  currentPlayer = player;
}

export function setSelectedPiece(piece) {
  selectedPiece = piece;
}

export function setGameId(id) {
  gameId = id;
}

export function setMoveNumber(number) {
  moveNumber = number;
}

export function setGameEnded(ended) {
  gameEnded = ended;
}
