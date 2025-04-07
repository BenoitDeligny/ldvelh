// View for 1v1 Combat: Handles DOM manipulations

let playerNameEl, playerCsInitialEl, playerCsCurrentEl;
let monsterNameEl, monsterCsInitialEl, monsterCsCurrentEl;
let attackButton, fleeButton;
let logList, logContainer;

export function setupView() {
  console.log("Combat 1v1 View: Getting DOM elements...");
  playerNameEl = document.getElementById('player-name');
  playerCsInitialEl = document.getElementById('player-cs-initial');
  playerCsCurrentEl = document.getElementById('player-cs-current');
  monsterNameEl = document.getElementById('monster-name');
  monsterCsInitialEl = document.getElementById('monster-cs-initial');
  monsterCsCurrentEl = document.getElementById('monster-cs-current');
  attackButton = document.getElementById('attack-button');
  fleeButton = document.getElementById('flee-button');
  logList = document.getElementById('log-list');
  logContainer = logList ? logList.parentElement : null;

  // Basic check for essential elements
  if (!playerNameEl || !monsterNameEl || !attackButton || !fleeButton || !logList) {
      console.error("Combat 1v1 View: One or more essential elements not found!");
  }
}

// Display initial names and combat strengths
export function displayInitialCombatState(player, monster) {
  if(playerNameEl) playerNameEl.textContent = player.name;
  if(playerCsInitialEl) playerCsInitialEl.textContent = player.initialCS;
  if(monsterNameEl) monsterNameEl.textContent = monster.name;
  if(monsterCsInitialEl) monsterCsInitialEl.textContent = monster.initialCS;
  updateCurrentCombatStrength(player.currentCS, monster.currentCS); // Also display initial current CS
}

// Update the current combat strength values on the screen
export function updateCurrentCombatStrength(playerCS, monsterCS) {
  if(playerCsCurrentEl) playerCsCurrentEl.textContent = playerCS;
  if(monsterCsCurrentEl) monsterCsCurrentEl.textContent = monsterCS;
}

// Add a message to the combat log
export function addLogEntry(message, cssClass = 'log-system') {
  if (!logList) return;
  const li = document.createElement('li');
  li.innerHTML = message; // Use innerHTML to allow basic formatting like <b> or <span>
  li.className = cssClass;
  logList.appendChild(li);
  // Auto-scroll to the bottom
  if (logContainer) {
    logContainer.scrollTop = logContainer.scrollHeight;
  }
}

// Enable or disable the attack and flee buttons
export function setActionButtonsState(disabled) {
  if(attackButton) attackButton.disabled = disabled;
  if(fleeButton) fleeButton.disabled = disabled;
}

// Attach the event handler function to the attack button's click event
export function addAttackButtonListener(handler) {
  if (attackButton) attackButton.addEventListener('click', handler);
}

// Attach the event handler function to the flee button's click event
export function addFleeButtonListener(handler) {
  if (fleeButton) fleeButton.addEventListener('click', handler);
} 