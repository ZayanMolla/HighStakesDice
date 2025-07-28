let balance = 100;
let profit = 0;
let wins = 0;
let losses = 0;
let lastBet = null;

const balanceDisplay = document.getElementById("balance");
const profitDisplay = document.getElementById("profit");
const winsDisplay = document.getElementById("wins");
const lossesDisplay = document.getElementById("losses");
const winrateDisplay = document.getElementById("winrate");

const betInput = document.getElementById("bet");
const targetInput = document.getElementById("target");
const minTargetInput = document.getElementById("min-target");
const maxTargetInput = document.getElementById("max-target");

const rollBtn = document.getElementById("roll-btn");
const repeatBtn = document.getElementById("repeat-btn");
const resetBtn = document.getElementById("reset-btn");

const resultDisplay = document.getElementById("result");
const diceDisplay = document.getElementById("dice");
const historyList = document.getElementById("history");

function updateStats() {
  balanceDisplay.textContent = balance.toFixed(2);
  profitDisplay.textContent = profit.toFixed(2);
  winsDisplay.textContent = wins;
  lossesDisplay.textContent = losses;
  const total = wins + losses;
  const winrate = total > 0 ? (wins / total) * 100 : 0;
  winrateDisplay.textContent = winrate.toFixed(2);
}

function rollDice() {
  return Math.floor(Math.random() * 100) + 1;
}

function getSelectedMode() {
  return document.querySelector('input[name="direction"]:checked').value;
}

function getMultiplier(chance) {
  const houseEdge = 0.01;
  return ((100 / chance) * (1 - houseEdge)).toFixed(2);
}

function showResult(text, win) {
  resultDisplay.textContent = text;
  resultDisplay.className = win ? "result win" : "result lose";
}

function animateDiceRoll(value) {
  diceDisplay.textContent = "";
  diceDisplay.style.transform = "rotate(720deg)";
  setTimeout(() => {
    diceDisplay.textContent = value;
    diceDisplay.style.transform = "rotate(0deg)";
  }, 500);
}

function placeBet() {
  const mode = getSelectedMode();
  const bet = parseFloat(betInput.value);

  if (isNaN(bet) || bet <= 0) return alert("Enter a valid bet.");
  if (bet > balance) return alert("Insufficient balance.");
  if (bet < 1) return alert("Minimum bet is $1.");

  let roll = rollDice();
  animateDiceRoll(roll);

  let win = false, payout = 0, chance = 0, multiplier = 0;

  if (mode === "under" || mode === "over") {
    const target = parseInt(targetInput.value);
    if (isNaN(target) || target < 1 || target > 100) {
      return alert("Target must be between 1 and 100.");
    }
    if (mode === "under") {
      chance = target - 1;
      win = roll < target;
    } else {
      chance = 100 - target;
      win = roll > target;
    }
  } else if (mode === "between") {
    const min = parseInt(minTargetInput.value);
    const max = parseInt(maxTargetInput.value);
    if (isNaN(min) || isNaN(max) || min >= max || min < 1 || max > 100) {
      return alert("Enter valid min and max between 1 and 100.");
    }
    chance = max - min + 1;
    win = roll >= min && roll <= max;
  }

  multiplier = getMultiplier(chance);

  if (win) {
    payout = bet * multiplier;
    balance += payout - bet;
    profit += payout - bet;
    wins++;
    showResult(`🎉 Rolled ${roll}. You win $${(payout - bet).toFixed(2)} (x${multiplier})`, true);
  } else {
    balance -= bet;
    profit -= bet;
    losses++;
    showResult(`💀 Rolled ${roll}. You lost $${bet.toFixed(2)}.`, false);
  }

  historyList.innerHTML =
    `<li class="${win ? "win" : "lose"}">Rolled ${roll} — ${win ? "Win" : "Lose"} — ${mode}</li>` +
    historyList.innerHTML;

  updateStats();

  lastBet = {
    mode,
    bet: betInput.value,
    target: targetInput.value,
    min: minTargetInput.value,
    max: maxTargetInput.value
  };
}

function updateInputVisibility() {
  const mode = getSelectedMode();
  const betweenInputs = document.getElementById("between-inputs");
  const targetInput = document.getElementById("target");

  if (mode === "between") {
    betweenInputs.style.display = "flex";
    targetInput.style.display = "none";
  } else {
    betweenInputs.style.display = "none";
    targetInput.style.display = "inline-block";
  }
}

rollBtn.addEventListener("click", placeBet);
repeatBtn.addEventListener("click", () => {
  if (lastBet) {
    document.querySelector(`input[value="${lastBet.mode}"]`).checked = true;
    betInput.value = lastBet.bet;
    targetInput.value = lastBet.target;
    minTargetInput.value = lastBet.min;
    maxTargetInput.value = lastBet.max;
    updateInputVisibility();
    placeBet();
  }
});
resetBtn.addEventListener("click", () => {
  balance = 100;
  profit = 0;
  wins = 0;
  losses = 0;
  historyList.innerHTML = "";
  resultDisplay.textContent = "";
  updateStats();
});

document.querySelectorAll('input[name="direction"]').forEach(input => {
  input.addEventListener("change", updateInputVisibility);
});

updateStats();
updateInputVisibility();
updateMultiplierDisplay();

function updateMultiplierDisplay() {
  const mode = getSelectedMode();
  const multiplierDisplay = document.getElementById("multiplier-display");
  let chance = 0;

  if (mode === "under" || mode === "over") {
    const target = parseInt(targetInput.value);
    if (isNaN(target) || target <= 1 || target >= 100) {
      multiplierDisplay.textContent = "Multiplier: x0.00";
      return;
    }
    chance = mode === "under" ? target - 1 : 100 - target;
  } else if (mode === "between") {
    const min = parseInt(minTargetInput.value);
    const max = parseInt(maxTargetInput.value);
    if (isNaN(min) || isNaN(max) || min >= max || min < 1 || max > 100) {
      multiplierDisplay.textContent = "Multiplier: x0.00";
      return;
    }
    chance = max - min + 1;
  }

  const multiplier = getMultiplier(chance);
  multiplierDisplay.textContent = `Multiplier: x${multiplier}`;
}document.querySelectorAll('input[name="direction"]').forEach(input => {
  input.addEventListener("change", () => {
    updateInputVisibility();
    updateMultiplierDisplay();
  });
});

[betInput, targetInput, minTargetInput, maxTargetInput].forEach(input => {
  input.addEventListener("input", updateMultiplierDisplay);
});