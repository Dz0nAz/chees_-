import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { Link } from 'react-router-dom';

function PlayTwo() {
  const [game, setGame] = useState(new Chess());
  const [gameOver, setGameOver] = useState(false);

  const onDrop = (sourceSquare, targetSquare) => {
    if (gameOver) return false;

    try {
      const move = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      if (move === null) return false;

      setGame(new Chess(game.fen()));

      if (game.isGameOver()) {
        setGameOver(true);
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  const resetGame = () => {
    setGame(new Chess());
    setGameOver(false);
  };

  const currentTurn = game.turn() === 'w' ? '⚪ Белые' : '⚫ Чёрные';

  return (
    <div className="play-two">
      <nav className="navbar">
        <h1>♟️ ChessMaster</h1>
        <div className="nav-links">
          <Link to="/dashboard">Главная</Link>
          <Link to="/lessons">Уроки</Link>
          <Link to="/play">Игра с ботом</Link>
          <Link to="/playtwo">Игра вдвоём</Link>
        </div>
      </nav>

      <div className="two-player-container">
        <h2>👥 Игра для двоих</h2>

        <div className="two-player-info">
          <div className={`player-turn ${game.turn() === 'w' ? 'white-turn' : 'black-turn'}`}>
            Ходят: {currentTurn}
          </div>
        </div>

        {gameOver && (
          <div className="game-over-message">
            <h3>🏆 {game.isCheckmate() ? `Мат! Победили ${game.turn() === 'w' ? 'Чёрные' : 'Белые'}!` : '🤝 Ничья!'}</h3>
            <button onClick={resetGame}>🔄 Новая игра</button>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Chessboard position={game.fen()} onPieceDrop={onDrop} boardWidth={560} />
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem', color: '#a8b2d1' }}>
          💡 Игроки ходят по очереди за одним компьютером
        </div>
      </div>
    </div>
  );
}

export default PlayTwo;