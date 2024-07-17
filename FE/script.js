//Global variables and Constantcs
const baseUrl = "http://localhost:3000/api/games";
let currentPlayer = "black";
let selectedPiece = null;
let gameId = null;
let moveNumber = 0;
let gameEnded = false;

//2. Game Initialiazation
async function initializeGame() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlGameId = urlParams.get("gameId");

  if (urlGameId) {
    gameId = urlGameId;
    await fetchGameById(gameId);
  } else {
    await createNewGame();
  }
}

//3. API Interactions

// Function to create a new game
async function createNewGame() {
  try {
    gameEnded = false;
    moveNumber = 0;
    currentPlayer = "black";
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

    gameId = data.game.id;

    initializeCheckersBoard(data.board.board_state.board);

    // Update URL with game ID without reloading the page
    const url = new URL(window.location.href);
    url.searchParams.set("gameId", gameId);
    history.pushState(null, "", url.toString());
  } catch (error) {
    console.error("Error creating game:", error);
    displayErrorMessage("Sorry, there was a problem loading the game data.");
  }
}

// Function to fetch game data by ID
async function fetchGameById(gameId) {
  try {
    const response = await fetch(`${baseUrl}/${gameId}`);

    const data = await response.json();

    currentPlayer = data.game.current_turn;

    // Handle response and update UI accordingly (I think here is bug with board.board_status.board and board.board_status save different and he dont undersntand so i used if with with these variants)
    let boardState;
    if (data.board.board_state.board) {
      boardState = data.board.board_state.board;
    } else {
      boardState = data.board.board_state;
    }

    moveNumber = data.board.move_number;

    initializeCheckersBoard(boardState);

    if (data.game.timestamp) {
      displayLastMoveTimestamp(
        data.game.timestamp
      ); /*Kartojasi kodas DRY method*/
    }
    return data;
  } catch (error) {
    console.error("Error fetching game:", error);
    displayErrorMessage("Sorry, there was a problem loading the game data.");
  }
}

