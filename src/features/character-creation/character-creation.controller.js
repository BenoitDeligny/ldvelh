// Controller for Character Creation: Handles user interactions and orchestrates view/model
import { generateStatsSet } from '../../shared/game-logic/character.logic.js';
import {
    setupView,
    displayOptions,
    getCharacterName,
    setCharacterName,
    setRollButtonState,
    setSelectButtonsState,
    setCreateButtonState,
    setDeleteAllButtonState,
    highlightSelectedCard,
    clearSelectionHighlight,
    displayCreationSuccess,
    addRollButtonListener,
    addSelectButtonListeners,
    addNameInputListener,
    addCreateButtonListener,
    addDeleteAllButtonListener,
    clearStatsDisplay,
    displayCharacterList
} from './character-creation.view.js';

// Storage Keys
const SLOTS_STORAGE_KEY = 'characterSlotsData';
const ACTIVE_CHAR_ID_KEY = 'activeCharacterId';
const MAX_SLOTS = 3;

// State managed by the controller
let generatedStats = [];
let selectedStats = null;
let characterSlots = [];

// --- Local Storage Functions ---

function saveCharacters(characters) {
    try {
        localStorage.setItem(SLOTS_STORAGE_KEY, JSON.stringify(characters));
    } catch (error) {
        console.error("Failed to save character slots:", error);
    }
}

function loadCharacters() {
    try {
        const savedData = localStorage.getItem(SLOTS_STORAGE_KEY);
        if (savedData) {
            const characters = JSON.parse(savedData);
            return Array.isArray(characters) ? characters : [];
        }
    } catch (error) {
        console.error("Failed to load character slots:", error);
    }
    return [];
}

function deleteAllCharactersFromStorage() {
    try {
        localStorage.removeItem(SLOTS_STORAGE_KEY);
        localStorage.removeItem(ACTIVE_CHAR_ID_KEY);
        characterSlots = [];
        // console.log("All character slots and active ID deleted.");
    } catch (error) {
        console.error("Failed to delete character data:", error);
    }
}

function getActiveCharacterId() {
    return localStorage.getItem(ACTIVE_CHAR_ID_KEY);
}

function setActiveCharacter(characterId) {
    try {
        localStorage.setItem(ACTIVE_CHAR_ID_KEY, characterId);
        // console.log(`Character ${characterId} set as active.`);
        const activeId = getActiveCharacterId();
        displayCharacterList(characterSlots, activeId);
    } catch (error) {
        console.error(`Failed to set active character ${characterId}:`, error);
    }
}

// --- Event Handlers ---

function handleRollStats() {
    generatedStats = [];
    selectedStats = null;
    for (let i = 0; i < 3; i++) {
        const stats = generateStatsSet();
        generatedStats.push(stats);
    }
    displayOptions(generatedStats);
    setRollButtonState(true);
    setSelectButtonsState(false);
    clearSelectionHighlight();
    setCreateButtonState(true);
}

function handleSelectStats(event) {
    const selectedOptionIndex = parseInt(event.target.dataset.option) - 1;
    selectedStats = generatedStats[selectedOptionIndex];
    highlightSelectedCard(selectedOptionIndex);
    setSelectButtonsState(true);
    checkCreationReadiness();
}

function handleNameInput() {
    checkCreationReadiness();
}

function handleCreateCharacter() {
    const characterName = getCharacterName();
    if (characterName && selectedStats) {
        const newCharacter = {
            id: Date.now(),
            name: characterName,
            ...selectedStats
        };
        characterSlots = loadCharacters();
        if (characterSlots.length >= MAX_SLOTS) {
            characterSlots.shift();
        }
        characterSlots.push(newCharacter);
        saveCharacters(characterSlots);
        displayCreationSuccess(characterName);
        const activeId = getActiveCharacterId();
        displayCharacterList(characterSlots, activeId);
        setDeleteAllButtonState(false);
        selectedStats = null;
        clearStatsDisplay();
        clearSelectionHighlight();
        setRollButtonState(false);
        setSelectButtonsState(true);
        setCreateButtonState(true);
    }
}

function handleDeleteAllCharacters() {
    if (confirm("Êtes-vous sûr de vouloir effacer TOUS les personnages sauvegardés ?")) {
        deleteAllCharactersFromStorage();
        const activeId = getActiveCharacterId();
        displayCharacterList(characterSlots, activeId);
        selectedStats = null;
        setCharacterName('');
        clearStatsDisplay();
        clearSelectionHighlight();
        setRollButtonState(false);
        setSelectButtonsState(true);
        setCreateButtonState(true);
        setDeleteAllButtonState(true);
    }
}

// --- Helper Logic ---

function checkCreationReadiness() {
    const nameIsEntered = getCharacterName() !== '';
    const statsAreSelected = selectedStats !== null;
    const isReady = nameIsEntered && statsAreSelected;
    setCreateButtonState(!isReady);
}

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    setupView();
    characterSlots = loadCharacters();
    const activeId = getActiveCharacterId();
    displayCharacterList(characterSlots, activeId);
    setRollButtonState(false);
    setSelectButtonsState(true);
    setCreateButtonState(true);
    setDeleteAllButtonState(characterSlots.length === 0);
    setCharacterName('');
    clearStatsDisplay();
    addRollButtonListener(handleRollStats);
    addSelectButtonListeners(handleSelectStats);
    addNameInputListener(handleNameInput);
    addCreateButtonListener(handleCreateCharacter);
    addDeleteAllButtonListener(handleDeleteAllCharacters);

    document.body.addEventListener('activateCharacterRequest', (event) => {
        const characterIdToActivate = event.detail.characterId;
        if (characterIdToActivate) {
            // console.log(`Controller received activateCharacterRequest for ID: ${characterIdToActivate}`);
            setActiveCharacter(characterIdToActivate);
        }
    });
}); 