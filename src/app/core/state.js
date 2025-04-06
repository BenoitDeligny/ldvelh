// --- Application State Management --- //
import { screensData } from '../data/screenData.js';

// Key for storing the main game state in localStorage
const STATE_STORAGE_KEY = 'gameState';

// Default state structure
const defaultState = {
    currentScreen: 'screen_a', // Default starting screen
    currentPlayerStep: 1,       // Default starting step
    markersData: screensData,    // Static data, not persisted
    isModalOpen: false,         // Transient state, not persisted
    modalContent: null,        // Transient state, not persisted
    visitedSteps: new Set()      // Persisted as an array
};

// In-memory representation of the current state
let currentState = { ...defaultState };

// --- State Persistence (using localStorage) --- //

// Loads state from localStorage on application start
function loadStateFromLocalStorage() {
    try {
        const savedStateJSON = localStorage.getItem(STATE_STORAGE_KEY);
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            // Merge saved state with defaults, ensuring correct types
            currentState = {
                ...defaultState, // Start with defaults (especially for non-persisted parts)
                currentScreen: savedState.currentScreen || defaultState.currentScreen,
                currentPlayerStep: savedState.currentPlayerStep || defaultState.currentPlayerStep,
                visitedSteps: new Set(savedState.visitedSteps || []) // Recreate Set from array
            };
            console.log("Game state loaded from localStorage.", currentState);
        } else {
             // No saved state found, initialize with defaults
             currentState = { ...defaultState, visitedSteps: new Set() };
             console.log("No saved game state found, initializing with defaults.");
             // Optionally save the initial default state immediately
             // saveStateToLocalStorage();
        }
    } catch (error) {
        console.error('Error loading game state from localStorage:', error);
        // Fallback to default state in case of error
        currentState = { ...defaultState, visitedSteps: new Set() };
    }
}

// Saves the persistent parts of the state to localStorage
function saveStateToLocalStorage() {
    try {
        // Only include keys that should be persisted
        const stateToSave = {
            currentScreen: currentState.currentScreen,
            currentPlayerStep: currentState.currentPlayerStep,
            visitedSteps: Array.from(currentState.visitedSteps) // Convert Set to Array for JSON
        };
        localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(stateToSave));
        // console.log("Game state saved:", stateToSave); // Optional: for debugging
    } catch (error) {
        console.error('Error saving game state to localStorage:', error);
    }
}

// --- State Accessors and Mutators --- //

// Returns the current state object (read-only copy recommended practice, but direct for simplicity now)
export function getState() {
    return currentState;
}

// Updates a specific key in the state and triggers persistence if needed
export function setState(key, value) {
    // Keys that should NOT trigger a save to localStorage
    const nonPersistentKeys = ['markersData', 'isModalOpen', 'modalContent'];

    // Check if the value is actually changing to prevent unnecessary updates/saves
    if (currentState[key] !== value) {
        currentState = {
            ...currentState,
            [key]: value
        };

        // Trigger save only if the key is meant to be persistent
        if (!nonPersistentKeys.includes(key)) {
            saveStateToLocalStorage();
        }
    } else {
        // console.log(`State key '${key}' already has value:`, value); // Optional debug log
    }
}

// Adds a step to the visited set and persists the state
export function addVisitedStep(step) {
    // Add returns true if the value was added (wasn't already present)
    if (currentState.visitedSteps.add(step)) {
        saveStateToLocalStorage(); // Save only if the set was actually modified
    }
}

// Resets the state to initial values and persists
export function resetState(initialState = defaultState) {
    // Ensure visitedSteps is always a new Set instance
    currentState = { ...initialState, visitedSteps: new Set(initialState.visitedSteps || []) };
    saveStateToLocalStorage();
    console.log("Game state reset to defaults.");
    // Optional: Reload the page or update UI after reset
    // window.location.reload();
}

// --- Initialization --- //
// Load the state from storage when the module is first imported
loadStateFromLocalStorage();

// --- Removed Old/Unused Code --- //
// Removed functions related to STORAGE_KEY 'screenUnlockStates'
// function getUnlockStates() { ... }
// function saveUnlockStates(states) { ... }
// export function isScreenUnlocked(screenId) { ... }
// export function setScreenUnlocked(screenId) { ... }

