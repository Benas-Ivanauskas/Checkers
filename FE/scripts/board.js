import {
  currentPlayer,
  selectedPiece,
  setSelectedPiece,
  gameEnded,
} from "./variables.js";
import { displayAvailableMoves } from "./gameLogic.js";
import { updateStatus } from "./ui.js";
import {
  checkKingPromotion,
  endTurn,
  checkJumpMove,
  isValidSquare,
} from "./gameLogic.js";

function initializeCheckersBoard(boardState) {
  const checkerBoard = document.getElementById("board");
  checkerBoard.innerHTML = "";

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement("div");
      square.classList.add("square");

      if ((row + col) % 2 === 0) {
        square.classList.add("dark-brown");
      } else {
        square.classList.add("light-brown");
      }

      square.dataset.row = row;
      square.dataset.col = col;
      checkerBoard.appendChild(square);

      // Add pieces based on boardState
      const pieceColor = boardState[row][col];
      if (pieceColor) {
        const piece = createPiece(pieceColor);
        square.appendChild(piece);
        addPieceClickListener(piece);
      }
    }
  }

  updateStatus();
}

function createPiece(color) {
  const piece = document.createElement("div");
  piece.classList.add("piece", color);
  if (color === "black" || color === "white") {
    piece.dataset.type = "normal";
  }
  return piece;
}

function addPieceClickListener(piece) {
  piece.addEventListener("click", function () {
    if (gameEnded) return;
    if (piece.classList.contains(currentPlayer)) {
      if (selectedPiece) {
        selectedPiece.classList.remove("selected");
      }
      setSelectedPiece(piece);
      selectedPiece.classList.add("selected");
      displayAvailableMoves();
    }
  });
}

function movePiece(startRow, startCol, targetRow, targetCol) {
  if (gameEnded) return;
  const startSquare = document.querySelector(
    `.square[data-row='${startRow}'][data-col='${startCol}']`
  );
  const pieceToMove = startSquare.children[0];
  const targetSquare = document.querySelector(
    `.square[data-row='${targetRow}'][data-col='${targetCol}']`
  );

  if (targetSquare.children.length > 0) {
    return;
  }

  targetSquare.appendChild(pieceToMove);
  checkKingPromotion(pieceToMove, targetRow);
  endTurn();
}

function handleSquareClick() {
  const targetSquare = this; // `this` refers to the clicked square
  const targetRow = parseInt(targetSquare.dataset.row);
  const targetCol = parseInt(targetSquare.dataset.col);
  movePiece(
    selectedPiece.parentElement.dataset.row,
    selectedPiece.parentElement.dataset.col,
    targetRow,
    targetCol
  );
}

function performJump(
  startRow,
  startCol,
  enemyRow,
  enemyCol,
  targetRow,
  targetCol
) {
  const startSquare = document.querySelector(
    `.square[data-row='${startRow}'][data-col='${startCol}']`
  );
  const enemySquare = document.querySelector(
    `.square[data-row='${enemyRow}'][data-col='${enemyCol}']`
  );
  const targetSquare = document.querySelector(
    `.square[data-row='${targetRow}'][data-col='${targetCol}']`
  );

  const jumpingPiece = startSquare.children[0];
  const capturedPiece = enemySquare.children[0];

  targetSquare.appendChild(jumpingPiece);
  enemySquare.removeChild(capturedPiece);

  checkKingPromotion(jumpingPiece, targetRow);

  const color = jumpingPiece.classList.contains("black") ? "black" : "white";
  const isKing = jumpingPiece.classList.contains("king");
  const directions = [
    { rowDir: 1, colDir: -1 },
    { rowDir: 1, colDir: 1 },
    { rowDir: -1, colDir: -1 },
    { rowDir: -1, colDir: 1 },
  ];

  let additionalJumpAvailable = false;

  directions.forEach(({ rowDir, colDir }) => {
    if (isKing) {
      for (let i = 1; i < 8; i++) {
        const intermediateRow = targetRow + i * rowDir;
        const intermediateCol = targetCol + i * colDir;
        const nextRow = intermediateRow + rowDir;
        const nextCol = intermediateCol + colDir;
        if (
          !isValidSquare(intermediateRow, intermediateCol) ||
          !isValidSquare(nextRow, nextCol)
        ) {
          break;
        }
        additionalJumpAvailable =
          checkJumpMove(
            targetRow,
            targetCol,
            intermediateRow,
            intermediateCol,
            nextRow,
            nextCol,
            color
          ) || additionalJumpAvailable;
      }
    } else {
      additionalJumpAvailable =
        checkJumpMove(
          targetRow,
          targetCol,
          targetRow + rowDir,
          targetCol + colDir,
          targetRow + 2 * rowDir,
          targetCol + 2 * colDir,
          color
        ) || additionalJumpAvailable;
    }
  });

  if (!additionalJumpAvailable) {
    endTurn();
  }
}

function getBoardState() {
  const boardState = [];
  const squares = document.querySelectorAll(".square");

  for (let row = 0; row < 8; row++) {
    boardState[row] = [];
    for (let col = 0; col < 8; col++) {
      const square = squares[row * 8 + col];
      if (square.children.length > 0) {
        const color = square.children[0].classList.contains("black")
          ? "black"
          : "white";
        boardState[row][col] = color;
      } else {
        boardState[row][col] = null;
      }
    }
  }

  return boardState;
}

export {
  initializeCheckersBoard,
  createPiece,
  addPieceClickListener,
  movePiece,
  handleSquareClick,
  performJump,
  getBoardState,
};