// Function to update game state on the server
async function updateGame(id, boardState, currentTurn, moveNumber) {
  try {
    const response = await fetch(`${baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        board_state: JSON.stringify(boardState), // Ensure boardState is already a JSON object
        current_turn: currentTurn,
        move_number: moveNumber,
      }),
    });

    const data = await response.json();
    console.log("Game updated successfully:", data);

    // Check for winner when game is updated
    checkWinner(boardState);

    // Return the timestamp of the last move from the server response
    return data;
  } catch (error) {
    console.error("There was a problem updating the game:", error);
  }
}

//4. Board setup and Piece Movement
// Initialize the checkers board with pieces
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

// Function to create a piece element
function createPiece(color) {
  const piece = document.createElement("div");
  piece.classList.add("piece", color);
  if (color === "black" || color === "white") {
    piece.dataset.type = "normal"; // Mark piece as normal
  }
  return piece;
}

// Function to add click listener to a piece
function addPieceClickListener(piece) {
  piece.addEventListener("click", function () {
    if (gameEnded) return;
    if (piece.classList.contains(currentPlayer)) {
      if (selectedPiece) {
        selectedPiece.classList.remove("selected");
      }
      selectedPiece = piece;
      selectedPiece.classList.add("selected");
      displayAvailableMoves();
    }
  });
}

// Function to move the piece to the target position
function movePiece(startRow, startCol, targetRow, targetCol) {
  if (gameEnded) return;
  const startSquare = document.querySelector(
    `.square[data-row='${startRow}'][data-col='${startCol}']`
  );
  console.log(startSquare);
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

  // Check for additional jumps
  const color = jumpingPiece.classList.contains("black") ? "black" : "white";
  const direction = jumpingPiece.classList.contains("king")
    ? [1, -1]
    : [color === "black" ? 1 : -1];

  let additionalJumpAvailable = false;

  direction.forEach((dir) => {
    additionalJumpAvailable =
      checkJumpMove(
        targetRow,
        targetCol,
        targetRow + dir,
        targetCol - 1,
        targetRow + 2 * dir,
        targetCol - 2,
        color
      ) || additionalJumpAvailable;
    additionalJumpAvailable =
      checkJumpMove(
        targetRow,
        targetCol,
        targetRow + dir,
        targetCol + 1,
        targetRow + 2 * dir,
        targetCol + 2,
        color
      ) || additionalJumpAvailable;
  });

  if (!additionalJumpAvailable) {
    endTurn();
  }
}

// Function to get the current board state
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

//5. Game Logic

// Function to display available moves for selected piece
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

// Function to check and highlight diagonal move
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

// Function to check and highlight jump move
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
  selectedPiece = null;
  clearHighlights();
  removeAllSquareListeners();
  switchTurn();
  updateStatus();
  initializePieceEventListeners();
  moveNumber++;

  updateGame(gameId, getBoardState(), currentPlayer, moveNumber)
    .then((updateGameStateOnTheServer) => {
      displayLastMoveTimestamp(updateGameStateOnTheServer.game.timestamp);
    })
    .catch((error) => {
      console.error("Error updating game and displaying timestamp:", error);
    });
}

// Function to validate a move
function isValidMove(targetRow, targetCol) {
  if (isValidSquare(targetRow, targetCol)) {
    const targetSquare = document.querySelector(
      `.square[data-row='${targetRow}'][data-col='${targetCol}']`
    );
    return !targetSquare.children.length;
  }
  return false;
}

// Function to validate a jump
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

// Function to check for valid game board square
function isValidSquare(row, col) {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// Function to switch turns between players
function switchTurn() {
  currentPlayer = currentPlayer === "black" ? "white" : "black";
}

// Function to clear all highlighted squares
function clearHighlights() {
  const squares = document.querySelectorAll(".highlight");
  squares.forEach((square) => {
    square.classList.remove("highlight");
    square.removeEventListener("click", handleSquareClick);
  });
}

// Function to initialize event listeners for all pieces on the board
function initializePieceEventListeners() {
  const pieces = document.querySelectorAll(".piece");
  pieces.forEach((piece) => {
    addPieceClickListener(piece);
  });
}

// Function to remove event listeners from all squares
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

// Function to check for winner when no moves left for the opponent
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
    gameEnded = true;
    playAgainButton.style.display = "block";
    newGameButton.style.display = "none";
  } else if (whitePiecesLeft === 0) {
    statusElement.innerHTML = "Black wins! No white checkers left.";
    gameEnded = true;
    playAgainButton.style.display = "block";
    newGameButton.style.display = "none";
  } else if (!hasValidMove("black")) {
    statusElement.innerHTML = "White wins! No moves left for black.";
    gameEnded = true;
    playAgainButton.style.display = "block";
    newGameButton.style.display = "none";
  } else if (!hasValidMove("white")) {
    statusElement.innerHTML = "Black wins! No moves left for white.";
    gameEnded = true;
    playAgainButton.style.display = "block";
    newGameButton.style.display = "none";
  } else {
    playAgainButton.style.display = "none";
    newGameButton.style.display = "block";
  }
}

//6. UI Updates

// Function to update current turn status
function updateStatus() {
  const statusElement = document.getElementById("status");
  statusElement.innerHTML = `Current turn: ${currentPlayer.toUpperCase()}`;
}

// Function to display the timestamp of the last move
function displayLastMoveTimestamp(timestamp) {
  const lastMoveElement = document.getElementById("last-move-timestamp");
  const formattedTimestamp = new Date(timestamp).toLocaleString();
  lastMoveElement.textContent = `Last move made at: ${formattedTimestamp}`;
}

// Add event listener for "Play Again" button
const playAgainButton = document.getElementById("play-again-btn");
playAgainButton.addEventListener("click", function () {
  // Reset game state
  currentPlayer = "black";
  selectedPiece = null;
  gameId = null;
  gameEnded = false;

  //Clear timestamp
  const timestamp = document.getElementById("last-move-timestamp");
  timestamp.innerHTML = "";

  // Clear board and start a new game
  const checkerBoard = document.getElementById("board");
  checkerBoard.innerHTML = "";

  // Hide "Play Again" button again
  playAgainButton.style.display = "none";

  const newGameButton = document.getElementById("new-game-btn");
  newGameButton.style.display = "block";

  createNewGame();
});

// Add event listener for "New Game" button
const newGameButton = document.getElementById("new-game-btn");
newGameButton.addEventListener("click", createNewGame);

function displayErrorMessage(message) {
  const boardElement = document.getElementById("board");
  boardElement.innerHTML = "";
  const newGameBtn = document.getElementById("new-game-btn");
  newGameBtn.style.display = "none";

  // Create and append error message element
  const errorMessageElement = document.createElement("div");
  errorMessageElement.classList.add("error-message");
  errorMessageElement.textContent = message;
  boardElement.appendChild(errorMessageElement);
}

//7. Main execution
initializeGame();
