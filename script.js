// Memory Card Game (HTML/CSS/JS)

const gridEl = document.getElementById("grid");
const movesEl = document.getElementById("moves");
const timeEl = document.getElementById("time");
const restartBtn = document.getElementById("restartBtn");

const winModal = document.getElementById("winModal");
const winText = document.getElementById("winText");
const playAgainBtn = document.getElementById("playAgainBtn");
const closeBtn = document.getElementById("closeBtn");

// 8 pairs = 16 cards
const EMOJIS = ["🍕","🎮","🚀","🐼","🎧","🌟","🍩","🏆"];

let deck = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;

let moves = 0;
let matchedPairs = 0;

let timerId = null;
let seconds = 0;
let timerStarted = false;

function shuffle(array) {
  // Fisher-Yates
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function formatTime(totalSeconds) {
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const ss = String(totalSeconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function startTimer() {
  if (timerStarted) return;
  timerStarted = true;
  timerId = setInterval(() => {
    seconds++;
    timeEl.textContent = formatTime(seconds);
  }, 1000);
}

function stopTimer() {
  if (timerId) clearInterval(timerId);
  timerId = null;
  timerStarted = false;
}

function resetStats() {
  moves = 0;
  matchedPairs = 0;
  seconds = 0;
  movesEl.textContent = "0";
  timeEl.textContent = "00:00";
  stopTimer();
}

function buildDeck() {
  const pairs = [...EMOJIS, ...EMOJIS].map((emoji, idx) => ({
    id: idx + "-" + emoji,
    emoji
  }));
  deck = shuffle(pairs);
}

function createCard({ id, emoji }) {
  const card = document.createElement("button");
  card.className = "card";
  card.setAttribute("type", "button");
  card.setAttribute("aria-label", "Memory card");
  card.dataset.emoji = emoji;
  card.dataset.id = id;

  card.innerHTML = `
    <div class="card-inner">
      <div class="face front">
        <div class="pattern" aria-hidden="true"></div>
      </div>
      <div class="face back">
        <div class="emoji" aria-hidden="true">${emoji}</div>
      </div>
    </div>
  `;

  card.addEventListener("click", () => onCardClick(card));
  return card;
}

function renderBoard() {
  gridEl.innerHTML = "";
  deck.forEach((c) => gridEl.appendChild(createCard(c)));
}

function onCardClick(card) {
  if (lockBoard) return;
  if (card.classList.contains("flipped")) return;
  if (card.classList.contains("matched")) return;

  startTimer();
  card.classList.add("flipped");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  moves++;
  movesEl.textContent = String(moves);

  checkMatch();
}

function checkMatch() {
  if (!firstCard || !secondCard) return;

  const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;

  if (isMatch) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    matchedPairs++;
    resetTurn();

    if (matchedPairs === EMOJIS.length) {
      onWin();
    }
  } else {
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetTurn();
    }, 650);
  }
}

function resetTurn() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

function onWin() {
  stopTimer();
  const finalTime = formatTime(seconds);
  winText.textContent = `You finished in ${finalTime} with ${moves} moves.`;
  winModal.classList.remove("hidden");
}

function hideModal() {
  winModal.classList.add("hidden");
}

function restartGame() {
  hideModal();
  resetTurn();
  resetStats();
  buildDeck();
  renderBoard();
}

restartBtn.addEventListener("click", restartGame);
playAgainBtn.addEventListener("click", restartGame);
closeBtn.addEventListener("click", hideModal);

// Close modal if user clicks outside modal card
winModal.addEventListener("click", (e) => {
  if (e.target === winModal) hideModal();
});

// Init
restartGame();
