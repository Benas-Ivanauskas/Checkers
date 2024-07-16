const express = require("express");
const gameController = require("../controllers/gameController");

const router = express.Router();

router.post("/", gameController.createNewGame);

router
  .route("/:id")
  .get(gameController.currentGameById)
  .put(gameController.updateGameBoardState);

module.exports = router;
