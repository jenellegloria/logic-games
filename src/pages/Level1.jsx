import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeLevel } from '../progress';

const CONNECTIVE_LESSONS = [
  { symbol: '∧', english: 'and', example: 'The stars are bright and the night is cold.' },
  { symbol: '∨', english: 'or', example: 'The path leads left or the path leads right.' },
  { symbol: '→', english: 'if … then', example: 'If you speak truth, then the door will open.' },
  { symbol: '↔', english: 'if and only if', example: 'You survive if and only if you learn.' },
  { symbol: '~', english: 'not', example: 'The signal is not random.' },
];

const NARRATIVE_PAGES = [
  "After an unknown span of time in hyperspace, your vessel falls silent.",
  "You drift into a dreamless sleep.",
  "…",
  "You awaken.",
  "A dim room. Cold air. The hum of ancient machinery.",
  "Before you: a terminal, its screen flickering to life.",
  "Behind you: a sealed door.",
];

const TERMINAL_PAGES = [
  "Signal received.",
  "Visitor detected.",
  "This world is in peril. We require assistance.",
  "But first, you must learn to speak as we do.",
  "We communicate now in pure symbolic form.",
  "Structure without substance. Relation without reference.",
  "We will teach you.",
  "First, you must learn these symbols…",
];

const CONNECTIVES = [
  { symbol: '~', name: 'negation' },
  { symbol: '∧', name: 'conjunction' },
  { symbol: '∨', name: 'disjunction' },
  { symbol: '→', name: 'conditional' },
  { symbol: '↔', name: 'biconditional' },
];

