import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeLevel } from '../progress';

const LEVEL_3_NARRATIVE = [
  "The second door dissolves into light.",
  "You step through into a vast observatory.",
  "Stars wheel overhead. Unfamiliar constellations.",
  "The terminal here is different. Older.",
  "It hums with anticipation.",
];

const LEVEL_3_TERMINAL = [
  "You know the symbols.",
  "You understand truth.",
  "Now you must learn to name the world.",
  "We will show you what is true here.",
  "And you will learn to say it.",
];

const ATOMICS = [
  { letter: 'P', english: 'The signal is active', truthValue: true },
  { letter: 'Q', english: 'The outer door is sealed', truthValue: true },
  { letter: 'R', english: 'The core is stable', truthValue: false },
  { letter: 'S', english: 'Rescue is coming', truthValue: false },
  { letter: 'T', english: 'The atmosphere is breathable', truthValue: true },
];

const LEVEL_3_STEPS = [
  { type: 'introduce', atomicIndex: 0, narrative: "The first truth of this place:", terminalText: "Fact: The signal is active.", instruction: "We denote this as P." },
  { type: 'introduce', atomicIndex: 1, narrative: "The second truth:", terminalText: "Fact: The outer door is sealed.", instruction: "We denote this as Q." },
  { type: 'introduce', atomicIndex: 2, narrative: "But not all facts are true.", terminalText: "The core is NOT stable.", instruction: "The core being stable would be R. But it is false. So we write: ~R" },
  { type: 'introduce', atomicIndex: 3, narrative: "Another harsh truth:", terminalText: "Rescue is NOT coming.", instruction: "Rescue coming would be S. But it is false. So we write: ~S" },
  { type: 'introduce', atomicIndex: 4, narrative: "One small mercy:", terminalText: "Fact: The atmosphere is breathable.", instruction: "We denote this as T." },
  { type: 'build', prompt: "The signal is active AND the outer door is sealed.", answer: ['P', '∧', 'Q'], availableTiles: ['P', 'Q', 'R', '∧', '∨', '~'], hint: "Both P and Q are true. Connect them with 'and'." },
  { type: 'build', prompt: "The signal is active AND the core is NOT stable.", answer: ['P', '∧', '~', 'R'], availableTiles: ['P', 'R', '∧', '∨', '~'], hint: "P is true, R is false. How do we say 'R is false'?" },
  { type: 'build', promptSymbolic: "Q ∨ T", answer: ['Q', '∨', 'T'], availableTiles: ['Q', 'T', 'S', '∧', '∨', '~'], hint: "Translate the 'or' symbol." },
  { type: 'build', prompt: "The core is NOT stable AND rescue is NOT coming.", answer: ['~', 'R', '∧', '~', 'S'], availableTiles: ['R', 'S', 'P', '∧', '∨', '~', '~'], hint: "Both R and S are false. Negate each one, then connect with 'and'." },
  { type: 'build', prompt: "Either rescue isn't coming, or, the atmosphere is breathable", answer: ['~', 'S', '∨', 'T'], availableTiles: ['S', 'T', 'R', '∧', '∨', '~'], hint: "Negation comes before the atomic it negates." },
  { type: 'teach', narrative: "Sometimes, structure matters.", terminalText: "Consider: P ∧ Q ∨ R", instruction: "Does this mean (P ∧ Q) ∨ R? Or P ∧ (Q ∨ R)?\nWe use parentheses to be clear." },
  { type: 'build', prompt: "The signal is active, AND either the door is sealed or the atmosphere is breathable.", answer: ['P', '∧', '(', 'Q', '∨', 'T', ')'], availableTiles: ['P', 'Q', 'T', '∧', '∨', '(', ')'], hint: "The 'either...or' part should be grouped together." },
  { type: 'build', prompt: "Either the signal is active and the outer door is sealed, OR the core is not stable.", answer: ['(', 'P', '∧', 'Q', ')', '∨', '~', 'R'], availableTiles: ['P', 'Q', 'R', '∧', '∨', '~', '(', ')'], hint: "The conjunction is grouped, then we 'or' with the negation." },
  { type: 'build', prompt: "If the signal is active, then the outer door is sealed.", answer: ['P', '→', 'Q'], availableTiles: ['P', 'Q', 'R', '→', '∧', '∨'], hint: "Use the conditional arrow for 'if...then'." },
  { type: 'build', prompt: "If the core is not stable, then rescue is not coming.", answer: ['~', 'R', '→', '~', 'S'], availableTiles: ['R', 'S', 'P', '→', '∧', '~', '~'], hint: "Both the antecedent and consequent are negations." },
  { type: 'build', prompt: "If the signal is active and the atmosphere is breathable, then rescue is not coming.", answer: ['(', 'P', '∧', 'T', ')', '→', '~', 'S'], availableTiles: ['P', 'T', 'S', '→', '∧', '~', '(', ')'], hint: "The antecedent is a conjunction in parentheses." },
  { type: 'build', prompt: "The atmosphere is breathable if and only if the core is stable.", answer: ['T', '↔', 'R'], availableTiles: ['T', 'R', 'S', '↔', '→', '∧'], hint: "Use the biconditional for 'if and only if'." },
  { type: 'build', prompt: "If the signal is active or the door is sealed, then the atmosphere is breathable.", answer: ['(', 'P', '∨', 'Q', ')', '→', 'T'], availableTiles: ['P', 'Q', 'T', '→', '∨', '(', ')'], hint: "Group the disjunction as the antecedent." },
  { type: 'build', prompt: "Either it's not the case that (the signal is active and the outer door is sealed), OR the core is stable.", answer: ['~', '(', 'P', '∧', 'Q', ')', '∨', 'R'], availableTiles: ['P', 'Q', 'R', '∧', '∨', '~', '(', ')'], hint: "The negation applies to the entire conjunction, not just P." },
  { type: 'build', prompt: "The signal is active, and if the core is not stable then rescue is not coming.", answer: ['P', '∧', '(', '~', 'R', '→', '~', 'S', ')'], availableTiles: ['P', 'R', 'S', '∧', '→', '~', '~', '(', ')'], hint: "P is conjoined with a conditional. The conditional needs parentheses." },
];

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Level3() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('narrative');
  const [narrativePage, setNarrativePage] = useState(0);
  const [terminalPage, setTerminalPage] = useState(0);
  const [step, setStep] = useState(0);
  const [buildZone, setBuildZone] = useState([]);
  const [availableTiles, setAvailableTiles] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [knownAtomics, setKnownAtomics] = useState([]);
  const [showHint, setShowHint] = useState(false);

  const setupStep = (stepIndex) => {
    const s = LEVEL_3_STEPS[stepIndex];
    if (s?.type === 'build') {
      const tiles = s.availableTiles.map((content, idx) => ({
        id: `tile-${idx}-${content}-${Math.random()}`,
        content,
        type: ['∧', '∨', '→', '↔', '~'].includes(content) ? 'connective'
          : ['(', ')'].includes(content) ? 'paren' : 'atomic',
      }));
      setAvailableTiles(shuffleArray(tiles));
      setBuildZone([]);
      setFeedback(null);
      setShowHint(false);
    }
  };

  const advanceStep = () => {
    const next = step + 1;
    if (next >= LEVEL_3_STEPS.length) {
      completeLevel(3);
      setGameState('success');
      return;
    }
    setStep(next);
    setupStep(next);
  };

  const handleTileClick = (tile, from) => {
    if (feedback) return;
    if (from === 'available') {
      setBuildZone(prev => [...prev, tile]);
      setAvailableTiles(prev => prev.filter(t => t.id !== tile.id));
    } else {
      setAvailableTiles(prev => [...prev, tile]);
      setBuildZone(prev => prev.filter(t => t.id !== tile.id));
    }
  };

  const checkAnswer = () => {
    const s = LEVEL_3_STEPS[step];
    const built = buildZone.map(t => t.content);
    const isCorrect = JSON.stringify(built) === JSON.stringify(s.answer);
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    if (!isCorrect) {
      setTimeout(() => {
        setFeedback(null);
        setAvailableTiles(prev => [...prev, ...buildZone]);
        setBuildZone([]);
      }, 1500);
      return;
    }
    setTimeout(advanceStep, 1500);
  };

  if (gameState === 'narrative') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 cursor-pointer"
        onClick={() => {
          if (narrativePage < LEVEL_3_NARRATIVE.length - 1) setNarrativePage(narrativePage + 1);
          else setGameState('terminal');
        }}
      >
        <div className="max-w-lg w-full text-center">
          <button onClick={(e) => { e.stopPropagation(); navigate('/'); }} className="text-gray-700 hover:text-gray-500 text-xs font-mono mb-12 block mx-auto">← hub</button>
          <p className="text-gray-400 text-xl leading-relaxed">{LEVEL_3_NARRATIVE[narrativePage]}</p>
          <p className="text-gray-700 text-sm mt-12">click to continue</p>
        </div>
      </div>
    );
  }

  if (gameState === 'terminal') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 cursor-pointer"
        onClick={() => {
          if (terminalPage < LEVEL_3_TERMINAL.length - 1) setTerminalPage(terminalPage + 1);
          else { setStep(0); setupStep(0); setGameState('playing'); }
        }}
      >
        <div className="max-w-lg w-full">
          <div className="border border-green-900 rounded-lg p-8 bg-black shadow-lg shadow-green-900/20">
            <div className="flex items-center gap-2 mb-6 border-b border-green-900 pb-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-green-700 text-xs font-mono">TERMINAL ACTIVE</span>
            </div>
            <p className="text-green-400 text-lg font-mono leading-relaxed">
              {LEVEL_3_TERMINAL[terminalPage]}<span className="animate-pulse">_</span>
            </p>
          </div>
          <p className="text-gray-700 text-sm mt-8 text-center">click to continue</p>
        </div>
      </div>
    );
  }

  if (gameState === 'success') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <p className="text-green-400 text-2xl mb-4">The observatory falls silent.</p>
          <p className="text-gray-500 mb-8">You have named this world.</p>
          <div className="border border-green-900 rounded-lg p-6 bg-black mb-8">
            <p className="text-green-400 font-mono text-sm">LEVEL 3 COMPLETE<br/>FORMULAS BUILT: {LEVEL_3_STEPS.filter(s => s.type === 'build').length}<br/>ALL CHAMBERS CLEARED</p>
          </div>
          <p className="text-gray-600 italic mb-8">The signal has been answered.</p>
          <button onClick={() => navigate('/')} className="text-purple-400 hover:text-purple-300 transition-colors">Return to Hub</button>
        </div>
      </div>
    );
  }

  // Playing
  const currentStep = LEVEL_3_STEPS[step];

  if (currentStep?.type === 'introduce') {
    const atomic = ATOMICS[currentStep.atomicIndex];
    const isNegated = !atomic.truthValue;
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 cursor-pointer"
        onClick={() => {
          if (!knownAtomics.find(a => a.letter === atomic.letter)) {
            setKnownAtomics(prev => [...prev, atomic]);
          }
          advanceStep();
        }}
      >
        <div className="max-w-lg w-full text-center">
          <p className="text-gray-500 text-lg mb-8">{currentStep.narrative}</p>
          <div className="border border-green-900 rounded-lg p-6 bg-black mb-8">
            <p className="text-green-400 text-xl font-mono mb-4">{currentStep.terminalText}</p>
          </div>
          <div className="mb-8">
            <p className="text-gray-400 mb-4">{currentStep.instruction}</p>
            <div className="flex items-center justify-center gap-2">
              {isNegated && <span className="text-purple-400 text-5xl font-light">~</span>}
              <span className="text-blue-400 text-6xl font-light">{atomic.letter}</span>
            </div>
          </div>
          {knownAtomics.length > 0 && (
            <div className="border-t border-gray-800 pt-6 mt-6">
              <p className="text-gray-600 text-xs font-mono mb-3">KNOWN FACTS:</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {knownAtomics.map((a, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="text-blue-400 font-mono">{a.letter}</span>
                    <span className="text-gray-600"> = </span>
                    <span className="text-gray-400">{a.english}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="text-gray-700 text-sm mt-8">click to continue</p>
        </div>
      </div>
    );
  }

  if (currentStep?.type === 'teach') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 cursor-pointer" onClick={advanceStep}>
        <div className="max-w-lg w-full text-center">
          <p className="text-gray-400 text-xl mb-8">{currentStep.narrative}</p>
          <div className="border border-green-900 rounded-lg p-6 bg-black mb-8">
            <p className="text-green-400 text-xl font-mono mb-4">{currentStep.terminalText}</p>
          </div>
          <p className="text-gray-500 whitespace-pre-line">{currentStep.instruction}</p>
          <p className="text-gray-700 text-sm mt-8">click to continue</p>
        </div>
      </div>
    );
  }

  if (currentStep?.type === 'build') {
    const isSymbolsToEnglish = currentStep.promptSymbolic != null;
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col p-4">
        <div className="flex justify-center mb-4">
          <div className="flex gap-1">
            {LEVEL_3_STEPS.map((_, idx) => (
              <div key={idx} className={`w-2 h-2 rounded-full ${idx < step ? 'bg-green-600' : idx === step ? 'bg-purple-500' : 'bg-gray-800'}`} />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
          <div className="mb-4">
            <span className={`text-xs font-mono px-3 py-1 rounded-full border ${isSymbolsToEnglish ? 'text-amber-400 border-amber-800 bg-amber-900/20' : 'text-blue-400 border-blue-800 bg-blue-900/20'}`}>
              {isSymbolsToEnglish ? 'SYMBOLS → BUILD' : 'ENGLISH → BUILD'}
            </span>
          </div>
          <div className="mb-6 w-full text-center">
            <p className="text-gray-600 text-sm mb-3 font-mono">BUILD:</p>
            {isSymbolsToEnglish
              ? <p className="text-2xl text-purple-300 font-mono">{currentStep.promptSymbolic}</p>
              : <p className="text-xl text-gray-300">"{currentStep.prompt}"</p>
            }
          </div>
          <div className="mb-6 w-full">
            <div className="border border-gray-800 rounded-lg p-3 bg-gray-900/30">
              <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-xs">
                {ATOMICS.map((a) => (
                  <div key={a.letter}>
                    <span className="text-blue-400 font-mono">{a.letter}</span>
                    <span className="text-gray-600"> = </span>
                    <span className="text-gray-500">{a.english}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className={`rounded-lg p-6 mb-6 w-full min-h-20 border transition-colors
            ${feedback === 'correct' ? 'border-green-600 bg-green-900/10'
              : feedback === 'incorrect' ? 'border-red-600 bg-red-900/10'
              : 'border-gray-800 hover:border-purple-900'}`}
          >
            <div className="flex flex-wrap gap-2 justify-center items-center min-h-12">
              {buildZone.length === 0 && <p className="text-gray-700 text-sm">click tiles to build</p>}
              {buildZone.map((tile) => (
                <button key={tile.id} onClick={() => handleTileClick(tile, 'build')} disabled={!!feedback}
                  className={`px-4 py-3 rounded border transition-all
                    ${tile.type === 'connective' ? 'bg-purple-900/50 border-purple-600 text-purple-300 font-bold text-2xl'
                      : tile.type === 'paren' ? 'bg-gray-800 border-gray-600 text-gray-300 font-bold text-2xl'
                      : 'bg-blue-900/50 border-blue-600 text-blue-300 font-bold text-xl'}
                    ${feedback ? 'opacity-60' : 'cursor-pointer hover:scale-105'}`}
                >{tile.content}</button>
              ))}
            </div>
            {feedback && (
              <p className={`text-center mt-4 font-mono ${feedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
                {feedback === 'correct' ? 'CORRECT' : 'TRY AGAIN'}
              </p>
            )}
          </div>
          <div className="rounded-lg p-4 w-full border border-gray-900 mb-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {availableTiles.map((tile) => (
                <button key={tile.id} onClick={() => handleTileClick(tile, 'available')} disabled={!!feedback}
                  className={`px-4 py-3 rounded border transition-all
                    ${tile.type === 'connective' ? 'bg-purple-900/50 border-purple-600 text-purple-300 font-bold text-2xl'
                      : tile.type === 'paren' ? 'bg-gray-800 border-gray-600 text-gray-300 font-bold text-2xl'
                      : 'bg-blue-900/50 border-blue-600 text-blue-300 font-bold text-xl'}
                    ${feedback ? 'opacity-60' : 'cursor-pointer hover:scale-105'}`}
                >{tile.content}</button>
              ))}
            </div>
          </div>
          {!feedback && (
            <button onClick={() => setShowHint(!showHint)} className="text-gray-600 hover:text-gray-400 text-sm font-mono mb-4">
              {showHint ? 'hide hint' : 'show hint'}
            </button>
          )}
          {showHint && !feedback && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-4">
              <p className="text-gray-500 text-sm italic">{currentStep.hint}</p>
            </div>
          )}
          <button onClick={checkAnswer} disabled={buildZone.length === 0 || !!feedback}
            className={`font-mono py-3 px-8 rounded border
              ${buildZone.length === 0 || feedback ? 'border-gray-800 text-gray-700 cursor-not-allowed' : 'border-purple-600 text-purple-400 hover:bg-purple-900/20'}`}
          >Submit</button>
        </div>
      </div>
    );
  }

  return null;
}
