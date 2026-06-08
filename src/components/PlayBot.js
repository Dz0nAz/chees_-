import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { Link } from 'react-router-dom';
import axios from 'axios';

function PlayBot({ user }) {
  const [game, setGame] = useState(new Chess());
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState('');

  const makeRandomMove = () => {
    const possibleMoves = game.moves();
    if (game.isGameOver()) {
      handleGameOver();
      return;
    }
    if (possibleMoves.length === 0) return;

    const randomIndex = Math.floor(Math.random() * possibleMoves.length);
    game.move(possibleMoves[randomIndex]);
    setGame(new Chess(game.fen()));

    if (game.isGameOver()) {
      handleGameOver();
    }
  };

  const onDrop = (sourceSquare, targetSquare) => {
    try {
      const move = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      if (move === null) return false;

      setGame(new Chess(game.fen()));

      if (game.isGameOver()) {
        handleGameOver();
      } else {
        setTimeout(makeRandomMove, 300);
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleGameOver = async () => {
    setGameOver(true);
    let gameResult = 'draw';
    if (game.isCheckmate()) {
      gameResult = game.turn() === 'w' ? 'black' : 'white';
    }
    
    setResult(
      game.isCheckmate() 
        ? `Мат! ${gameResult === 'white' ? 'Вы выиграли!' : 'Бот выиграл!'}`
        : game.isDraw() ? 'Ничья!' : 'Игра окончена'
    );

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/games',
        { pgn: game.pgn(), result: gameResult, movesCount: game.history().length },
        { headers: { Authorization: `Bearer ${token}` }}
      );
    } catch (error) {
      console.error('Ошибка сохранения игры:', error);
    }
  };

  const resetGame = () => {
    setGame(new Chess());
    setGameOver(false);
    setResult('');
  };

  return (
    <div className="play-bot">
      <nav className="navbar">
        <h1>♟️ ChessMaster</h1>
        <div className="nav-links">
          <Link to="/dashboard">Главная</Link>
          <Link to="/lessons">Уроки</Link>
          <Link to="/play">Игра с ботом</Link>
          <Link to="/playtwo">Игра вдвоём</Link>
        </div>
      </nav>

      <div className="game-container">
        <div className="game-sidebar">
          <h2>Игра с ботом</h2>
          <p>Играете белыми против компьютера</p>
          
          {gameOver && (
            <div className="game-result">
              <h3>{result}</h3>
              <button onClick={resetGame} className="btn-new-game">Новая игра</button>
            </div>
          )}
          
          <div className="game-info">
            <p>Ходов: {game.history().length}</p>
            <p>Ход: {game.turn() === 'w' ? 'Белые' : 'Черные'}</p>
            {game.isCheck() && <p className="check-warning">⚠️ Шах!</p>}
          </div>
        </div>

        <div className="chessboard-container">
          <Chessboard position={game.fen()} onPieceDrop={onDrop} boardWidth={500} />
        </div>
      </div>
    </div>
  );
}

export default PlayBot;