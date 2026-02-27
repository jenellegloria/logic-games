import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeLevel } from '../progress';

const TRUTH_TABLE_LESSONS = [
  {
    symbol: '~', name: 'negation', english: 'not', type: 'unary',
    intro: "Let's build intuition for negation (~).",
    scenarios: [
      { setup: 'Suppose it is TRUE that "It is raining."', question: 'What is the truth value of: ~(It is raining)?', p: true, result: false, correctExplanation: 'If it IS raining, then "it is NOT raining" must be false.', wrongExplanation: 'Think about it: if it really IS raining right now, can "it is NOT raining" be true? No — negation flips the truth value. TRUE becomes FALSE.' },
      { setup: 'Now suppose it is FALSE that "The door is locked."', question: 'What is the truth value of: ~(The door is locked)?', p: false, result: true, correctExplanation: 'If the door is NOT locked, then "it is NOT the case that the door is locked" is true.', wrongExplanation: 'If the door is NOT locked (false), then saying "it is NOT locked" is accurate — that\'s true! Negation flips FALSE to TRUE.' },
    ],
    summary: 'Negation (~) simply flips the truth value. TRUE becomes FALSE, and FALSE becomes TRUE.',
  },
  {
    symbol: '∧', name: 'conjunction', english: 'and', type: 'binary',
    intro: 'Now let\'s explore conjunction (∧) — the word "and."',
    scenarios: [
      { setup: 'Suppose: "It is sunny" is TRUE, and "It is warm" is TRUE.', question: 'What is the truth value of: (It is sunny) ∧ (It is warm)?', p: true, q: true, result: true, correctExplanation: 'Both parts are true, so "sunny AND warm" is true.', wrongExplanation: 'When BOTH parts are true, the whole "and" statement is true.' },
      { setup: 'Suppose: "I have coffee" is TRUE, but "I have tea" is FALSE.', question: 'What is the truth value of: (I have coffee) ∧ (I have tea)?', p: true, q: false, result: false, correctExplanation: 'You have coffee but NOT tea, so "coffee AND tea" is false.', wrongExplanation: 'For "and" to be true, BOTH parts must be true.' },
      { setup: 'Suppose: "The cat is sleeping" is FALSE, but "The dog is sleeping" is TRUE.', question: 'What is the truth value of: (The cat is sleeping) ∧ (The dog is sleeping)?', p: false, q: true, result: false, correctExplanation: "The cat isn't sleeping, so \"cat AND dog sleeping\" is false.", wrongExplanation: 'Even though the dog IS sleeping, the cat isn\'t. For "and" to be true, BOTH must be true.' },
      { setup: 'Suppose: "I speak French" is FALSE, and "I speak German" is FALSE.', question: 'What is the truth value of: (I speak French) ∧ (I speak German)?', p: false, q: false, result: false, correctExplanation: 'Neither is true, so "French AND German" is definitely false.', wrongExplanation: "You don't speak French, and you don't speak German. Clearly false." },
    ],
    summary: 'Conjunction (∧) is only TRUE when BOTH parts are true. Any false part makes the whole statement false.',
  },
  {
    symbol: '∨', name: 'disjunction', english: 'or', type: 'binary',
    intro: 'Let\'s explore disjunction (∨) — the word "or."',
    scenarios: [
      { setup: 'Suppose: "I\'ll have cake" is TRUE, and "I\'ll have ice cream" is TRUE.', question: 'What is the truth value of: (cake) ∨ (ice cream)?', p: true, q: true, result: true, correctExplanation: "You're having both! \"Cake or ice cream\" is definitely satisfied.", wrongExplanation: 'In logic, "or" means "at least one." You\'re having both, so it\'s true.' },
      { setup: 'Suppose: "I passed math" is TRUE, but "I passed history" is FALSE.', question: 'What is the truth value of: (passed math) ∨ (passed history)?', p: true, q: false, result: true, correctExplanation: 'You passed math, so "math or history" is true.', wrongExplanation: '"Or" only needs ONE part to be true.' },
      { setup: 'Suppose: "It\'s Monday" is FALSE, but "It\'s a weekday" is TRUE.', question: 'What is the truth value of: (Monday) ∨ (weekday)?', p: false, q: true, result: true, correctExplanation: "It's a weekday, so \"Monday or weekday\" is true.", wrongExplanation: "It's not Monday, but it IS a weekday. \"Or\" just needs one to be true." },
      { setup: 'Suppose: "I own a boat" is FALSE, and "I own a plane" is FALSE.', question: 'What is the truth value of: (boat) ∨ (plane)?', p: false, q: false, result: false, correctExplanation: "You own neither, so \"boat or plane\" is false.", wrongExplanation: '"Or" needs at least one true part. You have neither.' },
    ],
    summary: 'Disjunction (∨) is TRUE when AT LEAST ONE part is true. It\'s only false when BOTH parts are false.',
  },
  {
    symbol: '→', name: 'conditional', english: 'if...then', type: 'binary',
    intro: 'Now for the conditional (→) — "if...then" statements.',
    scenarios: [
      { setup: 'I promise: "If it rains, I will bring an umbrella."\nSuppose: "It rains" is TRUE, and "I bring an umbrella" is TRUE.', question: 'Did I keep my promise? Is (rains → umbrella) true?', p: true, q: true, result: true, correctExplanation: 'It rained, and you brought an umbrella. Promise kept!', wrongExplanation: 'I said IF it rains, THEN umbrella. It rained, I brought one. Promise kept!' },
      { setup: 'I promise: "If you finish dinner, you get dessert."\nSuppose: "Finish dinner" is TRUE, but "Get dessert" is FALSE.', question: 'Did I keep my promise? Is (dinner → dessert) true?', p: true, q: false, result: false, correctExplanation: 'You finished dinner but got no dessert. Promise broken!', wrongExplanation: 'I promised dessert IF you finished dinner. You finished, but no dessert? I lied. FALSE.' },
      { setup: 'I promise: "If you clean your room, you can play games."\nSuppose: "Clean room" is FALSE, but "Play games" is TRUE.', question: 'Did I honor my promise? Is (clean → games) true?', p: false, q: true, result: true, correctExplanation: "You didn't clean, but I let you play anyway. I never said you COULDN'T play otherwise!", wrongExplanation: "I only promised games IF you cleaned. You didn't clean, but I let you play anyway — I'm just being generous. No promise broken." },
      { setup: 'I promise: "If you score 100%, I\'ll buy pizza."\nSuppose: "Score 100%" is FALSE, and "Buy pizza" is FALSE.', question: "Did I keep my promise? Is (100% → pizza) true?", p: false, q: false, result: true, correctExplanation: "You didn't score 100%, so my promise doesn't apply. I'm off the hook!", wrongExplanation: "I only promised pizza IF you scored 100%. You didn't, so no promise was broken — true!" },
    ],
    summary: 'The conditional (→) is only FALSE when the first part is TRUE but the second part is FALSE. That\'s a broken promise.',
  },
  {
    symbol: '↔', name: 'biconditional', english: 'if and only if', type: 'binary',
    intro: 'Finally, the biconditional (↔) — "if and only if."',
    scenarios: [
      { setup: 'The rule: "The alarm sounds IF AND ONLY IF there\'s an intruder."\nSuppose: "Intruder" is TRUE, and "Alarm sounds" is TRUE.', question: 'Is the system working correctly? Is (intruder ↔ alarm) true?', p: true, q: true, result: true, correctExplanation: 'Intruder present, alarm sounding. System works!', wrongExplanation: '"If and only if" means they must match. Intruder? Yes. Alarm? Yes. They match — true!' },
      { setup: 'The rule: "You pass IF AND ONLY IF you score above 60."\nSuppose: "Score above 60" is TRUE, but "Pass" is FALSE.', question: 'Is this fair? Is (above 60 ↔ pass) true?', p: true, q: false, result: false, correctExplanation: "You scored above 60 but didn't pass? The rule was violated!", wrongExplanation: '"If and only if" means: above 60 = pass. You scored above 60 but failed? Rule broken.' },
      { setup: 'The rule: "The light is on IF AND ONLY IF the switch is up."\nSuppose: "Switch up" is FALSE, but "Light on" is TRUE.', question: "Is something wrong? Is (switch ↔ light) true?", p: false, q: true, result: false, correctExplanation: "Switch is down but light is on? Something's broken!", wrongExplanation: 'The light should ONLY be on when the switch is up. Switch down + light on = false.' },
      { setup: 'The rule: "I\'m happy IF AND ONLY IF I have coffee."\nSuppose: "Have coffee" is FALSE, and "Happy" is FALSE.', question: 'Is this consistent? Is (coffee ↔ happy) true?', p: false, q: false, result: true, correctExplanation: "No coffee, not happy. The rule holds!", wrongExplanation: '"If and only if" means they match. No coffee? Not happy. Both false — consistent. True!' },
    ],
    summary: 'The biconditional (↔) is TRUE when both sides have the SAME truth value. Both true or both false.',
  },
];

