import {
  currentPlayer,
  selectedPiece,
  setSelectedPiece,
  setCurrentPlayer,
  gameId,
  moveNumber,
  setMoveNumber,
  setGameEnded,
} from "./variables.js";
import {
  movePiece,
  performJump,
  getBoardState,
  handleSquareClick,
  addPieceClickListener,
} from "./board.js";
import { updateStatus, displayLastMoveTimestamp } from "./ui.js";
import { updateGame } from "./api.js";

function displayAvailableMoves() {
  const squares = document.querySelectorAll(".square");
  squares.forEach((square) => square.classList.remove("highlight"));

  const selectedSquare = selectedPiece.parentElement;
  const row = parseInt(selectedSquare.dataset.row);
  const col = parseInt(selectedSquare.dataset.col);
  const color = selectedPiece.classList.contains("black") ? "black" : "white";
  const direction = selectedPiece.classList.contains("king")
    ? [1, -1]
    : [color === "black" ? 1 : -1];

  let jumpMoveAvailable = false;

  direction.forEach((dir) => {
    jumpMoveAvailable =
      checkJumpMove(
        row,
        col,
        row + dir,
        col - 1,
        row + 2 * dir,
        col - 2,
        color
      ) || jumpMoveAvailable;
    jumpMoveAvailable =
      checkJumpMove(
        row,
        col,
        row + dir,
        col + 1,
        row + 2 * dir,
        col + 2,
        color
      ) || jumpMoveAvailable;
  });

  if (!jumpMoveAvailable) {
    direction.forEach((dir) => {
      checkDiagonalMove(row, col, row + dir, col - 1, color);
      checkDiagonalMove(row, col, row + dir, col + 1, color);
    });
  }

  if (!hasValidMove(color)) {
    const statusElement = document.getElementById("status");
    const winner = currentPlayer === "black" ? "White" : "Black";
    statusElement.innerHTML = `${winner} wins! No moves left for ${currentPlayer}.`;
  }
}

function checkDiagonalMove(row, col, targetRow, targetCol) {
  if (isValidSquare(targetRow, targetCol)) {
    const targetSquare = document.querySelector(
      `.square[data-row='${targetRow}'][data-col='${targetCol}']`
    );
    if (!targetSquare.children.length) {
      targetSquare.classList.add("highlight");
      targetSquare.addEventListener("click", function () {
        movePiece(row, col, targetRow, targetCol);
      });
    }
  }
}

function checkJumpMove(
  row,
  col,
  enemyRow,
  enemyCol,
  targetRow,
  targetCol,
  color
) {
  if (
    isValidSquare(enemyRow, enemyCol) &&
    isValidSquare(targetRow, targetCol)
  ) {
    const enemySquare = document.querySelector(
      `.square[data-row='${enemyRow}'][data-col='${enemyCol}']`
    );
    const targetSquare = document.querySelector(
      `.square[data-row='${targetRow}'][data-col='${targetCol}']`
    );
    if (
      enemySquare.children.length &&
      enemySquare.children[0].classList.contains(
        color === "black" ? "white" : "black"
      ) &&
      !targetSquare.children.length
    ) {
      targetSquare.classList.add("highlight");
      targetSquare.addEventListener("click", function () {
        performJump(row, col, enemyRow, enemyCol, targetRow, targetCol);
      });
      return true;
    }
  }
  return false;
}

function checkKingPromotion(piece, row) {
  if (
    (piece.classList.contains("black") && row === 7) ||
    (piece.classList.contains("white") && row === 0)
  ) {
    piece.classList.add("king");
    if (piece.classList.contains("black")) {
      piece.style.backgroundColor = "red";
    } else if (piece.classList.contains("white")) {
      piece.style.backgroundColor = "gold";
    }
  }
}

function endTurn() {
  selectedPiece.classList.remove("selected");
  setSelectedPiece(null);
  clearHighlights();
  removeAllSquareListeners();
  switchTurn();
  updateStatus();
  initializePieceEventListeners();
  setMoveNumber(moveNumber + 1);

  updateGame(gameId, getBoardState(), currentPlayer, moveNumber)
    .then((updateGameStateOnTheServer) => {
      displayLastMoveTimestamp(updateGameStateOnTheServer.game.timestamp);
    })
    .catch((error) => {
      console.error("Error updating game and displaying timestamp:", error);
    });
}

