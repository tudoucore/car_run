import React, { useState, useEffect, useCallback } from 'react';
import { Game3D } from './components/Game3D';
import { UIOverlay } from './components/UIOverlay';
import { GameStatus, MAX_SPEED, MIN_SPEED } from './types';
import { getRaceAnalysis } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [analysis, setAnalysis] = useState<string | null>(null);

  // Input State (Passed to Game3D)
  const [inputState, setInputState] = useState({ x: 0, speed: MIN_SPEED }); // x: -1 to 1 (lane position), speed: current speed
  const [keysPressed, setKeysPressed] = useState({ left: false, right: false, up: false, down: false });

  // Keyboard Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') setKeysPressed(p => ({ ...p, left: true }));
      if (e.key === 'ArrowRight' || e.key === 'd') setKeysPressed(p => ({ ...p, right: true }));
      if (e.key === 'ArrowUp' || e.key === 'w') setKeysPressed(p => ({ ...p, up: true }));
      if (e.key === 'ArrowDown' || e.key === 's') setKeysPressed(p => ({ ...p, down: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') setKeysPressed(p => ({ ...p, left: false }));
      if (e.key === 'ArrowRight' || e.key === 'd') setKeysPressed(p => ({ ...p, right: false }));
      if (e.key === 'ArrowUp' || e.key === 'w') setKeysPressed(p => ({ ...p, up: false }));
      if (e.key === 'ArrowDown' || e.key === 's') setKeysPressed(p => ({ ...p, down: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game Loop Update for Input Logic
  useEffect(() => {
    if (status !== GameStatus.PLAYING) return;

    let animationFrameId: number;

    const updateInput = () => {
      setInputState(prev => {
        let newX = prev.x;
        let newSpeed = prev.speed;

        // Steering
        if (keysPressed.left) newX -= 0.05;
        if (keysPressed.right) newX += 0.05;
        // Clamp X
        newX = Math.max(-1.5, Math.min(1.5, newX));

        // Acceleration
        if (keysPressed.up) newSpeed += 0.01;
        else if (keysPressed.down) newSpeed -= 0.02;
        else newSpeed -= 0.005; // Friction

        // Clamp Speed
        newSpeed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, newSpeed));

        return { x: newX, speed: newSpeed };
      });

      animationFrameId = requestAnimationFrame(updateInput);
    };

    updateInput();
    return () => cancelAnimationFrame(animationFrameId);
  }, [keysPressed, status]);

  // Touch/Button Input Handler (Simulates keys)
  const handleTouchInput = useCallback((type: 'left' | 'right' | 'forward' | 'backward', active: boolean) => {
      setKeysPressed(prev => {
          const newState = { ...prev };
          if (type === 'left') newState.left = active;
          if (type === 'right') newState.right = active;
          if (type === 'forward') newState.up = active;
          if (type === 'backward') newState.down = active;
          return newState;
      });
  }, []);

  const startGame = () => {
    setScore(0);
    setAnalysis(null);
    setInputState({ x: 0, speed: MIN_SPEED });
    setKeysPressed({ left: false, right: false, up: false, down: false });
    setStatus(GameStatus.PLAYING);
  };

  const gameOver = async (finalScore: number) => {
    if (status === GameStatus.GAME_OVER) return;
    
    setStatus(GameStatus.GAME_OVER);
    if (finalScore > highScore) setHighScore(finalScore);

    // Call Gemini for analysis
    const comment = await getRaceAnalysis(finalScore, inputState.speed);
    setAnalysis(comment);
  };

  return (
    <div className="w-full h-screen relative overflow-hidden bg-black">
      <div className="scanline"></div>
      
      <Game3D 
        status={status} 
        onGameOver={gameOver}
        onScoreUpdate={setScore}
        inputState={inputState}
      />
      
      <UIOverlay 
        status={status}
        score={score}
        highScore={highScore}
        analysis={analysis}
        onStart={startGame}
        onRestart={startGame}
        handleInput={handleTouchInput}
      />
    </div>
  );
};

export default App;