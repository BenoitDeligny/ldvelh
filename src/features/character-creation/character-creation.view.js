// View for Character Creation: Handles DOM manipulations

let rollButton, selectButtons, optionCards, nameInput, createButton, deleteAllButton, characterListContainer;

// Function to get references to DOM elements needed by the view
export function setupView() {
  rollButton = document.getElementById('roll-button');
  selectButtons = document.querySelectorAll('.select-button');
  optionCards = document.querySelectorAll('.stats-option-card');
  nameInput = document.getElementById('char-name');
  createButton = document.getElementById('create-button');
  deleteAllButton = document.getElementById('delete-all-btn');
  characterListContainer = document.getElementById('character-list');

  if (!rollButton || selectButtons.length === 0 || optionCards.length === 0 || !nameInput || !createButton || !deleteAllButton || !characterListContainer) {
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
    displayStatsInCard(stats, index + 1);
  });
}

// Function to get the current value of the character name input
export function getCharacterName() {
  return nameInput ? nameInput.value.trim() : '';
}

// Function to set the character name input value
export function setCharacterName(name) {
  if (nameInput) nameInput.value = name;
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

// Function to enable/disable the delete all button
export function setDeleteAllButtonState(disabled) {
    if (deleteAllButton) deleteAllButton.disabled = disabled;
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
  alert(`Personnage ${characterName} créé et sauvegardé !`);
}

// Function to clear the stats display in all cards
export function clearStatsDisplay() {
    for (let i = 1; i <= 3; i++) {
        displayStatsInCard({ power: '?', dexterity: '?', perception: '?', age: '?', combatStrength: '?' }, i);
    }
}

// Function to display the saved character stats (e.g., in the first card)
export function displaySavedCharacter(characterData) {
    clearStatsDisplay(); // Clear all first
    if (characterData) {
        displayStatsInCard(characterData, 1); // Display in card 1
        highlightSelectedCard(0); // Highlight card 1
    }
}

// Modified function to display the list of saved characters
export function displayCharacterList(characters, activeCharacterId) {
    if (!characterListContainer) return;

    characterListContainer.innerHTML = '';

    if (!characters || characters.length === 0) {
        characterListContainer.innerHTML = '<p>Aucun personnage sauvegardé.</p>';
        return;
    }

    characters.forEach(char => {
        const card = document.createElement('div');
        card.className = 'character-card'; 
        if (char.id && char.id.toString() === activeCharacterId) {
             card.classList.add('active-character');
        }

        card.innerHTML = `
            <h4>${char.name || 'Sans nom'}</h4>
            <p>F: ${char.power || '?'} | A: ${char.dexterity || '?'} | P: ${char.perception || '?'}</p>
            <p>Age: ${char.age || '?'} | FC: ${char.combatStrength || '?'}</p>
            <p><small>ID: ${char.id || 'N/A'}</small></p>
            <button class="activate-button action-button" data-char-id="${char.id}">Activer</button>
        `;

        const activateButton = card.querySelector('.activate-button');
        if (activateButton) {
            activateButton.addEventListener('click', (event) => {
                event.preventDefault();
                const characterIdToActivate = event.target.dataset.charId;
                // Dispatch custom event instead of calling handler directly
                const activateEvent = new CustomEvent('activateCharacterRequest', {
                    bubbles: true, // Allow event to bubble up
                    detail: { characterId: characterIdToActivate }
                });
                event.target.dispatchEvent(activateEvent); // Dispatch from the button
            });
        } else {
            console.error("Could not find activate button for card:", char.id);
        }

        characterListContainer.appendChild(card);
    });
}

// Helper function to display stats in a specific card
function displayStatsInCard(stats, cardIndex) {
    const powerStatEl = document.getElementById(`power-stat-${cardIndex}`);
    const dexterityStatEl = document.getElementById(`dexterity-stat-${cardIndex}`);
    const perceptionStatEl = document.getElementById(`perception-stat-${cardIndex}`);
    const ageStatEl = document.getElementById(`age-stat-${cardIndex}`);
    const combatStrengthEl = document.getElementById(`combat-strength-${cardIndex}`);

    if (powerStatEl) powerStatEl.textContent = stats.power ?? '?';
    if (dexterityStatEl) dexterityStatEl.textContent = stats.dexterity ?? '?';
    if (perceptionStatEl) perceptionStatEl.textContent = stats.perception ?? '?';
    if (ageStatEl) ageStatEl.textContent = stats.age ?? '?';
    if (combatStrengthEl) combatStrengthEl.textContent = stats.combatStrength ?? '?';
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

// Function to add event listener for the delete all button
export function addDeleteAllButtonListener(handler) {
    if (deleteAllButton) deleteAllButton.addEventListener('click', handler);
} 