function isValidMove(targetRow, targetCol) {
  if (isValidSquare(targetRow, targetCol)) {
    const targetSquare = document.querySelector(
      `.square[data-row='${targetRow}'][data-col='${targetCol}']`
    );
    return !targetSquare.children.length;
  }
  return false;
}

function isValidJump(enemyRow, enemyCol, targetRow, targetCol, color) {
  if (
    isValidSquare(enemyRow, enemyCol) &&
    isValidSquare(targetRow, targetCol)
  ) {
    const enemySquare = document.querySelector(
      `.square[data-row='${enemyRow}'][data-col='${enemyCol}']`
    );
    const targetSquare = document.querySelector(
      `.square[data-row='${targetRow}'][data-col='${targetCol}']`
    );
    return (
      enemySquare.children.length &&
      enemySquare.children[0].classList.contains(
        color === "black" ? "white" : "black"
      ) &&
      !targetSquare.children.length
    );
  }
  return false;
}

function isValidSquare(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

function switchTurn() {
  setCurrentPlayer(currentPlayer === "black" ? "white" : "black");
}

function clearHighlights() {
  const squares = document.querySelectorAll(".highlight");
  squares.forEach((square) => {
    square.classList.remove("highlight");
    square.removeEventListener("click", handleSquareClick);
  });
}

function initializePieceEventListeners() {
  const pieces = document.querySelectorAll(".piece");
  pieces.forEach((piece) => {
    addPieceClickListener(piece);
  });
}

function removeAllSquareListeners() {
  const squares = document.querySelectorAll(".square");
  squares.forEach((square) => {
    const newSquare = square.cloneNode(true);
    square.parentNode.replaceChild(newSquare, square);
  });
}

function hasValidMove(color) {
  const squares = document.querySelectorAll(".square");
  let hasMove = false;

  squares.forEach((square) => {
    if (
      square.children.length > 0 &&
      square.children[0].classList.contains(color)
    ) {
      const row = parseInt(square.dataset.row);
      const col = parseInt(square.dataset.col);
      const piece = square.children[0];

      const direction = piece.classList.contains("king")
        ? [1, -1]
        : [color === "black" ? 1 : -1];

      direction.forEach((dir) => {
        if (
          isValidMove(row + dir, col - 1) ||
          isValidMove(row + dir, col + 1)
        ) {
          hasMove = true;
        }
        if (
          isValidJump(
            row,
            col,
            row + dir,
            col - 1,
            row + 2 * dir,
            col - 2,
            color
          ) ||
          isValidJump(
            row,
            col,
            row + dir,
            col + 1,
            row + 2 * dir,
            col + 2,
            color
          )
        ) {
          hasMove = true;
        }
      });
    }
  });

  return hasMove;
}

function checkWinner(boardState) {
  let blackPiecesLeft = 0;
  let whitePiecesLeft = 0;

  // Count remaining pieces on the board
  boardState.forEach((row) => {
    row.forEach((cell) => {
      if (cell === "black") {
        blackPiecesLeft++;
      } else if (cell === "white") {
        whitePiecesLeft++;
      }
    });
  });

  const statusElement = document.getElementById("status");
  const playAgainButton = document.getElementById("play-again-btn");
  const newGameButton = document.getElementById("new-game-btn");

  if (blackPiecesLeft === 0) {
    statusElement.innerHTML = "White wins! No black checkers left.";
    setGameEnded(true);
    playAgainButton.style.display = "block";
    newGameButton.style.display = "none";
  } else if (whitePiecesLeft === 0) {
    statusElement.innerHTML = "Black wins! No white checkers left.";
    setGameEnded(true);
    playAgainButton.style.display = "block";
    newGameButton.style.display = "none";
  } else if (!hasValidMove("black")) {
    statusElement.innerHTML = "White wins! No moves left for black.";
    setGameEnded(true);
    playAgainButton.style.display = "block";
    newGameButton.style.display = "none";
  } else if (!hasValidMove("white")) {
    statusElement.innerHTML = "Black wins! No moves left for white.";
    setGameEnded(true);
    playAgainButton.style.display = "block";
    newGameButton.style.display = "none";
  } else {
    playAgainButton.style.display = "none";
    newGameButton.style.display = "block";
  }
}

export {
  displayAvailableMoves,
  checkDiagonalMove,
  checkJumpMove,
  checkKingPromotion,
  endTurn,
  isValidMove,
  isValidJump,
  isValidSquare,
  switchTurn,
  clearHighlights,
  initializePieceEventListeners,
  removeAllSquareListeners,
  hasValidMove,
  checkWinner,
};
