# Checkers game

A web-based implementation of the classic Checkers game with a Node.js backend and a vanilla JavaScript frontend.

## About the Project

This project is a full-stack web application that allows users to play Checkers on the browser. It features a responsive frontend built with HTML, CSS, and vanilla JavaScript, and a backend API built with Node.js and Express, using PostgreSQL for data persistence.

## Features

- Interactive Checkers game board
- Real-time game state updates
- Player turn management
- Game state persistence
- RESTful API for game operations

## Technologies Used

Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- ES6 Modules

Backend
- Node.js
- Express.js
- PostgreSQL
- Docker (for containerization)

## Installation and Setup

1. Clone the repository:
`git clone https://github.com/Benas-Ivanauskas/Checkers.git`
2. Install dependencies:
In the BE folder `npm install`
3. Set up envirnment variables:
Create a `.env` file in the root directory and add the following:
`
PORT=3000
PASSWORD=your_postgres_password
`
5. Start the PostgreSQL database:
Ensure you have PostgreSQL installed and running on your system.
6. Initialize the database:
Run the SQL scripts to create the necessary tables:
`
CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  player_black_id VARCHAR(50) NOT NULL,
  player_white_id VARCHAR(50) NOT NULL,
  current_turn VARCHAR(10) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE boards (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  board_state JSONB NOT NULL,
  move_number INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
`
7. Start the server:
`npm run server`
8. Open the frontend:
Open the `index.html` file in a web browser or use a local development server like Live Server in Visual Studio Code.

## Docker Setup (Optional)

If you prefer to use Docker:

1. Ensure Docker and Docker Compose are installed on your system.
2. Build and run the containers:
`docker-compose up --build`

## API Endpoints

- `POST /api/games`: Create a new game
- `GET /api/games/:id`: Get current game state by ID
- `PUT /api/games/:id`: Update game state





