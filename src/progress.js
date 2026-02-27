// Progress is stored in localStorage so it persists across page loads
// Keys: 'level1_complete', 'level2_complete', 'level3_complete'

export function getLevelProgress() {
  return {
    level1: localStorage.getItem('level1_complete') === 'true',
    level2: localStorage.getItem('level2_complete') === 'true',
    level3: localStorage.getItem('level3_complete') === 'true',
  };
}

export function completeLevel(levelNum) {
  localStorage.setItem(`level${levelNum}_complete`, 'true');
}

export function resetProgress() {
  localStorage.removeItem('level1_complete');
  localStorage.removeItem('level2_complete');
  localStorage.removeItem('level3_complete');
}
