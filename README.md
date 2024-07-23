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

- Create new folder on your system for the project and open in Visual Studio Code.
- Open current folder terminal and clone the repository using the following command:
  `git clone https://github.com/Benas-Ivanauskas/Checkers.git`

2. Install dependencies:

- Navigate to the `BE` folder and isntall necessary dependencies `npm install`

3. Set up environment variables:

- In the `BE` folder, create a `.env` file.
- Add the following content to the `.env` file:

  `PORT=3000
DB_HOST=database
DB_PORT=5432
DB_USER=postgre
DB_PASSWORD=your_postgres_password
DB_NAME=saskes`

- Replace `your_postgres_password` with your actual PostgreSQL password.

4. Build Docker and start the containers:

- Once you have set up `.env` file, now you can build and start all services usding Docker Compose command : `docker-compose up`

5. Start the app:

- You can open your app in web-browser using `http://localhost:4000` port.

## API Endpoints

- `POST /api/games`: Create a new game
- `GET /api/games/:id`: Get current game state by ID
- `PUT /api/games/:id`: Update game state
