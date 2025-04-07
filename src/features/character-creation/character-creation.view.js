// View for Character Creation: Handles DOM manipulations

let rollButton, selectButtons, optionCards, nameInput, createButton;

// Function to get references to DOM elements needed by the view
export function setupView() {
  console.log("Character Creation View: Getting DOM elements...");
  rollButton = document.getElementById('roll-button');
  selectButtons = document.querySelectorAll('.select-button');
  optionCards = document.querySelectorAll('.stats-option-card');
  nameInput = document.getElementById('char-name');
  createButton = document.getElementById('create-button');

  if (!rollButton || selectButtons.length === 0 || optionCards.length === 0 || !nameInput || !createButton) {
    console.error("Character Creation View: One or more essential DOM elements not found!");
  }
}

// Function to display the generated stat options in the cards
export function displayOptions(options) {
  if (!options || options.length !== 3) {
    console.error("displayOptions: Invalid options array provided.");
    return;
  }
  options.forEach((stats, index) => {
    const i = index + 1;
    const powerStatEl = document.getElementById(`power-stat-${i}`);
    const dexterityStatEl = document.getElementById(`dexterity-stat-${i}`);
    const perceptionStatEl = document.getElementById(`perception-stat-${i}`);
    const ageStatEl = document.getElementById(`age-stat-${i}`);
    const combatStrengthEl = document.getElementById(`combat-strength-${i}`);

    if (powerStatEl) powerStatEl.textContent = stats.power;
    if (dexterityStatEl) dexterityStatEl.textContent = stats.dexterity;
    if (perceptionStatEl) perceptionStatEl.textContent = stats.perception;
    if (ageStatEl) ageStatEl.textContent = stats.age;
    if (combatStrengthEl) combatStrengthEl.textContent = stats.combatStrength;
  });
}

// Function to get the current value of the character name input
export function getCharacterName() {
  return nameInput ? nameInput.value.trim() : '';
}

// Function to enable/disable the roll button
export function setRollButtonState(disabled) {
  if (rollButton) rollButton.disabled = disabled;
}

// Function to enable/disable all select buttons
export function setSelectButtonsState(disabled) {
  selectButtons.forEach(btn => btn.disabled = disabled);
}

// Function to enable/disable the create button
export function setCreateButtonState(disabled) {
  if (createButton) createButton.disabled = disabled;
}

// Function to highlight the selected card and remove highlight from others
export function highlightSelectedCard(selectedIndex) {
  optionCards.forEach((card, index) => {
    card.classList.toggle('selected', index === selectedIndex);
  });
}

// Function to remove selection highlight from all cards
export function clearSelectionHighlight() {
  optionCards.forEach(card => card.classList.remove('selected'));
}

// Function to display the success message (using alert for now)
export function displayCreationSuccess(characterName) {
  alert(`Personnage ${characterName} créé avec succès ! (Vérifiez la console pour les détails)`);
  // TODO: Maybe replace alert with a nicer UI element later
}

// --- Functions to ADD event listeners (used by controller) ---

export function addRollButtonListener(handler) {
  if (rollButton) rollButton.addEventListener('click', handler);
}

export function addSelectButtonListeners(handler) {
  selectButtons.forEach(button => {
    button.addEventListener('click', handler);
  });
}

export function addNameInputListener(handler) {
  if (nameInput) nameInput.addEventListener('input', handler);
}

export function addCreateButtonListener(handler) {
  if (createButton) createButton.addEventListener('click', handler);
} 