// --- LOCAL STORAGE FUNCTIONS ---

/**
 * Saves data to localStorage
 */
function saveToStorage() {
  const data = {
    scoreOne: parseInt(document.getElementById('score-one').textContent, 10),
    scoreTwo: parseInt(document.getElementById('score-two').textContent, 10),
    nameOne: document.getElementById('name-one').value,
    nameTwo: document.getElementById('name-two').value,
    winnerOne: document.getElementById('trophy-one').style.display === 'block',
    winnerTwo: document.getElementById('trophy-two').style.display === 'block'
  };
  localStorage.setItem('scoreboardData', JSON.stringify(data));
}

/**
 * Loads data from localStorage
 */
function loadFromStorage() {
  const stored = localStorage.getItem('scoreboardData');
  if (stored) {
    const data = JSON.parse(stored);
    document.getElementById('score-one').textContent = data.scoreOne;
    document.getElementById('score-two').textContent = data.scoreTwo;
    document.getElementById('name-one').value = data.nameOne;
    document.getElementById('name-two').value = data.nameTwo;

    // Restore trophy visibility
    document.getElementById('trophy-one').style.display = data.winnerOne ? 'block' : 'none';
    document.getElementById('trophy-two').style.display = data.winnerTwo ? 'block' : 'none';

    updateDifference();
    updateProbabilityMeter();
    updateWinBarLabels();
  }
}

/**
 * Clears all localStorage data
 */
function clearStorage() {
  localStorage.removeItem('scoreboardData');
}

// --- UTILITY FUNCTIONS ---

/**
 * Hides both trophies. Called when score changes or on reset.
 */
function hideTrophies() {
  document.getElementById('trophy-one').style.display = 'none';
  document.getElementById('trophy-two').style.display = 'none';
}

/**
 * Updates the team name labels under the win probability bar.
 */
function updateWinBarLabels() {
  document.querySelector('.team-a-label').textContent = document.getElementById('name-one').value.trim() || "Team A";
  document.querySelector('.team-b-label').textContent = document.getElementById('name-two').value.trim() || "Team B";
}

/**
 * Updates the central text to show who is leading or if it's a tie.
 */
function updateDifference() {
  const scoreA = parseInt(document.getElementById('score-one').textContent, 10);
  const scoreB = parseInt(document.getElementById('score-two').textContent, 10);
  const diffText = document.getElementById('difference');

  const nameA = document.getElementById('name-one').value.trim() || "Team One";
  const nameB = document.getElementById('name-two').value.trim() || "Team Two";

  if (scoreA > scoreB) {
    diffText.textContent = `🔥 ${nameA} lead by ${scoreA - scoreB} point(s)`;
  } else if (scoreB > scoreA) {
    diffText.textContent = `🔥 ${nameB} lead by ${scoreB - scoreA} point(s)`;
  } else {
    diffText.textContent = "🤝 Scores are tied!";
  }
}

/**
 * Updates the win probability meter
 */
function updateProbabilityMeter() {
  const scoreA = parseInt(document.getElementById('score-one').textContent, 10);
  const scoreB = parseInt(document.getElementById('score-two').textContent, 10);
  const fill = document.getElementById('probability-fill');
  const bar = fill.parentElement;

  const totalScore = scoreA + scoreB;
  let probability = 50;

  if (totalScore > 0) {
    const scoreDiff = scoreA - scoreB;
    const maxDiff = Math.max(10, totalScore);
    probability = 50 + (scoreDiff / maxDiff) * 40;
    probability = Math.max(10, Math.min(90, probability));
  }

  if (scoreB > scoreA) {
    bar.style.direction = 'rtl';
    fill.style.width = `${100 - probability}%`;
    fill.style.background = 'linear-gradient(90deg, #ffa366, #633f1c)';
  } else {
    bar.style.direction = 'ltr';
    fill.style.width = `${probability}%`;
    if (scoreA > scoreB) {
      fill.style.background = 'linear-gradient(90deg, #685596, #8a7db8)';
    } else {
      fill.style.background = 'linear-gradient(90deg, #888, #aaa)';
    }
  }
}

/**
 * Updates a team's score with a GSAP animation.
 */
function updateScore(team, delta) {
  // NEW: Show probability meter again if it was hidden
  const probabilityMeter = document.querySelector('.probability-meter');
  if (window.getComputedStyle(probabilityMeter).display === 'none') {
    probabilityMeter.style.display = 'block';
    gsap.to(probabilityMeter, { opacity: 1, duration: 0.4 });
  }

  hideTrophies();

  const el = document.getElementById(`score-${team}`);
  const currentScore = parseInt(el.textContent, 10);
  const newScore = Math.max(0, currentScore + delta);

  gsap.fromTo(el, { scale: 1 }, {
    scale: 1.3,
    duration: 0.2,
    ease: "power2.out",
    onComplete: () => {
      el.textContent = newScore;
      gsap.to(el, {
        scale: 1,
        duration: 0.2,
        ease: "power2.inOut",
        onComplete: () => {
          updateDifference();
          updateProbabilityMeter();
          saveToStorage();
        }
      });
    }
  });
}

/**
 * Resets all scores, names, and storage
 */
function resetAll() {
  document.getElementById('score-one').textContent = '0';
  document.getElementById('score-two').textContent = '0';
  document.getElementById('name-one').value = 'Team A';
  document.getElementById('name-two').value = 'Team B';

  hideTrophies();

  // NEW: Make sure probability meter is visible on reset
  const probabilityMeter = document.querySelector('.probability-meter');
  probabilityMeter.style.display = 'block';
  probabilityMeter.style.opacity = 1;

  clearStorage();

  updateDifference();
  updateProbabilityMeter();
  updateWinBarLabels();

  const resetBtn = document.getElementById('reset-btn');
  gsap.fromTo(resetBtn, { scale: 1 }, {
    scale: 0.9,
    duration: 0.1,
    yoyo: true,
    repeat: 1,
    ease: "power1.inOut"
  });
}

