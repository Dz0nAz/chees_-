import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import axios from 'axios';

function LessonPlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [game, setGame] = useState(new Chess());
  const [moves, setMoves] = useState([]);
  const [message, setMessage] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetchLesson();
  }, [id]);

  const fetchLesson = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/lessons/${id}`);
      const lessonData = response.data;
      setLesson(lessonData);
      const newGame = new Chess(lessonData.fen_position);
      setGame(newGame);
    } catch (error) {
      console.error('Ошибка загрузки урока:', error);
    }
  };

  const onDrop = (sourceSquare, targetSquare) => {
    try {
      const move = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      if (move === null) return false;

      const newMoves = [...moves, `${sourceSquare}${targetSquare}`];
      setMoves(newMoves);
      setGame(new Chess(game.fen()));
      checkProgress(newMoves);
      return true;
    } catch (error) {
      return false;
    }
  };

  const checkProgress = async (currentMoves) => {
    if (!lesson || !lesson.correct_moves) return;
    const correctMoves = lesson.correct_moves;
    
    if (currentMoves.length === correctMoves.length) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `http://localhost:5000/api/lessons/${id}/check`,
          { moves: currentMoves },
          { headers: { Authorization: `Bearer ${token}` }}
        );

        if (response.data.correct) {
          setMessage('🎉 Отлично! Урок пройден!');
          setCompleted(true);
        } else {
          setMessage('❌ Неправильно. Попробуйте еще раз.');
        }
      } catch (error) {
        console.error('Ошибка проверки урока:', error);
      }
    }
  };

  const resetLesson = () => {
    if (lesson) {
      const newGame = new Chess(lesson.fen_position);
      setGame(newGame);
      setMoves([]);
      setMessage('');
      setCompleted(false);
    }
  };

  if (!lesson) return <div className="loading">Загрузка...</div>;

  return (
    <div className="lesson-play">
      <div className="lesson-sidebar">
        <button onClick={() => navigate('/lessons')} className="btn-back">
          ← Назад к урокам
        </button>
        <h2>{lesson.title}</h2>
        <p className="lesson-description">{lesson.description}</p>
        
        {message && (
          <div className={`message ${completed ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        
        <div className="lesson-controls">
          <button onClick={resetLesson} className="btn-reset">🔄 Сбросить</button>
          {completed && (
            <button onClick={() => navigate('/lessons')} className="btn-next">
              Следующий урок →
            </button>
          )}
        </div>
        
        <div className="moves-list">
          <h4>Ваши ходы:</h4>
          <ul>
            {moves.map((move, index) => (
              <li key={index}>{index + 1}. {move}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="chessboard-container">
        <Chessboard position={game.fen()} onPieceDrop={onDrop} boardWidth={500} />
      </div>
    </div>
  );
}

export default LessonPlay;