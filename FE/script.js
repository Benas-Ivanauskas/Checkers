// Define currentPlayer globally
const baseUrl = "http://localhost:3000/api/games";
let currentPlayer = "black";
let selectedPiece = null;
let gameId = null; // To store the current game ID
let moveNumber = 0;

// Function to create a new game
async function createNewGame() {
  try {
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

    if (!response.ok) {
      throw new Error("Failed to create game");
    }

    const data = await response.json();
    console.log("New game created:", data);

    // Store the game ID globally
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

    if (!response.ok) {
      throw new Error("Game not found");
    }

    const data = await response.json();
    console.log("Game data:", data);

    // Update the currentPlayer based on fetched game data
    currentPlayer = data.game.current_turn;

    // Store the game ID globally
    gameId = data.game.id;

    // Handle response and update UI accordingly (I think here is bug with board.board_status.board and board.board_status save different and he dont undersntand so i used if with with these variants)
    let boardState;
    if (data.board.board_state.board) {
      boardState = data.board.board_state.board;
    } else {
      boardState = data.board.board_state;
    }

    moveNumber = data.board.move_number || 0;

    initializeCheckersBoard(boardState);
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

    if (!response.ok) {
      throw new Error(
        `Failed to update game (${response.status}): ${await response.text()}`
      );
    }

    const data = await response.json();
    console.log("Game updated successfully:", data);

    // Check for winner when game is updated
    checkWinner(boardState);

    // Return the timestamp of the last move from the server response
    return data; // Assuming 'data.board.timestamp' is in '2024-07-14T15:47:07.201Z' format
  } catch (error) {
    console.error("There was a problem updating the game:", error);
    // Handle specific error cases if needed
    if (error.message.includes("Failed to update game")) {
      // Handle specific error cases or show user-friendly message
    } else {
      // Handle other errors or show generic message
    }
  }
}

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

  direction.forEach((dir) => {
    checkDiagonalMove(row, col, row + dir, col - 1, color);
    checkDiagonalMove(row, col, row + dir, col + 1, color);
  });

  direction.forEach((dir) => {
    checkJumpMove(row, col, row + dir, col - 1, row + 2 * dir, col - 2, color);
    checkJumpMove(row, col, row + dir, col + 1, row + 2 * dir, col + 2, color);
  });

  // Check for no moves left for the current player
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
        const jumpedPiece = enemySquare.children[0];
        enemySquare.removeChild(jumpedPiece);
        movePiece(row, col, targetRow, targetCol);
      });
    }
  }
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

// Function to move the piece to the target position
async function movePiece(startRow, startCol, targetRow, targetCol) {
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

  // Check if the piece becomes a king
  if (
    (pieceToMove.classList.contains("black") && targetRow === 7) ||
    (pieceToMove.classList.contains("white") && targetRow === 0)
  ) {
    pieceToMove.classList.add("king");
    if (pieceToMove.classList.contains("black")) {
      pieceToMove.style.backgroundColor = "red"; // Change black to red for kings
    } else if (pieceToMove.classList.contains("white")) {
      pieceToMove.style.backgroundColor = "gold"; // Change white to gold for kings
    }
  }

  selectedPiece.classList.remove("selected");
  selectedPiece = null;

  clearHighlights();
  removeAllSquareListeners(); // Remove all square event listeners after move
  switchTurn();
  updateStatus();
  initializePieceEventListeners(); // Re-initialize piece event listeners after move
  moveNumber++;

  try {
    // Update the game state on the server and get the timestamp of the move
    const updateGameStateOnTheServer = await updateGame(
      gameId,
      getBoardState(),
      currentPlayer,
      moveNumber
    );

    displayLastMoveTimestamp(updateGameStateOnTheServer.game.timestamp);
    //CIA VISISKAI NEREIKALINGA ATRODO BET NEBEISMETE WHO WON THE GAME! checkint
  } catch (error) {
    console.error("Error updating game and displaying timestamp:", error);
    // Handle error accordingly
  }
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

// Function to update current turn status
function updateStatus() {
  const statusElement = document.getElementById("status");
  statusElement.innerHTML = `Current turn: ${currentPlayer.toUpperCase()}`;
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

  if (blackPiecesLeft === 0) {
    statusElement.innerHTML = "White wins! No black checkers left.";
    playAgainButton.style.display = "block";
  } else if (whitePiecesLeft === 0) {
    statusElement.innerHTML = "Black wins! No white checkers left.";
    playAgainButton.style.display = "block";
  } else if (!hasValidMove("black")) {
    statusElement.innerHTML = "White wins! No moves left for black.";
    playAgainButton.style.display = "block";
  } else if (!hasValidMove("white")) {
    statusElement.innerHTML = "Black wins! No moves left for white.";
    playAgainButton.style.display = "block";
  } else {
    playAgainButton.style.display = "none"; // Hide button if no winner
  }

  // Hide the New Game button when the game is won
  // const newGameButton = document.getElementById("new-game-btn");
  // newGameButton.style.display = "none";
  // maybe not need NEED TO THINK
}

// Function to display the timestamp of the last move
function displayLastMoveTimestamp(timestamp) {
  const lastMoveElement = document.getElementById("last-move-timestamp");
  const formattedTimestamp = new Date(timestamp).toLocaleString();
  console.log(formattedTimestamp);
  lastMoveElement.textContent = `Last move made at: ${formattedTimestamp}`;
}

// Add event listener for "Play Again" button
const playAgainButton = document.getElementById("play-again-btn");
playAgainButton.addEventListener("click", function () {
  // Reset game state
  currentPlayer = "black";
  selectedPiece = null;
  gameId = null;

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

initializeGame();
