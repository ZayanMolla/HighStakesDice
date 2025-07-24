let balance = 1000;
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

  if (isNaN(bet) || bet <= 0) {
    alert("Please enter a valid bet amount.");
    return;
  }
  if (bet > 100) {
    alert("You can't bet more than $100.");
    return;
  }
  if (bet < 1) {
    alert("You must bet at least $1.");
    return;
  }
  if (bet > balance) {
    alert("Insufficient balance.");
    return;
  }

  let roll = rollDice();
  animateDiceRoll(roll);

  let win = false;
  let payout = 0;
  let chance = 0;
  let multiplier = 0;

  if (mode === "under") {
    const target = parseInt(targetInput.value);
    if (isNaN(target) || target <= 1 || target > 100) {
      alert("Target must be between 2 and 100 for Under mode.");
      return;
    }
    chance = target - 1;
    multiplier = getMultiplier(chance);
    win = roll < target;
  } else if (mode === "over") {
    const target = parseInt(targetInput.value);
    if (isNaN(target) || target < 1 || target >= 100) {
      alert("Target must be between 1 and 99 for Over mode.");
      return;
    }
    chance = 100 - target;
    multiplier = getMultiplier(chance);
    win = roll > target;
  } else if (mode === "between") {
    const min = parseInt(minTargetInput.value);
    const max = parseInt(maxTargetInput.value);
    if (isNaN(min) || isNaN(max) || min >= max || min < 1 || max > 100) {
      alert("Enter valid min and max values between 1 and 100.");
      return;
    }
    chance = max - min + 1;
    multiplier = getMultiplier(chance);
    win = roll >= min && roll <= max;
  }

  if (win) {
    payout = bet * multiplier;
    balance += payout - bet;
    profit += payout - bet;
    wins++;
    showResult(`You rolled ${roll}. You win $${(payout - bet).toFixed(2)}!`, true);
  } else {
    balance -= bet;
    profit -= bet;
    losses++;
    showResult(`You rolled ${roll}. You lost $${bet.toFixed(2)}.`, false);
  }

  historyList.innerHTML = `<li class="${win ? "win" : "lose"}">Rolled ${roll} — ${win ? "Win" : "Lose"} — ${mode}</li>` + historyList.innerHTML;
  updateStats();

  lastBet = {
    mode,
    bet: betInput.value,
    target: targetInput.value,
    min: minTargetInput.value,
    max: maxTargetInput.value
  };
}

rollBtn.addEventListener("click", placeBet);
repeatBtn.addEventListener("click", () => {
  if (lastBet) {
    document.querySelector(`input[value="${lastBet.mode}"]`).checked = true;
    betInput.value = lastBet.bet;
    targetInput.value = lastBet.target;
    minTargetInput.value = lastBet.min;
    maxTargetInput.value = lastBet.max;
    placeBet();
  }
});

resetBtn.addEventListener("click", () => {
  balance = 1000;
  profit = 0;
  wins = 0;
  losses = 0;
  historyList.innerHTML = "";
  resultDisplay.textContent = "";
  updateStats();
});

function updateInputVisibility() {
  const mode = getSelectedMode();
  const sliderContainer = document.getElementById("slider-container");
  const targetInputContainer = document.getElementById("target-container");
  const betweenInputs = document.getElementById("between-inputs");

  if (mode === "between") {
    sliderContainer.style.display = "none";
    targetInputContainer.style.display = "none";
    betweenInputs.style.display = "flex";
  } else {
    sliderContainer.style.display = "block";
    targetInputContainer.style.display = "block";
    betweenInputs.style.display = "none";
  }
}

document.querySelectorAll('input[name="direction"]').forEach(input => {
  input.addEventListener("change", updateInputVisibility);
});

updateStats();
updateInputVisibility();