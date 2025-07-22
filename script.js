const balanceDisplay = document.getElementById("balance");
const profitDisplay = document.getElementById("profit");
const resultDisplay = document.getElementById("result");
const winDisplay = document.getElementById("wins");
const lossDisplay = document.getElementById("losses");
const winrateDisplay = document.getElementById("winrate");
const history = document.getElementById("history");
const dice = document.getElementById("dice");
const betInput = document.getElementById("bet");
const betSlider = document.getElementById("bet-slider");
const targetInput = document.getElementById("target");
const minTargetInput = document.getElementById("min-target");
const maxTargetInput = document.getElementById("max-target");

let balance = parseFloat(localStorage.getItem("balance")) || 1000;
let wins = parseInt(localStorage.getItem("wins")) || 0;
let losses = parseInt(localStorage.getItem("losses")) || 0;
let profit = parseFloat(localStorage.getItem("profit")) || 0;
let lastBet = null;
const houseEdge = 0.01;

function updateUI() {
  balanceDisplay.textContent = balance.toFixed(2);
  profitDisplay.textContent = profit.toFixed(2);
  winDisplay.textContent = wins;
  lossDisplay.textContent = losses;
  const total = wins + losses;
  winrateDisplay.textContent = total ? ((wins / total) * 100).toFixed(1) : 0;
  localStorage.setItem("balance", balance);
  localStorage.setItem("wins", wins);
  localStorage.setItem("losses", losses);
  localStorage.setItem("profit", profit);
}

function addToHistory(message, win) {
  const entry = document.createElement("li");
  entry.textContent = message;
  entry.classList.add(win ? "win" : "lose");
  history.prepend(entry);
}

document.getElementById("roll-btn").addEventListener("click", () => {
  const bet = parseFloat(betInput.value);
  const direction = document.querySelector('input[name="direction"]:checked').value;
  const target = parseInt(targetInput.value);
  const min = parseInt(minTargetInput.value);
  const max = parseInt(maxTargetInput.value);

  if (bet > balance || bet <= 0 || isNaN(bet)) return alert("Invalid bet");

  let roll = Math.floor(Math.random() * 100);
  dice.textContent = "?";
  dice.style.transform = "rotate(720deg)";

  setTimeout(() => {
    dice.textContent = roll;
    dice.style.transform = "rotate(0deg)";
    let win = false;
    let chance = 0;

    if (direction === "under") {
      win = roll < target;
      chance = target;
    } else if (direction === "over") {
      win = roll > target;
      chance = 100 - target;
    } else if (direction === "between") {
      win = roll >= min && roll <= max;
      chance = Math.max(0, max - min);
    }

    const payout = (100 / chance) * (1 - houseEdge);
    let message = `Roll: ${roll}`;
    if (win) {
      const gain = bet * payout - bet;
      balance += gain;
      profit += gain;
      wins++;
      resultDisplay.textContent = `${message} — You Win! +${gain.toFixed(2)}`;
    } else {
      balance -= bet;
      profit -= bet;
      losses++;
      resultDisplay.textContent = `${message} — You Lose! -${bet.toFixed(2)}`;
    }

    addToHistory(resultDisplay.textContent, win);
    updateUI();
    lastBet = { bet, direction, target, min, max };
  }, 600);
});

document.getElementById("repeat-btn").addEventListener("click", () => {
  if (!lastBet) return;
  betInput.value = lastBet.bet;
  betSlider.value = lastBet.bet;
  document.querySelector(`input[value="${lastBet.direction}"]`).checked = true;
  targetInput.value = lastBet.target || "";
  minTargetInput.value = lastBet.min || "";
  maxTargetInput.value = lastBet.max || "";
  updateInputVisibility();
});

// Reset button
document.getElementById("reset-btn").addEventListener("click", () => {
  if (confirm("Are you sure you want to reset your progress?")) {
    balance = 1000;
    profit = 0;
    wins = 0;
    losses = 0;
    localStorage.removeItem("balance");
    localStorage.removeItem("profit");
    localStorage.removeItem("wins");
    localStorage.removeItem("losses");
    updateUI();
    history.innerHTML = "";
    resultDisplay.textContent = "";
  }
});

// Bet input & slider sync
betSlider.addEventListener("input", () => {
  betInput.value = betSlider.value;
});
betInput.addEventListener("input", () => {
  const val = parseFloat(betInput.value);
  if (!isNaN(val)) {
    betSlider.value = Math.min(Math.max(val, betSlider.min), betSlider.max);
  }
});

// Input visibility logic
const directionRadios = document.querySelectorAll('input[name="direction"]');
function updateInputVisibility() {
  const selected = document.querySelector('input[name="direction"]:checked').value;
  if (selected === "between") {
    targetInput.style.display = "none";
    minTargetInput.style.display = "inline-block";
    maxTargetInput.style.display = "inline-block";
  } else {
    targetInput.style.display = "inline-block";
    minTargetInput.style.display = "none";
    maxTargetInput.style.display = "none";
  }
}
directionRadios.forEach(radio => {
  radio.addEventListener("change", updateInputVisibility);
});

updateInputVisibility();
updateUI();