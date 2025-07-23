let balance = 1000;
let mode = 'under';

const balanceEl = document.getElementById("balance");
const betInput = document.getElementById("betAmount");
const slider = document.getElementById("slider");
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
  const chance = mode === 'under'
    ? slider.value
    : mode === 'over'
    ? 100 - slider.value
    : 50; // Fixed example for between

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
  if (mode === 'under') underBtn.classList.add("active");
  if (mode === 'between') betweenBtn.classList.add("active");
  if (mode === 'over') overBtn.classList.add("active");
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
  const target = parseInt(slider.value);
  const multiplier = parseFloat(calculateMultiplier());

  diceEl.style.transform = "rotate(720deg)";
  setTimeout(() => {
    diceEl.style.transform = "rotate(0deg)";
    diceEl.textContent = roll;

    let won = false;
    if (mode === 'under' && roll < target) won = true;
    if (mode === 'over' && roll > target) won = true;
    if (mode === 'between' && roll > 33 && roll < 66) won = true; // Example between range

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
  updateSliderOverlay();
  updateMultiplierDisplay();
});

underBtn.addEventListener("click", () => setMode('under'));
betweenBtn.addEventListener("click", () => setMode('between'));
overBtn.addEventListener("click", () => setMode('over'));
document.getElementById("rollBtn").addEventListener("click", rollDice);

// Init
setMode("under");
updateBalanceDisplay();