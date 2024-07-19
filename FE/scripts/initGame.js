import { setGameId, gameId } from "./variables.js";
import { createNewGame, fetchGameById } from "./api.js";

async function initializeGame() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlGameId = urlParams.get("gameId");

  if (urlGameId) {
    setGameId(urlGameId);
    await fetchGameById(gameId);
  } else {
    await createNewGame();
  }
}

function handleSubmitForm() {
  const inputId = document.getElementById("inputId");
  const inputIdValue = inputId.value;

  if (inputIdValue) {
    fetchGameById(inputIdValue);
    inputId.value = "";
  }
}

const submitBtn = document.getElementById("submitBtn");
if (submitBtn) {
  submitBtn.addEventListener("click", handleSubmitForm);
}

initializeGame();

export { initializeGame, handleSubmitForm };
