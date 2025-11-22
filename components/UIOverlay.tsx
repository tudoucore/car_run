import React from 'react';
import { GameStatus } from '../types';

interface UIOverlayProps {
  status: GameStatus;
  score: number;
  highScore: number;
  analysis: string | null;
  onStart: () => void;
  onRestart: () => void;
  handleInput: (type: 'left' | 'right' | 'forward' | 'backward', active: boolean) => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({
  status,
  score,
  highScore,
  analysis,
  onStart,
  onRestart,
  handleInput
}) => {

  const btnClass = "w-20 h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-400 backdrop-blur-sm active:bg-cyan-400/50 touch-none select-none flex items-center justify-center transition-all shadow-[0_0_15px_rgba(6,182,212,0.5)]";
  const iconClass = "text-cyan-400 text-3xl font-bold";

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between">
      
      {/* Top Bar HUD */}
      <div className="w-full p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
        <div className="text-cyan-400 font-mono">
          <div className="text-xs opacity-70">SCORE</div>
          <div className="text-4xl font-black tracking-tighter shadow-cyan-glow">{score.toString().padStart(6, '0')}</div>
        </div>
        <div className="text-pink-500 font-mono text-right">
          <div className="text-xs opacity-70">HIGH SCORE</div>
          <div className="text-2xl font-bold">{highScore.toString().padStart(6, '0')}</div>
        </div>
      </div>

      {/* Menus (Pointer Events Enabled) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
        {status === GameStatus.MENU && (
          <div className="bg-black/80 p-8 rounded-xl border border-cyan-500/30 backdrop-blur-md text-center max-w-md mx-4 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 mb-2 tracking-tighter italic transform -skew-x-12">
              NEON DRIFT
            </h1>
            <p className="text-gray-400 mb-8 font-mono text-sm">AVOID TRAFFIC. SURVIVE.</p>
            <button
              onClick={onStart}
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-lg uppercase tracking-widest rounded transition-all shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:scale-105"
            >
              Start Engine
            </button>
            <div className="mt-6 text-xs text-gray-600 font-mono">
              WASD / Arrows to drive
            </div>
          </div>
        )}

        {status === GameStatus.GAME_OVER && (
          <div className="bg-black/90 p-8 rounded-xl border border-pink-500/30 backdrop-blur-md text-center max-w-md mx-4 shadow-[0_0_50px_rgba(236,72,153,0.2)]">
            <h2 className="text-4xl font-black text-pink-500 mb-4">CRASHED</h2>
            <div className="mb-6">
              <div className="text-gray-400 text-xs">FINAL SCORE</div>
              <div className="text-3xl text-white font-mono">{score}</div>
            </div>
            
            {/* Gemini Analysis Section */}
            <div className="mb-6 p-4 bg-gray-900/50 rounded border border-gray-700">
                <div className="text-xs text-cyan-400 mb-1 uppercase tracking-widest">Crew Chief AI</div>
                {analysis ? (
                   <p className="text-sm text-gray-300 italic font-mono leading-relaxed">"{analysis}"</p>
                ) : (
                   <div className="flex justify-center items-center space-x-1 h-6">
                        <div className="w-1 h-1 bg-cyan-500 animate-bounce delay-0"></div>
                        <div className="w-1 h-1 bg-cyan-500 animate-bounce delay-100"></div>
                        <div className="w-1 h-1 bg-cyan-500 animate-bounce delay-200"></div>
                   </div>
                )}
            </div>

            <button
              onClick={onRestart}
              className="px-8 py-3 bg-pink-600 hover:bg-pink-500 text-white font-bold text-lg uppercase tracking-widest rounded transition-all shadow-[0_0_20px_rgba(236,72,153,0.6)]"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* On-Screen Controls (Only visible when playing) */}
      {status === GameStatus.PLAYING && (
        <div className="w-full p-6 pb-12 flex justify-between items-end pointer-events-auto">
           {/* Directional */}
           <div className="flex gap-4">
              <button 
                className={btnClass}
                onPointerDown={() => handleInput('left', true)}
                onPointerUp={() => handleInput('left', false)}
                onPointerLeave={() => handleInput('left', false)}
              >
                <span className={iconClass}>←</span>
              </button>
              <button 
                className={btnClass}
                onPointerDown={() => handleInput('right', true)}
                onPointerUp={() => handleInput('right', false)}
                onPointerLeave={() => handleInput('right', false)}
              >
                <span className={iconClass}>→</span>
              </button>
           </div>

           {/* Gas/Brake */}
           <div className="flex gap-4 flex-col-reverse">
              <button 
                 className={`${btnClass} bg-pink-500/20 border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.5)]`}
                 onPointerDown={() => handleInput('backward', true)}
                 onPointerUp={() => handleInput('backward', false)}
                 onPointerLeave={() => handleInput('backward', false)}
               >
                 <span className="text-pink-400 text-xs font-bold">BRAKE</span>
               </button>
              <button 
                className={`${btnClass} bg-green-500/20 border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)] h-24`}
                onPointerDown={() => handleInput('forward', true)}
                onPointerUp={() => handleInput('forward', false)}
                onPointerLeave={() => handleInput('forward', false)}
              >
                <span className="text-green-400 text-xs font-bold">GAS</span>
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