const LEVEL_2_NARRATIVE = [
  "The door slides open with a hiss.",
  "You step into a second chamber.",
  "The walls pulse with faint light.",
  "A new terminal awaits.",
];

const LEVEL_2_TERMINAL = [
  "You have learned the symbols.",
  "Now you must understand their meaning.",
  "We will present scenarios.",
  "Use your intuition to find the truth.",
];

export default function Level2() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('narrative');
  const [level2NarrativePage, setLevel2NarrativePage] = useState(0);
  const [level2TerminalPage, setLevel2TerminalPage] = useState(0);
  const [currentConnectiveIndex, setCurrentConnectiveIndex] = useState(0);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [level2Phase, setLevel2Phase] = useState('intro');
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const [learnedRows, setLearnedRows] = useState([]);

  const connective = TRUTH_TABLE_LESSONS[currentConnectiveIndex];
  const scenario = connective.scenarios[currentScenarioIndex];

  if (gameState === 'narrative') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 cursor-pointer"
        onClick={() => {
          if (level2NarrativePage < LEVEL_2_NARRATIVE.length - 1) setLevel2NarrativePage(level2NarrativePage + 1);
          else setGameState('terminal');
        }}
      >
        <div className="max-w-lg w-full text-center">
          <button onClick={(e) => { e.stopPropagation(); navigate('/'); }} className="text-gray-700 hover:text-gray-500 text-xs font-mono mb-12 block mx-auto">← hub</button>
          <p className="text-gray-400 text-xl leading-relaxed">{LEVEL_2_NARRATIVE[level2NarrativePage]}</p>
          <p className="text-gray-700 text-sm mt-12">click to continue</p>
        </div>
      </div>
    );
  }

  if (gameState === 'terminal') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 cursor-pointer"
        onClick={() => {
          if (level2TerminalPage < LEVEL_2_TERMINAL.length - 1) setLevel2TerminalPage(level2TerminalPage + 1);
          else { setCurrentConnectiveIndex(0); setCurrentScenarioIndex(0); setLevel2Phase('intro'); setLearnedRows([]); setGameState('playing'); }
        }}
      >
        <div className="max-w-lg w-full">
          <div className="border border-green-900 rounded-lg p-8 bg-black shadow-lg shadow-green-900/20">
            <div className="flex items-center gap-2 mb-6 border-b border-green-900 pb-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-green-700 text-xs font-mono">TERMINAL ACTIVE</span>
            </div>
            <p className="text-green-400 text-lg font-mono leading-relaxed">
              {LEVEL_2_TERMINAL[level2TerminalPage]}<span className="animate-pulse">_</span>
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
          <p className="text-green-400 text-2xl mb-4">The second door opens.</p>
          <p className="text-gray-500 mb-8">You understand the truth.</p>
          <div className="border border-green-900 rounded-lg p-6 bg-black mb-8">
            <p className="text-green-400 font-mono text-sm">LEVEL 2 COMPLETE<br/>TRUTH TABLES MASTERED: 5<br/>ACCURACY: 100%</p>
          </div>
          <p className="text-gray-600 italic mb-8">More chambers await...</p>
          <button onClick={() => navigate('/')} className="text-purple-400 hover:text-purple-300 transition-colors">Return to Hub</button>
        </div>
      </div>
    );
  }

  // Playing
  if (level2Phase === 'intro') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 cursor-pointer"
        onClick={() => setLevel2Phase('scenario')}
      >
        <div className="max-w-lg w-full text-center">
          <p className="text-purple-400 text-7xl font-light mb-4">{connective.symbol}</p>
          <p className="text-gray-500 text-xl mb-8">{connective.english}</p>
          <p className="text-gray-400 text-lg">{connective.intro}</p>
          <p className="text-gray-700 text-sm mt-12">click to continue</p>
        </div>
      </div>
    );
  }

  if (level2Phase === 'scenario') {
    const handleAnswer = (answer) => {
      const isCorrect = answer === scenario.result;
      setLastAnswerCorrect(isCorrect);
      if (isCorrect) {
        const newRow = connective.type === 'unary'
          ? { p: scenario.p, result: scenario.result }
          : { p: scenario.p, q: scenario.q, result: scenario.result };
        setLearnedRows([...learnedRows, newRow]);
      }
      setLevel2Phase('feedback');
    };
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center">
          <p className="text-gray-600 font-mono text-sm mb-6">{connective.symbol} — Scenario {currentScenarioIndex + 1} of {connective.scenarios.length}</p>
          <div className="bg-gray-900 rounded-lg p-6 mb-6 text-left">
            <p className="text-gray-300 whitespace-pre-line">{scenario.setup}</p>
          </div>
          <p className="text-xl text-gray-200 mb-8">{scenario.question}</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => handleAnswer(true)} className="px-8 py-4 bg-gray-900 border border-gray-700 rounded-lg text-xl font-mono text-gray-300 hover:border-green-500 hover:text-green-400 transition-colors">TRUE</button>
            <button onClick={() => handleAnswer(false)} className="px-8 py-4 bg-gray-900 border border-gray-700 rounded-lg text-xl font-mono text-gray-300 hover:border-red-500 hover:text-red-400 transition-colors">FALSE</button>
          </div>
        </div>
      </div>
    );
  }

  if (level2Phase === 'feedback') {
    if (!lastAnswerCorrect) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => { setLastAnswerCorrect(null); setLevel2Phase('scenario'); }}
        >
          <div className="max-w-xl w-full text-center">
            <p className="text-red-400 text-2xl mb-6">Not quite.</p>
            <div className="bg-gray-900 border border-red-900 rounded-lg p-6 mb-8">
              <p className="text-gray-300 leading-relaxed">{scenario.wrongExplanation}</p>
            </div>
            <p className="text-gray-700 text-sm">click to try again</p>
          </div>
        </div>
      );
    }
    const currentRow = connective.type === 'unary'
      ? { p: scenario.p, result: scenario.result }
      : { p: scenario.p, q: scenario.q, result: scenario.result };
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 cursor-pointer"
        onClick={() => {
          if (currentScenarioIndex < connective.scenarios.length - 1) {
            setCurrentScenarioIndex(currentScenarioIndex + 1);
            setLevel2Phase('scenario');
          } else {
            setLevel2Phase('summary');
          }
        }}
      >
        <div className="max-w-xl w-full text-center">
          <p className="text-green-400 text-2xl mb-6">Yes!</p>
          <div className="bg-gray-900 border border-green-900 rounded-lg p-6 mb-6">
            <p className="text-gray-300 leading-relaxed mb-4">{scenario.correctExplanation}</p>
          </div>
          <div className="border border-gray-800 rounded-lg overflow-hidden mb-6 inline-block">
            <table>
              <thead>
                <tr className="bg-gray-900">
                  {connective.type === 'unary' ? (
                    <><th className="py-2 px-4 text-gray-400 font-mono text-sm">P</th><th className="py-2 px-4 text-purple-400 font-mono text-sm">{connective.symbol}P</th></>
                  ) : (
                    <><th className="py-2 px-4 text-gray-400 font-mono text-sm">P</th><th className="py-2 px-4 text-gray-400 font-mono text-sm">Q</th><th className="py-2 px-4 text-purple-400 font-mono text-sm">P {connective.symbol} Q</th></>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-800">
                  {connective.type === 'unary' ? (
                    <><td className="py-2 px-4 text-gray-300 font-mono">{currentRow.p ? 'T' : 'F'}</td><td className="py-2 px-4 text-green-400 font-mono font-bold">{currentRow.result ? 'T' : 'F'}</td></>
                  ) : (
                    <><td className="py-2 px-4 text-gray-300 font-mono">{currentRow.p ? 'T' : 'F'}</td><td className="py-2 px-4 text-gray-300 font-mono">{currentRow.q ? 'T' : 'F'}</td><td className="py-2 px-4 text-green-400 font-mono font-bold">{currentRow.result ? 'T' : 'F'}</td></>
                  )}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 text-sm">click to continue</p>
        </div>
      </div>
    );
  }

  if (level2Phase === 'summary') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 cursor-pointer"
        onClick={() => {
          if (currentConnectiveIndex < TRUTH_TABLE_LESSONS.length - 1) {
            setCurrentConnectiveIndex(currentConnectiveIndex + 1);
            setCurrentScenarioIndex(0);
            setLearnedRows([]);
            setLevel2Phase('intro');
          } else {
            completeLevel(2);
            setGameState('success');
          }
        }}
      >
        <div className="max-w-xl w-full text-center">
          <p className="text-purple-400 text-5xl font-light mb-2">{connective.symbol}</p>
          <p className="text-gray-500 mb-6">{connective.english}</p>
          <p className="text-green-400 text-lg mb-4">Complete truth table:</p>
          <div className="border border-gray-800 rounded-lg overflow-hidden mb-6 inline-block">
            <table>
              <thead>
                <tr className="bg-gray-900">
                  {connective.type === 'unary' ? (
                    <><th className="py-3 px-6 text-gray-400 font-mono">P</th><th className="py-3 px-6 text-purple-400 font-mono">{connective.symbol}P</th></>
                  ) : (
                    <><th className="py-3 px-6 text-gray-400 font-mono">P</th><th className="py-3 px-6 text-gray-400 font-mono">Q</th><th className="py-3 px-6 text-purple-400 font-mono">P {connective.symbol} Q</th></>
                  )}
                </tr>
              </thead>
              <tbody>
                {connective.scenarios.map((s, idx) => (
                  <tr key={idx} className="border-t border-gray-800">
                    {connective.type === 'unary' ? (
                      <><td className="py-3 px-6 text-gray-300 font-mono">{s.p ? 'T' : 'F'}</td><td className="py-3 px-6 text-green-400 font-mono font-bold">{s.result ? 'T' : 'F'}</td></>
                    ) : (
                      <><td className="py-3 px-6 text-gray-300 font-mono">{s.p ? 'T' : 'F'}</td><td className="py-3 px-6 text-gray-300 font-mono">{s.q ? 'T' : 'F'}</td><td className="py-3 px-6 text-green-400 font-mono font-bold">{s.result ? 'T' : 'F'}</td></>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">{connective.summary}</p>
          <p className="text-gray-600 text-sm mb-2">{currentConnectiveIndex + 1} of {TRUTH_TABLE_LESSONS.length} connectives</p>
          <p className="text-gray-700 text-sm">click to continue</p>
        </div>
      </div>
    );
  }
}
