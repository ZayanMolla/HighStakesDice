const balanceDisplay = document.getElementById("balance");
const profitDisplay = document.getElementById("profit");
const resultDisplay = document.getElementById("result");
const winDisplay = document.getElementById("wins");
const lossDisplay = document.getElementById("losses");
const winrateDisplay = document.getElementById("winrate");
const history = document.getElementById("history");
const betInput = document.getElementById("bet");
const slider = document.getElementById("bet-slider");
const targetInput = document.getElementById("target");
const minTargetInput = document.getElementById("min-target");
const maxTargetInput = document.getElementById("max-target");
const rollBtn = document.getElementById("roll-btn");
const repeatBtn = document.getElementById("repeat-btn");
const resetBtn = document.getElementById("reset-btn");
const dice = document.getElementById("dice");

let balance = parseInt(localStorage.getItem("balance")) || 100;
let profit = parseInt(localStorage.getItem("profit")) || 0;
let wins = parseInt(localStorage.getItem("wins")) || 0;
let losses = parseInt(localStorage.getItem("losses")) || 0;
let lastBet = JSON.parse(localStorage.getItem("lastBet")) || null;

function updateDisplays() {
  balanceDisplay.textContent = balance;
  profitDisplay.textContent = profit;
  winDisplay.textContent = wins;
  lossDisplay.textContent = losses;
  const total = wins + losses;
  winrateDisplay.textContent = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;
}

function updateStorage() {
  localStorage.setItem("balance", balance);
  localStorage.setItem("profit", profit);
  localStorage.setItem("wins", wins);
  localStorage.setItem("losses", losses);
  localStorage.setItem("lastBet", JSON.stringify(lastBet));
}

function getSelectedDirection() {
  const selected = document.querySelector('input[name="direction"]:checked');
  return selected ? selected.value : "under";
}

function updateInputVisibility() {
  const direction = getSelectedDirection();
  targetInput.style.display = direction === "between" ? "none" : "inline-block";
  minTargetInput.style.display = direction === "between" ? "inline-block" : "none";
  maxTargetInput.style.display = direction === "between" ? "inline-block" : "none";
}

// Event to sync slider & input
slider.addEventListener("input", () => {
  betInput.value = slider.value;
});
betInput.addEventListener("input", () => {
  slider.value = betInput.value;
});

// Update target input visibility on mode change
document.querySelectorAll('input[name="direction"]').forEach((radio) => {
  radio.addEventListener("change", updateInputVisibility);
});

rollBtn.addEventListener("click", () => {
  const bet = parseInt(betInput.value);
  if (isNaN(bet) || bet <= 0 || bet > balance) {
    resultDisplay.textContent = "❌ Invalid bet!";
    return;
  }

  const direction = getSelectedDirection();
  const roll = Math.floor(Math.random() * 100) + 1;

  // Animate dice
  dice.textContent = "?";
  dice.style.transform = "rotate(720deg)";
  setTimeout(() => {
    dice.textContent = roll;
    dice.style.transform = "rotate(0deg)";
  }, 300);

  let win = false;
  if (direction === "under") {
    const target = parseInt(targetInput.value);
    if (isNaN(target) || target <= 1 || target >= 100) {
      resultDisplay.textContent = "❌ Invalid target!";
      return;
    }
    win = roll < target;
  } else if (direction === "over") {
    const target = parseInt(targetInput.value);
    if (isNaN(target) || target <= 1 || target >= 100) {
      resultDisplay.textContent = "❌ Invalid target!";
      return;
    }
    win = roll > target;
  } else if (direction === "between") {
    const min = parseInt(minTargetInput.value);
    const max = parseInt(maxTargetInput.value);
    if (isNaN(min) || isNaN(max) || min >= max || min <= 1 || max >= 100) {
      resultDisplay.textContent = "❌ Invalid range!";
      return;
    }
    win = roll > min && roll < max;
  }

  if (win) {
    balance += bet;
    profit += bet;
    wins++;
    resultDisplay.innerHTML = `✅ You <span class="win">won</span>! (${roll})`;
  } else {
    balance -= bet;
    profit -= bet;
    losses++;
    resultDisplay.innerHTML = `❌ You <span class="lose">lost</span>! (${roll})`;
  }

  lastBet = {
    bet,
    direction,
    target: targetInput.value,
    min: minTargetInput.value,
    max: maxTargetInput.value,
  };

  updateDisplays();
  updateStorage();

  const item = document.createElement("li");
  item.textContent = `Bet $${bet} on ${direction} — ${win ? "Won ✅" : "Lost ❌"} (Rolled ${roll})`;
  item.className = win ? "win" : "lose";
  history.insertBefore(item, history.firstChild);
});

repeatBtn.addEventListener("click", () => {
  if (!lastBet) return;

  betInput.value = lastBet.bet;
  slider.value = lastBet.bet;

  const dirInput = document.querySelector(`input[value="${lastBet.direction}"]`);
  dirInput.checked = true;
  dirInput.dispatchEvent(new Event("change")); // Ensure inputs update

  targetInput.value = lastBet.target || "";
  minTargetInput.value = lastBet.min || "";
  maxTargetInput.value = lastBet.max || "";

  rollBtn.click();
});

resetBtn.addEventListener("click", () => {
  if (!confirm("Reset all progress?")) return;

  balance = 100;
  profit = 0;
  wins = 0;
  losses = 0;
  lastBet = null;

  localStorage.clear();
  history.innerHTML = "";
  updateDisplays();
  resultDisplay.textContent = "Progress reset.";
  dice.textContent = "?";
});

updateDisplays();
updateInputVisibility();