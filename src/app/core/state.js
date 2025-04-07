import { screensData } from '../data/screenData.js';

const STATE_STORAGE_KEY = 'gameState';
const CHECKSUM_SECRET_KEY = 'LdV3lhS3cr3tK3y!';

const defaultState = {
    currentScreen: 'screen_a',
    currentPlayerStep: 1,
    markersData: screensData,
    isModalOpen: false,
    modalContent: null,
    isCombatActive: false,
    visitedSteps: new Set(),
    completedCombats: new Set()
};

let currentState = { ...defaultState };

function simpleHash(str) {
  let hash = 0;
  if (!str) return hash.toString();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
}

function calculateChecksum(dataToSave, secret) {
    const sortedVisited = Array.from(dataToSave.visitedSteps || []).sort();
    const sortedCombats = Array.from(dataToSave.completedCombats || []).sort().map(Number);
    const dataString = JSON.stringify({
        cs: dataToSave.currentScreen || '',
        cp: dataToSave.currentPlayerStep || 0,
        vs: sortedVisited,
        cc: sortedCombats
    }) + secret;
    return simpleHash(dataString);
}

function loadStateFromLocalStorage() {
    try {
        const savedStateJSON = localStorage.getItem(STATE_STORAGE_KEY);
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            const storedChecksum = savedState.chk;

            const dataToCheck = {
                currentScreen: savedState.currentScreen,
                currentPlayerStep: savedState.currentPlayerStep,
                visitedSteps: savedState.visitedSteps,
                completedCombats: savedState.completedCombats
            };
            const calculatedChecksum = calculateChecksum(dataToCheck, CHECKSUM_SECRET_KEY);

            if (storedChecksum && storedChecksum === calculatedChecksum) {
                currentState = {
                    ...defaultState,
                    currentScreen: savedState.currentScreen || defaultState.currentScreen,
                    currentPlayerStep: savedState.currentPlayerStep || defaultState.currentPlayerStep,
                    visitedSteps: new Set(savedState.visitedSteps || []),
                    completedCombats: new Set(savedState.completedCombats || [])
                };
                console.log("Game state loaded and verified.");
            } else {
                console.warn("Checksum mismatch or missing! Resetting game state.");
                localStorage.removeItem(STATE_STORAGE_KEY);
                currentState = { ...defaultState, visitedSteps: new Set(), completedCombats: new Set() };
            }
        } else {
            currentState = { ...defaultState, visitedSteps: new Set(), completedCombats: new Set() };
            console.log("No saved game state found, initializing.");
        }
    } catch (error) {
        console.error('Error loading/verifying state:', error);
        localStorage.removeItem(STATE_STORAGE_KEY);
        currentState = { ...defaultState, visitedSteps: new Set(), completedCombats: new Set() };
    }
}

function saveStateToLocalStorage() {
    try {
        const stateToSave = {
            currentScreen: currentState.currentScreen,
            currentPlayerStep: currentState.currentPlayerStep,
            visitedSteps: Array.from(currentState.visitedSteps),
            completedCombats: Array.from(currentState.completedCombats || new Set())
        };
        stateToSave.chk = calculateChecksum(stateToSave, CHECKSUM_SECRET_KEY);
        localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
        console.error('Error saving game state:', error);
    }
}

export function getState() {
    return currentState;
}

export function setState(key, value) {
    const nonPersistentKeys = ['markersData', 'isModalOpen', 'modalContent'];
    if (currentState[key] !== value) {
        currentState = {
            ...currentState,
            [key]: value
        };
        if (!nonPersistentKeys.includes(key)) {
            saveStateToLocalStorage();
        }
    }
}

export function addVisitedStep(step) {
    if (currentState.visitedSteps.add(step)) {
        saveStateToLocalStorage();
    }
}

export function addCompletedCombat(step) {
    if (!currentState.completedCombats) {
        currentState.completedCombats = new Set();
    }
    if (!currentState.completedCombats.has(step)) {
        currentState.completedCombats.add(step);
        saveStateToLocalStorage();
    }
}

loadStateFromLocalStorage();
