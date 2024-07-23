-- Check if the database exists
SELECT 'CREATE DATABASE checkersss'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'checkersss')\gexec

-- Connect to the new database
\c checkersss

-- Create games table if it does not exist
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  player_black_id VARCHAR(50) NOT NULL,
  player_white_id VARCHAR(50) NOT NULL,
  current_turn VARCHAR(10) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create boards table if it does not exist
CREATE TABLE IF NOT EXISTS boards (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  board_state JSONB NOT NULL,
  move_number INTEGER NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
