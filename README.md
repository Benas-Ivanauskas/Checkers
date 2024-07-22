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
- Create new folder on your system for the project.
- Open Visual Studio Code and use the terminam to navigate to this folder.
- Clone the repository using the following command:
`git clone https://github.com/Benas-Ivanauskas/Checkers.git`
2. Install dependencies:
- Navigate to the `BE` folder and isntall necessary dependencies `npm install`
3. Set up envirnment variables:
- In the `BE` folder, create a `.env` file in the root directory.
- Add the following content to the `.env` file:
`
PORT=3000
PASSWORD=your_postgres_password
`
- Replace `your_postgres_password` with your actual PostgreSQL password.
5. Start the PostgreSQL database:
- Ensure PostgreSQL is installed and running on your system. You can download it from the PostgreSQL official website.
6. Initialize the database:
- Use a PostgreSQL client or command line tool to run the following SQL scripts to create the necessary tables:
`
CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  player_black_id VARCHAR(50) NOT NULL,
  player_white_id VARCHAR(50) NOT NULL,
  current_turn VARCHAR(10) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
`
`
CREATE TABLE boards (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  board_state JSONB NOT NULL,
  move_number INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
`
7. Start the server:
- In the BE folder terminal, start the server with the following command: `npm run server`
8. Open the frontend:
- Open the `index.html` file in a web browser or use a local development server like Live Server in Visual Studio Code.

## Docker Setup (Optional)

If you prefer to use Docker:

1. Ensure Docker and Docker Compose are installed on your system.
2. Build and run the containers:
- Build Docker image from a Dockerfile `docker build -t checkers-game .`
- Build images and start containers `docker-compose up`

## API Endpoints

- `POST /api/games`: Create a new game
- `GET /api/games/:id`: Get current game state by ID
- `PUT /api/games/:id`: Update game state





