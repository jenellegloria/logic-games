import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLevelProgress, resetProgress } from '../progress';

export default function Hub() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState({ level1: false, level2: false, level3: false });

  useEffect(() => {
    setProgress(getLevelProgress());
  }, []);

  const levels = [
    {
      num: 1,
      path: '/level1',
      title: 'The Symbols',
      description: 'Learn the five connectives. Translate language into logic.',
      unlocked: true,
      complete: progress.level1,
    },
    {
      num: 2,
      path: '/level2',
      title: 'The Truth',
      description: 'Build intuition for truth tables through real scenarios.',
      unlocked: progress.level1,
      complete: progress.level2,
    },
    {
      num: 3,
      path: '/level3',
      title: 'The World',
      description: 'Name this strange world. Build well-formed formulas from scratch.',
      unlocked: progress.level2,
      complete: progress.level3,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      {/* Title */}
      <div className="text-center mb-16">
        <h1 className="text-gray-200 text-4xl font-light tracking-widest mb-3">
          LOGIC GAMES
        </h1>
        <p className="text-gray-600 text-sm font-mono">SELECT CHAMBER</p>
      </div>

      {/* Level Cards */}
      <div className="flex flex-col gap-4 w-full max-w-md">
        {levels.map((level) => (
          <button
            key={level.num}
            onClick={() => level.unlocked && navigate(level.path)}
            disabled={!level.unlocked}
            className={`text-left p-6 rounded-lg border transition-all duration-200
              ${level.complete
                ? 'border-green-800 bg-green-950/30 hover:border-green-600'
                : level.unlocked
                  ? 'border-gray-700 bg-gray-900/50 hover:border-purple-600 hover:bg-gray-900'
                  : 'border-gray-800 bg-gray-900/20 cursor-not-allowed opacity-50'
              }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-mono text-xs">
                LEVEL {level.num}
              </span>
              {level.complete && (
                <span className="text-green-500 font-mono text-xs">COMPLETE ✓</span>
              )}
              {!level.unlocked && (
                <span className="text-gray-700 font-mono text-xs">LOCKED</span>
              )}
            </div>
            <h2 className={`text-xl mb-1 ${level.unlocked ? 'text-gray-200' : 'text-gray-600'}`}>
              {level.title}
            </h2>
            <p className={`text-sm ${level.unlocked ? 'text-gray-500' : 'text-gray-700'}`}>
              {level.description}
            </p>
          </button>
        ))}
      </div>

      {/* Reset button - only shows if any progress */}
      {(progress.level1 || progress.level2 || progress.level3) && (
        <button
          onClick={() => {
            resetProgress();
            setProgress({ level1: false, level2: false, level3: false });
          }}
          className="mt-12 text-gray-700 hover:text-gray-500 text-xs font-mono transition-colors"
        >
          reset progress
        </button>
      )}
    </div>
  );
}
