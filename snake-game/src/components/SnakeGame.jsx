// src/components/SnakeGame.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 }
];
const INITIAL_DIRECTION = 'RIGHT';
const GAME_SPEED = 150;

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 10 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const gameLoopRef = useRef();

  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * (GRID_SIZE - 1)) + 1,
        y: Math.floor(Math.random() * (GRID_SIZE - 1)) + 1
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    setFood(newFood);
  }, [snake]);

  const handleKeyPress = useCallback((event) => {
    const key = event.key.toLowerCase();
    
    if (key === 'p') {
      setIsPaused(prev => !prev);
      return;
    }

    if (key === 'r' && gameOver) {
      resetGame();
      return;
    }

    const directions = {
      arrowup: 'UP',
      arrowdown: 'DOWN',
      arrowleft: 'LEFT',
      arrowright: 'RIGHT',
      w: 'UP',
      s: 'DOWN',
      a: 'LEFT',
      d: 'RIGHT'
    };

    if (directions[key]) {
      const newDirection = directions[key];
      const opposites = {
        UP: 'DOWN',
        DOWN: 'UP',
        LEFT: 'RIGHT',
        RIGHT: 'LEFT'
      };

      if (opposites[newDirection] !== direction) {
        setDirection(newDirection);
      }
    }
  }, [direction, gameOver]);

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    const head = { ...snake[0] };
    switch (direction) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
      default:
        break;
    }

    // Check collision with walls (matching the visual border)
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      setGameOver(true);
      return;
    }

    // Check collision with self
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true);
      return;
    }

    const newSnake = [head];
    const ateFood = head.x === food.x && head.y === food.y;

    if (ateFood) {
      setScore(prev => prev + 1);
      generateFood();
    }

    // Add rest of the snake body
    for (let i = 0; i < snake.length - (ateFood ? 0 : 1); i++) {
      newSnake.push({ ...snake[i] });
    }

    setSnake(newSnake);
  }, [snake, direction, food, gameOver, isPaused, generateFood]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    generateFood();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    gameLoopRef.current = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameLoopRef.current);
  }, [moveSnake]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <div className={`flex flex-col items-center justify-center w-full max-w-lg mx-auto p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="flex justify-between w-full mb-4">
        <div className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
          Score: {score}
        </div>
        <button 
          onClick={toggleDarkMode}
          className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}`}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      
      <div 
        className={`relative border-4 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-green-100 border-green-800'
        }`}
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE
        }}
      >
        {/* Snake */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className={`absolute ${
              isDarkMode ? 'bg-green-400' : 'bg-green-800'
            }`}
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: segment.x * CELL_SIZE + 1,
              top: segment.y * CELL_SIZE + 1
            }}
          />
        ))}
        
        {/* Food */}
        <div
          className="absolute bg-red-600"
          style={{
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
            left: food.x * CELL_SIZE + 1,
            top: food.y * CELL_SIZE + 1,
            borderRadius: '50%'
          }}
        />

        {/* Border walls */}
        <div className={`absolute inset-0 border border-dashed ${
          isDarkMode ? 'border-gray-600' : 'border-green-800'
        }`} style={{ margin: CELL_SIZE }} />
      </div>
      
      {gameOver && (
        <div className={`mt-4 text-xl font-bold ${
          isDarkMode ? 'text-red-400' : 'text-red-600'
        }`}>
          Game Over! Press R to restart
        </div>
      )}
      
      <div className={`mt-4 text-sm ${
        isDarkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        Controls: Arrow keys or WASD to move | P to pause | R to restart
      </div>
    </div>
  );
};

export default SnakeGame;