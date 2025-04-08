// Controller for Character Creation: Handles user interactions and orchestrates view/model
import { generateStatsSet } from '../../shared/game-logic/character.logic.js';
import {
    setupView,
    displayOptions,
    getCharacterName,
    setRollButtonState,
    setSelectButtonsState,
    setCreateButtonState,
    highlightSelectedCard,
    clearSelectionHighlight,
    displayCreationSuccess,
    addRollButtonListener,
    addSelectButtonListeners,
    addNameInputListener,
    addCreateButtonListener
} from './character-creation.view.js';

// State managed by the controller
let generatedStats = [];
let selectedStats = null;

// --- Event Handlers ---

function handleRollStats() {
    generatedStats = []; // Clear previous stats
    selectedStats = null; // Reset selection

    for (let i = 0; i < 3; i++) {
        const stats = generateStatsSet(); // Call business logic
        generatedStats.push(stats);
    }

    // Update the view
    displayOptions(generatedStats);
    setRollButtonState(true); // Disable roll button
    setSelectButtonsState(false); // Enable select buttons
    clearSelectionHighlight();
    checkCreationReadiness();
}

function handleSelectStats(event) {
    const selectedOptionIndex = parseInt(event.target.dataset.option) - 1;
    selectedStats = generatedStats[selectedOptionIndex];

    // Update the view
    highlightSelectedCard(selectedOptionIndex);
    setSelectButtonsState(true); // Disable select buttons after selection
    checkCreationReadiness();
}

function handleNameInput() {
    // No specific logic needed here other than checking readiness
    checkCreationReadiness();
}

function handleCreateCharacter() {
    const characterName = getCharacterName();
    if (characterName && selectedStats) {
        // TODO: Implement actual character saving/next step logic here (e.g., call a state management service)
        displayCreationSuccess(characterName);
    } else {
        console.warn("Controller: Create button clicked but not ready (name or stats missing)");
    }
}

// --- Helper Logic ---

// Checks if the name is entered and stats are selected, then updates the create button state
function checkCreationReadiness() {
    const nameIsEntered = getCharacterName() !== '';
    const statsAreSelected = selectedStats !== null;
    const isReady = nameIsEntered && statsAreSelected;
    setCreateButtonState(!isReady); // Disable button if not ready
}

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    setupView(); // Initialize view (get DOM elements)

    // Attach event listeners via the view
    addRollButtonListener(handleRollStats);
    addSelectButtonListeners(handleSelectStats);
    addNameInputListener(handleNameInput);
    addCreateButtonListener(handleCreateCharacter);

    // Set initial button states
    checkCreationReadiness(); // Initial check for create button
    // Roll button is enabled by default in HTML
    setSelectButtonsState(true); // Select buttons initially disabled
}); 