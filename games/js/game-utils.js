/**
 * Utility functions for Euno Mini Games
 */

function getStorage(key, def) {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? JSON.parse(v) : def;
  } catch (e) {
    return def;
  }
}

function setStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

/**
 * Save highscore for a specific game and return true if it's a new highscore.
 */
function saveHighScore(gameKey, score) {
  const currentHigh = getStorage('highscore_' + gameKey, 0);
  if (score > currentHigh) {
    setStorage('highscore_' + gameKey, score);
    return true;
  }
  return false;
}

/**
 * Get current highscore
 */
function getHighScore(gameKey) {
  return getStorage('highscore_' + gameKey, 0);
}

/**
 * Award StudyCoins to the user.
 */
function awardStudyCoins(amount, reason) {
  const doubleActive = getStorage('double_coins_active') === new Date().toLocaleDateString('en-CA');
  const finalAmount = doubleActive ? amount * 2 : amount;

  const currentBal = getStorage('coins_balance', 0);
  const newBal = Math.max(0, currentBal + finalAmount);
  setStorage('coins_balance', newBal);

  const hist = getStorage('coins_history', []);
  hist.unshift({
    amount: finalAmount,
    reason: reason,
    timestamp: Date.now()
  });
  setStorage('coins_history', hist.slice(0, 100));

  return finalAmount;
}

// Attach to window so they are globally accessible
window.EunoGameUtils = {
  saveHighScore,
  getHighScore,
  awardStudyCoins
};

/**
 * Global Theme Sync
 */
function syncGlobalTheme() {
  const t = getStorage('theme', 'system');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = t === 'dark' || (t === 'system' && prefersDark);
  
  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('dark-theme');
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.body.classList.remove('dark-theme');
  }

  // Update theme toggle icons if present
  document.querySelectorAll('#theme-toggle .material-symbols-outlined, #theme-toggle .material-symbols-rounded, .theme-toggle .material-symbols-outlined, .theme-toggle .material-symbols-rounded').forEach(icon => {
    icon.textContent = isDark ? 'light_mode' : 'dark_mode';
  });
}

function toggleGlobalTheme() {
  const t = getStorage('theme', 'system');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = t === 'dark' || (t === 'system' && prefersDark);
  const newTheme = isDark ? 'light' : 'dark';
  setStorage('theme', newTheme);
  syncGlobalTheme();
}

// Apply on load
syncGlobalTheme();
function initGameUtils() {
  syncGlobalTheme();
  const toggles = document.querySelectorAll('#theme-toggle, .theme-toggle');
  toggles.forEach(btn => btn.addEventListener('click', toggleGlobalTheme));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGameUtils);
} else {
  initGameUtils();
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (getStorage('theme', 'system') === 'system') syncGlobalTheme();
});

window.addEventListener('storage', (e) => {
  if (e.key === 'theme') syncGlobalTheme();
});
