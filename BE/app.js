require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const gameRouter = require("./routes/gameRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:4000",
    credentials: true,
  })
);

app.use(bodyParser.json());

app.use("/api/games", gameRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