// --- EVENT LISTENERS ---

document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const team = btn.dataset.team;
    const delta = btn.classList.contains('plus') ? 1 : -1;

    gsap.fromTo(btn, { scale: 1 }, {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power1.inOut"
    });
    updateScore(team, delta);
  });
});

document.querySelectorAll('.edit-name').forEach(button => {
  button.addEventListener('click', () => {
    const input = button.previousElementSibling;
    input.removeAttribute('readonly');
    input.focus();
    input.select();

    gsap.fromTo(input, { scale: 1.0 }, {
      scale: 1.05,
      duration: 0.15,
      yoyo: true,
      repeat: 1,
      ease: "power1.inOut"
    });
  });
});

document.querySelectorAll('.team-name').forEach(input => {
  function lockAndSave() {
    input.setAttribute('readonly', true);
    updateDifference();
    updateWinBarLabels();
    saveToStorage();
  }
  input.addEventListener('blur', lockAndSave);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      input.blur();
    }
  });
});

document.getElementById('reset-btn').addEventListener('click', resetAll);

document.getElementById('check-winner').addEventListener('click', () => {
  const scoreA = parseInt(document.getElementById('score-one').textContent, 10);
  const scoreB = parseInt(document.getElementById('score-two').textContent, 10);
  const diffText = document.getElementById('difference');

  if (scoreA === scoreB) {
    diffText.textContent = "⚖️ It's a tie! No winner yet.";
    gsap.fromTo(diffText, { scale: 1 }, {
      scale: 1.1,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out'
    });
    return;
  }

  // --- GRAND CELEBRATION LOGIC ---

  // NEW: Hide the probability meter when a winner is declared
  const probabilityMeter = document.querySelector('.probability-meter');
  gsap.to(probabilityMeter, {
    opacity: 0,
    duration: 0.4,
    ease: 'power1.in',
    onComplete: () => {
      probabilityMeter.style.display = 'none';
    }
  });

  const isTeamOneWinner = scoreA > scoreB;
  const winnerTeamId = isTeamOneWinner ? 'one' : 'two';
  const loserTeamId = isTeamOneWinner ? 'two' : 'one';
  const winnerEl = document.querySelector(`.team-${winnerTeamId}`);
  const loserEl = document.querySelector(`.team-${loserTeamId}`);
  const winnerName = document.getElementById(`name-${winnerTeamId}`).value.trim();

  document.getElementById(`trophy-${winnerTeamId}`).style.display = 'block';
  document.getElementById(`trophy-${loserTeamId}`).style.display = 'none';

  const bounds = winnerEl.getBoundingClientRect();
  const confettiOrigin = {
    x: (bounds.left + bounds.right) / 2 / window.innerWidth,
    y: (bounds.top + bounds.bottom) / 2 / window.innerHeight,
  };

  const fireConfettiBurst = () => {
    confetti({
      particleCount: 120,
      angle: 90,
      spread: 120,
      startVelocity: 40,
      origin: confettiOrigin,
      colors: ['#BB86FC', '#FF80AB', '#03DAC5', '#FFD54F', '#FFFFFF'],
      gravity: 0.7,
      drift: 0
    });

    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: isTeamOneWinner ? 45 : 135,
        spread: 100,
        startVelocity: 30,
        origin: { x: confettiOrigin.x, y: confettiOrigin.y + 0.1 },
        colors: ['#BB86FC', '#FF80AB', '#03DAC5'],
        gravity: 1.0
      });
    }, 150);

    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 90,
        spread: 60,
        startVelocity: 25,
        origin: { x: isTeamOneWinner ? 0.15 : 0.85, y: 0.6 },
        colors: ['#FFD54F', '#FFFFFF', '#FF80AB'],
        gravity: 0.9
      });
    }, 300);
  };

  diffText.textContent = `🏆 ${winnerName} WINS! 🏆`;

  const masterTl = gsap.timeline();

  masterTl.to(winnerEl, {
    scale: 1.05,
    zIndex: 2,
    duration: 0.6,
    ease: 'back.out(1.7)',
  })
    .to(loserEl, {
      opacity: 0.4,
      filter: 'grayscale(100%)',
      duration: 0.6,
    }, '<');

  for (let i = 0; i < 5; i++) {
    masterTl.call(fireConfettiBurst, [], i * 0.4);
  }

  masterTl.call(() => {
    confetti({
      particleCount: 200,
      angle: 90,
      spread: 140,
      startVelocity: 50,
      origin: { x: isTeamOneWinner ? 0.25 : 0.75, y: 0.2 },
      colors: ['#BB86FC', '#FF80AB', '#03DAC5', '#FFD54F', '#FFFFFF', '#FF6B6B'],
      gravity: 0.5
    });
  }, [], '+=0.3');

  masterTl.to([winnerEl, loserEl], {
    scale: 1,
    opacity: 1,
    zIndex: 1,
    filter: 'grayscale(0%)',
    duration: 0.7,
    ease: 'power2.inOut',
    onComplete: saveToStorage
  }, '+=2');
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('trophy-one').style.display = 'none';
  document.getElementById('trophy-two').style.display = 'none';
  loadFromStorage();
  updateDifference();
  updateProbabilityMeter();
  updateWinBarLabels();
});
