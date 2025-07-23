let balance = 1000;
let mode = 'under';

const balanceEl = document.getElementById("balance");
const betInput = document.getElementById("betAmount");
const slider = document.getElementById("slider");
const targetNumberInput = document.getElementById("targetNumber");
const lowerBoundInput = document.getElementById("lowerBound");
const upperBoundInput = document.getElementById("upperBound");
const multiplierEl = document.getElementById("multiplier");
const resultEl = document.getElementById("result");
const diceEl = document.getElementById("dice");
const sliderOverlay = document.getElementById("sliderOverlay");

const underBtn = document.getElementById("underBtn");
const betweenBtn = document.getElementById("betweenBtn");
const overBtn = document.getElementById("overBtn");

function updateBalanceDisplay() {
  balanceEl.textContent = balance.toFixed(2);
}

function updateSliderOverlay() {
  const val = parseInt(slider.value);
  if (mode === 'under') {
    sliderOverlay.style.background = `linear-gradient(to right, #28a745 ${val}%, transparent ${val}%)`;
  } else if (mode === 'over') {
    sliderOverlay.style.background = `linear-gradient(to right, transparent ${val}%, #28a745 ${val}%)`;
  } else {
    sliderOverlay.style.background = 'transparent';
  }
}

function calculateMultiplier() {
  let chance = 1;

  if (mode === 'under') {
    chance = parseInt(targetNumberInput.value) - 1;
  } else if (mode === 'over') {
    chance = 100 - parseInt(targetNumberInput.value);
  } else if (mode === 'between') {
    const lower = parseInt(lowerBoundInput.value);
    const upper = parseInt(upperBoundInput.value);
    chance = upper - lower - 1;
  }

  if (chance <= 0 || chance >= 100) return "0.00";

  const houseEdge = 0.01;
  const multiplier = (100 / chance) * (1 - houseEdge);
  return multiplier.toFixed(2);
}

function updateMultiplierDisplay() {
  multiplierEl.textContent = `x${calculateMultiplier()}`;
}

function setMode(newMode) {
  mode = newMode;
  underBtn.classList.remove("active");
  betweenBtn.classList.remove("active");
  overBtn.classList.remove("active");

  underBtn.classList.toggle("active", mode === 'under');
  betweenBtn.classList.toggle("active", mode === 'between');
  overBtn.classList.toggle("active", mode === 'over');

  document.getElementById("overUnderControls").style.display = (mode === 'between') ? "none" : "block";
  document.getElementById("betweenControls").style.display = (mode === 'between') ? "block" : "none";

  updateSliderOverlay();
  updateMultiplierDisplay();
}

function rollDice() {
  const betAmount = parseFloat(betInput.value);
  if (betAmount <= 0 || betAmount > balance) {
    alert("Invalid bet.");
    return;
  }

  const roll = Math.floor(Math.random() * 100) + 1;
  const multiplier = parseFloat(calculateMultiplier());
  let won = false;

  const target = parseInt(targetNumberInput.value);
  const lower = parseInt(lowerBoundInput.value);
  const upper = parseInt(upperBoundInput.value);

  if (mode === 'under' && roll < target) won = true;
  if (mode === 'over' && roll > target) won = true;
  if (mode === 'between' && roll > lower && roll < upper) won = true;

  diceEl.style.transform = "rotate(720deg)";
  setTimeout(() => {
    diceEl.style.transform = "rotate(0deg)";
    diceEl.textContent = roll;

    if (won) {
      const winnings = betAmount * multiplier;
      balance += winnings - betAmount;
      resultEl.textContent = `You won! +$${(winnings - betAmount).toFixed(2)}`;
    } else {
      balance -= betAmount;
      resultEl.textContent = `You lost! -$${betAmount.toFixed(2)}`;
    }

    updateBalanceDisplay();
  }, 500);
}

// Event Listeners
slider.addEventListener("input", () => {
  targetNumberInput.value = slider.value;
  updateSliderOverlay();
  updateMultiplierDisplay();
});

targetNumberInput.addEventListener("input", () => {
  let val = Math.min(99, Math.max(1, parseInt(targetNumberInput.value)));
  slider.value = val;
  updateSliderOverlay();
  updateMultiplierDisplay();
});

lowerBoundInput.addEventListener("input", updateMultiplierDisplay);
upperBoundInput.addEventListener("input", updateMultiplierDisplay);

underBtn.addEventListener("click", () => setMode('under'));
betweenBtn.addEventListener("click", () => setMode('between'));
overBtn.addEventListener("click", () => setMode('over'));
document.getElementById("rollBtn").addEventListener("click", rollDice);

// Init
setMode("under");
updateBalanceDisplay();