const LEVEL_1_SENTENCES = [
  { english: "It is raining and it is cold", parts: ["It is raining", "It is cold"], connective: "∧", structure: "binary" },
  { english: "The cat is sleeping or the dog is barking", parts: ["The cat is sleeping", "The dog is barking"], connective: "∨", structure: "binary" },
  { english: "It is not sunny", parts: ["It is sunny"], connective: "~", structure: "negation" },
  { english: "If it is Tuesday then we have class", parts: ["It is Tuesday", "We have class"], connective: "→", structure: "binary" },
  { english: "The light is on if and only if the switch is up", parts: ["The light is on", "The switch is up"], connective: "↔", structure: "binary" },
  { english: "I am not hungry", parts: ["I am hungry"], connective: "~", structure: "negation" },
  { english: "The movie is funny and the popcorn is good", parts: ["The movie is funny", "The popcorn is good"], connective: "∧", structure: "binary" },
  { english: "If you study then you will pass", parts: ["You study", "You will pass"], connective: "→", structure: "binary" },
  { english: "We go to the beach or we stay home", parts: ["We go to the beach", "We stay home"], connective: "∨", structure: "binary" },
  { english: "You get dessert if and only if you eat dinner", parts: ["You get dessert", "You eat dinner"], connective: "↔", structure: "binary" },
];

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Level1() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('nameInput');
  const [playerName, setPlayerName] = useState('');
  const [narrativePage, setNarrativePage] = useState(0);
  const [terminalPage, setTerminalPage] = useState(0);
  const [lessonPage, setLessonPage] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [buildZone, setBuildZone] = useState([]);
  const [availableTiles, setAvailableTiles] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [sentences, setSentences] = useState([]);
  const [results, setResults] = useState([]);

  const startGame = () => {
    const shuffledSentences = shuffleArray(LEVEL_1_SENTENCES);
    setSentences(shuffledSentences);
    setCurrentQuestion(0);
    setScore(0);
    setResults([]);
    setGameState('playing');
    setupQuestion(shuffledSentences[0]);
  };

  const setupQuestion = (sentence) => {
    const phraseTiles = sentence.parts.map((part, idx) => ({
      id: `phrase-${idx}`,
      type: 'phrase',
      content: part,
    }));
    const connectiveTiles = CONNECTIVES.map((conn) => ({
      id: `conn-${conn.symbol}`,
      type: 'connective',
      content: conn.symbol,
    }));
    setAvailableTiles(shuffleArray([...phraseTiles, ...connectiveTiles]));
    setBuildZone([]);
    setFeedback(null);
  };

  const handleTileClick = (tile, fromZone) => {
    if (feedback) return;
    if (fromZone === 'available') {
      setBuildZone([...buildZone, tile]);
      setAvailableTiles(availableTiles.filter(t => t.id !== tile.id));
    } else {
      setAvailableTiles([...availableTiles, tile]);
      setBuildZone(buildZone.filter(t => t.id !== tile.id));
    }
  };

  const checkAnswer = () => {
    const sentence = sentences[currentQuestion];
    let isCorrect = false;
    if (sentence.structure === 'negation') {
      isCorrect = buildZone.length === 2 &&
        buildZone[0].content === '~' &&
        buildZone[1].content === sentence.parts[0];
    } else {
      isCorrect = buildZone.length === 3 &&
        buildZone[0].content === sentence.parts[0] &&
        buildZone[1].content === sentence.connective &&
        buildZone[2].content === sentence.parts[1];
    }
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    if (!isCorrect) {
      setTimeout(() => setGameState('failure'), 1500);
      return;
    }
    setScore(score + 1);
    setResults([...results, true]);
    setTimeout(() => {
      if (currentQuestion < sentences.length - 1) {
        const nextQ = currentQuestion + 1;
        setCurrentQuestion(nextQ);
        setupQuestion(sentences[nextQ]);
      } else {
        completeLevel(1);
        setGameState('success');
      }
    }, 1500);
  };

  const Tile = ({ tile, zone }) => (
    <button
      onClick={() => handleTileClick(tile, zone)}
      className={`px-4 py-3 rounded select-none transition-all duration-150 hover:scale-105 border
        ${tile.type === 'connective'
          ? 'bg-purple-900/50 border-purple-600 text-purple-300 font-bold text-2xl min-w-14 text-center'
          : 'bg-gray-900 border-gray-700 text-gray-300'}
        ${feedback ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
    >
      {tile.content}
    </button>
  );

  if (gameState === 'nameInput') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <button onClick={() => navigate('/')} className="text-gray-700 hover:text-gray-500 text-xs font-mono mb-12 block mx-auto">← hub</button>
          <p className="text-gray-500 mb-6 text-lg">What are you called, traveler?</p>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && playerName.trim() && setGameState('narrative')}
            maxLength={20}
            className="bg-transparent border-b-2 border-gray-700 text-white text-center text-2xl py-2 px-4 mb-8 focus:outline-none focus:border-purple-500 w-64"
            autoFocus
          />
          {playerName.trim() && (
            <div>
              <button onClick={() => setGameState('narrative')} className="text-purple-400 hover:text-purple-300 transition-colors text-lg">
                Begin
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'narrative') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 cursor-pointer"
        onClick={() => {
          if (narrativePage < NARRATIVE_PAGES.length - 1) setNarrativePage(narrativePage + 1);
          else setGameState('terminal');
        }}
      >
        <div className="max-w-lg w-full text-center">
          <p className="text-gray-400 text-xl leading-relaxed">{NARRATIVE_PAGES[narrativePage]}</p>
          <p className="text-gray-700 text-sm mt-12">click to continue</p>
        </div>
      </div>
    );
  }

  if (gameState === 'terminal') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 cursor-pointer"
        onClick={() => {
          if (terminalPage < TERMINAL_PAGES.length - 1) setTerminalPage(terminalPage + 1);
          else setGameState('lesson');
        }}
      >
        <div className="max-w-lg w-full">
          <div className="border border-green-900 rounded-lg p-8 bg-black shadow-lg shadow-green-900/20">
            <div className="flex items-center gap-2 mb-6 border-b border-green-900 pb-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-green-700 text-xs font-mono">TERMINAL ACTIVE</span>
            </div>
            <p className="text-green-400 text-lg font-mono leading-relaxed">
              {TERMINAL_PAGES[terminalPage]}<span className="animate-pulse">_</span>
            </p>
          </div>
          <p className="text-gray-700 text-sm mt-8 text-center">click to continue</p>
        </div>
      </div>
    );
  }

  if (gameState === 'lesson') {
    const lesson = CONNECTIVE_LESSONS[lessonPage];
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 cursor-pointer"
        onClick={() => {
          if (lessonPage < CONNECTIVE_LESSONS.length - 1) setLessonPage(lessonPage + 1);
          else startGame();
        }}
      >
        <div className="max-w-lg w-full text-center">
          <div className="mb-12">
            <p className="text-purple-400 text-8xl font-light mb-4">{lesson.symbol}</p>
            <p className="text-gray-500 text-xl">{lesson.english}</p>
          </div>
          <p className="text-gray-600 text-lg italic">"{lesson.example}"</p>
          <div className="flex justify-center gap-2 mt-12">
            {CONNECTIVE_LESSONS.map((_, idx) => (
              <div key={idx} className={`w-2 h-2 rounded-full ${idx === lessonPage ? 'bg-purple-500' : 'bg-gray-800'}`} />
            ))}
          </div>
          <p className="text-gray-700 text-sm mt-8">click to continue</p>
        </div>
      </div>
    );
  }

  if (gameState === 'success') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <p className="text-green-400 text-2xl mb-4">The door opens.</p>
          <p className="text-gray-500 mb-8">You have learned well, {playerName}.</p>
          <div className="border border-green-900 rounded-lg p-6 bg-black mb-8">
            <p className="text-green-400 font-mono text-sm">
              LEVEL 1 COMPLETE<br/>SYMBOLS ACQUIRED: 5<br/>ACCURACY: 100%
            </p>
          </div>
          <p className="text-gray-600 italic mb-8">The next chamber awaits...</p>
          <button onClick={() => navigate('/')} className="text-purple-400 hover:text-purple-300 transition-colors">
            Return to Hub
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'failure') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <p className="text-red-400 text-2xl mb-4">The key shatters.</p>
          <p className="text-gray-500 mb-8">The door remains sealed.</p>
          <p className="text-gray-600 italic mb-8">You must prove complete mastery.</p>
          <button onClick={startGame} className="text-purple-400 hover:text-purple-300 transition-colors">Try Again</button>
        </div>
      </div>
    );
  }

  const currentSentence = sentences[currentQuestion];
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="text-gray-600 font-mono text-sm">{currentQuestion + 1}/10</div>
        <div className="flex gap-1">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className={`w-2 h-2 rounded-full ${
              idx < currentQuestion ? results[idx] ? 'bg-green-600' : 'bg-red-600'
              : idx === currentQuestion ? 'bg-purple-500' : 'bg-gray-800'
            }`} />
          ))}
        </div>
        <div className="text-gray-600 font-mono text-sm">{score}/10</div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        <div className="mb-8 w-full text-center">
          <p className="text-gray-600 text-sm mb-3 font-mono">TRANSLATE:</p>
          <p className="text-2xl text-gray-300">"{currentSentence?.english}"</p>
        </div>
        <div className={`rounded-lg p-6 mb-8 w-full min-h-24 border transition-colors
          ${feedback === 'correct' ? 'border-green-600 bg-green-900/10'
            : feedback === 'incorrect' ? 'border-red-600 bg-red-900/10'
            : 'border-gray-800 hover:border-purple-900'}`}
        >
          <div className="flex flex-wrap gap-3 justify-center items-center min-h-12">
            {buildZone.length === 0 && <p className="text-gray-700 text-sm">click tiles to build your formula</p>}
            {buildZone.map((tile) => <Tile key={tile.id} tile={tile} zone="build" />)}
          </div>
          {feedback && (
            <p className={`text-center mt-4 font-mono ${feedback === 'correct' ? 'text-green-500' : 'text-red-500'}`}>
              {feedback === 'correct' ? 'CORRECT' : 'INCORRECT'}
            </p>
          )}
        </div>
        <div className="rounded-lg p-6 w-full border border-gray-900">
          <div className="flex flex-wrap gap-3 justify-center">
            {availableTiles.map((tile) => <Tile key={tile.id} tile={tile} zone="available" />)}
          </div>
        </div>
        <button
          onClick={checkAnswer}
          disabled={buildZone.length === 0 || feedback !== null}
          className={`mt-8 font-mono py-3 px-8 rounded transition-all border
            ${buildZone.length === 0 || feedback !== null
              ? 'border-gray-800 text-gray-700 cursor-not-allowed'
              : 'border-purple-600 text-purple-400 hover:bg-purple-900/20'}`}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
