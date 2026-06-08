CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rating INTEGER DEFAULT 1200,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    fen_position VARCHAR(100),
    correct_moves JSONB,
    order_num INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    white_player INTEGER REFERENCES users(id),
    black_player INTEGER,
    pgn TEXT,
    result VARCHAR(10),
    moves_count INTEGER,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO lessons (title, description, difficulty, fen_position, correct_moves, order_num) VALUES
('Урок 1: Детский мат', 'Изучите самый быстрый мат в шахматах', 'beginner', 
 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
 '["e2e4", "e7e5", "f1c4", "b8c6", "d1h5", "g8f6", "h5f7"]'::jsonb, 1),

('Урок 2: Защита от детского мата', 'Научитесь защищаться от детского мата', 'beginner',
 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
 '["e2e4", "e7e5", "f1c4", "g8f6"]'::jsonb, 2),

('Урок 3: Вилка конем', 'Как атаковать две фигуры одновременно', 'intermediate',
 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
 '["f3e5", "c6e5", "d1h5"]'::jsonb, 3);

CREATE INDEX idx_user_progress ON user_progress(user_id);
CREATE INDEX idx_games_players ON games(white_player, black_player);