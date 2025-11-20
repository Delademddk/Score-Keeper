document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('score-board');
  const scores = JSON.parse(localStorage.getItem('scores')) || {};
  const playerNames = JSON.parse(localStorage.getItem('playerNames')) || {};
  const timerData = JSON.parse(localStorage.getItem('timerData')) || { elapsed: 0 };

  // Get current player count (saved or 0)
let existingIds = Object.keys(playerNames).map(Number);
let newNum = existingIds.length ? Math.max(...existingIds) : 0;


  // Helper functions
  const updateLocalStorage = () => {
    localStorage.setItem('scores', JSON.stringify(scores));
    localStorage.setItem('playerNames', JSON.stringify(playerNames));
    localStorage.setItem('timerData', JSON.stringify(timerData));
  };

  const updateDisplay = (card, total) => {
    card.querySelector('.score-total').textContent = total;
  };

  const highlightLeader = () => {
    const values = Object.values(scores);
    if (values.length === 0) return;
    const max = Math.max(...values);
    document.querySelectorAll('.player-card').forEach(card => {
      const id = card.dataset.playerId;
      card.classList.toggle('leader', scores[id] === max && max > 0);
    });
  };

  //ADD PLAYER
  document.getElementById('add-btn').addEventListener('click', () => {
  newNum++; 
  const id = newNum;

  const name = `Player ${id}`;
  const score = 0;

  //Always initialize in memory
  playerNames[id] = name;
  scores[id] = score;
  console.log(playerNames)

  const card = document.createElement('div');
  card.className = 'player-card';
  card.dataset.playerId = id;

  card.innerHTML = `
    <div class="player-top">
      <div class="player-name" contenteditable="true">${name}</div>
      <div class="score-total">${score}</div>
    </div>
    <div class="score-display">
      <input type="number" class="score-input" placeholder="0" min="0">
      <button class="small-btn add">Add</button>
      <button class="small-btn clear">Clear</button>
    </div>
    <button class="small-btn remove">Remove</button>
  `;

  board.appendChild(card);
  updateLocalStorage(); 
});

  //SCORE CONTROLS
  board.addEventListener('click', e => {
    const card = e.target.closest('.player-card');
    if (!card) return;
    const id = card.dataset.playerId;

    if (e.target.classList.contains('add')) {
      const input = card.querySelector('.score-input');
      let val = parseInt(input.value, 10);
      if (isNaN(val) || val < 0) val = 0;
      scores[id] = (scores[id] || 0) + val;
      updateDisplay(card, scores[id]);
      input.value = '';
      highlightLeader();
      updateLocalStorage();
    }

    if (e.target.classList.contains('clear')) {
      scores[id] = 0;
      updateDisplay(card, 0);
      highlightLeader();
      updateLocalStorage();
    }

    if (e.target.classList.contains('remove')) {
      delete scores[id];
      delete playerNames[id];
      card.remove();
      highlightLeader();
      updateLocalStorage();
    }
  });

  //EDIT PLAYER NAMES
  board.addEventListener('keydown', e => {
    if (e.target.classList.contains('player-name') && e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  });

  board.addEventListener('blur', e => {
    if (e.target.classList.contains('player-name')) {
      const id = e.target.closest('.player-card').dataset.playerId;
      playerNames[id] = e.target.textContent.trim() || `Player ${id}`;
      updateLocalStorage();
    }
  }, true);

  //SORT PLAYERS
  document.getElementById('sort-btn').addEventListener('click', () => {
    const cards = [...document.querySelectorAll('.player-card')];
    cards.sort((a, b) => (scores[b.dataset.playerId] || 0) - (scores[a.dataset.playerId] || 0));
    cards.forEach(c => board.appendChild(c));
  });

  //SHUFFLE PLAYERS
  document.getElementById('shuffle-btn').addEventListener('click', () => {
    const cards = [...document.querySelectorAll('.player-card')];
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    cards.forEach(c => board.appendChild(c));
  });

  //RESET SCORES
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (!confirm('Reset all scores to 0?')) return;
    Object.keys(scores).forEach(id => scores[id] = 0);
    document.querySelectorAll('.player-card').forEach(card => updateDisplay(card, 0));
    highlightLeader();
    updateLocalStorage();
  });

  //TIMER
  const timerDisplay = document.getElementById('timer-display');
  const timerToggle = document.getElementById('timer-toggle');
  const timerReset = document.getElementById('timer-reset');
  let timerInterval = null;

  const formatTime = sec => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const updateTimerUI = () => {
    timerDisplay.textContent = formatTime(timerData.elapsed);
    timerToggle.textContent = timerInterval ? 'Pause' : 'Start';
  };

  timerToggle.addEventListener('click', () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    } else {
      timerInterval = setInterval(() => {
        timerData.elapsed++;
        updateTimerUI();
        updateLocalStorage();
      }, 1000);
    }
    updateTimerUI();
  });

  timerReset.addEventListener('click', () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    timerData.elapsed = 0;
    updateTimerUI();
    updateLocalStorage();
  });

  //Initialize
  updateTimerUI();
  highlightLeader();

  // Recreate any save players from localStorage
  Object.keys(playerNames).forEach(id => {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.dataset.playerId = id;

    const name = playerNames[id] || `Player ${id}`;
    const score = scores[id] || 0;

    card.innerHTML = `
      <div class="player-top">
        <div class="player-name" contenteditable="true">${name}</div>
        <div class="score-total">${score}</div>
      </div>
      <div class="score-display">
        <input type="number" class="score-input" placeholder="0" min="0">
        <button class="small-btn add">Add</button>
        <button class="small-btn clear">Clear</button>
      </div>
      <button class="small-btn remove">Remove</button>
    `;
    board.appendChild(card);
  });
});

//@DELA