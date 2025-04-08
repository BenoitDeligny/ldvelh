import {
    setupView,
    clearMarkers,
    createAndAppendMarker
} from './progression.view.js';
import {
    createModalStructure, 
    openModal, 
    closeModal, 
    isModalOpen,
    setupModalCloseHandlers
} from './progression.modal.js';
import {
    setActiveScreen, 
    handleScreenLoadOrHashChange 
} from './progression.navigation.js';
import {
    setState, 
    getState, 
    addVisitedStep,
    loadInitialData
} from './progression.state.js';
import {
    progressionData, 
    screenStartNodes, 
    getScreenForNumber 
} from './progression.data.js';

// Import dice roller if needed for actions
import { rollD6 } from '../../shared/game-logic/dice.logic.js'; 

// --- Central Event Handler for Marker Clicks (Called by View/Markers) ---
export function handleMarkerClick(markerContent, clickType) {
    switch (clickType) {
        case 'progression':
            const clickedStepNumber = parseInt(markerContent, 10);
            if (isNaN(clickedStepNumber)) {
                console.error(`Progression click received for non-numeric content: ${markerContent}`);
                return;
            }
            openProgressionModalForStep(clickedStepNumber);
            break;

        case 'navigation':
            const targetScreenId = `screen_${markerContent.toLowerCase()}`;
            if (getState().markersData[targetScreenId]) {
                setActiveScreen(targetScreenId);
            } else {
                console.warn(`Navigation letter '${markerContent}' corresponds to unknown screen ID '${targetScreenId}'.`);
            }
            break;

        default:
            console.warn(`Unhandled click type: ${clickType} for marker: ${markerContent}`);
    }
}

// --- Marker Update Function (Called by Controller) ---
function updateMarkersForCurrentScreen() {
    const state = getState();
    const currentScreenId = state.currentScreen;
    
    if (!currentScreenId || !state.markersData || !state.markersData[currentScreenId]) {
        console.error("Controller: Cannot update markers, missing screen ID or data.", state);
        return;
    }
    
    clearMarkers();
    state.markersData[currentScreenId].forEach(markerData => {
        createAndAppendMarker(markerData, state, handleMarkerClick);
    });
}

// --- Helper to Open Modal for a Specific Progression Step ---
function openProgressionModalForStep(stepNumber) {
    const stepData = progressionData[stepNumber];
    if (stepData && (stepData.choices?.length > 0 || stepData.combatInfo)) {
        setState('modalContent', { 
            type: 'progression', 
            step: stepNumber, 
            text: stepData.text,
            choices: stepData.choices,
            combatInfo: stepData.combatInfo
        });
        openModal();
        setState('isModalOpen', true);
    } else if (stepData) {
        setState('modalContent', { 
            type: 'info', 
            message: `Étape ${stepNumber} atteinte. ${stepData?.text || 'Pas de description.'}`
        });
        openModal();
        setState('isModalOpen', true);
    } else {
        console.error(`Data not found for step ${stepNumber} in openProgressionModalForStep`);
        setState('modalContent', { 
            type: 'info', 
            message: `Erreur: Données non trouvées pour l\'étape ${stepNumber}.`
        });
        openModal();
        setState('isModalOpen', true);
    }
}

// --- Function called by Modal when a Choice Button is clicked ---
export function handleChoice(target) {
    const currentAppState = getState();
    const choiceOriginStep = currentAppState.modalContent?.step;
    const currentScreen = currentAppState.currentScreen;

    if (choiceOriginStep !== undefined) {
        addVisitedStep(choiceOriginStep);
    } else {
        console.warn("Could not determine origin step for handleChoice.");
    }

    closeModal();

    const targetInfo = determineChoiceTarget(target, currentScreen);
    
    if (targetInfo) {
        setState('currentPlayerStep', targetInfo.nextStep);
        handlePostChoiceAction(targetInfo, currentScreen);
    }
}

// --- Helper function to determine target step and screen --- 
function determineChoiceTarget(target, currentScreen) {
    let nextStep;
    let targetScreenId;
    let isTargetScreenLetter = false;

    if (typeof target === 'string' && target.match(/^[A-Z]$/)) {
        isTargetScreenLetter = true;
        targetScreenId = `screen_${target.toLowerCase()}`;
        nextStep = screenStartNodes[target];
        if (nextStep === undefined) {
            console.error(`Progression Controller: No start node defined for screen letter: ${target}`);
            return null;
        }
    } else if (typeof target === 'number') {
        nextStep = target;
        targetScreenId = getScreenForNumber(nextStep);
        if (!targetScreenId) {
            console.warn(`Progression Controller: Could not find screen for step number: ${nextStep}. Defaulting to current screen ${currentScreen}.`);
            targetScreenId = currentScreen; 
        }
    } else {
        console.error(`Progression Controller: Invalid target type in handleChoice: ${target}`);
        return null;
    }
    return { nextStep, targetScreenId, isTargetScreenLetter };
}

// --- Helper function to handle actions after a choice is made --- 
function handlePostChoiceAction(targetInfo, currentScreen) {
    if (!targetInfo) return;

    const { nextStep, targetScreenId, isTargetScreenLetter } = targetInfo;

    if (targetScreenId !== currentScreen) {
        setActiveScreen(targetScreenId);
    } else {
        updateMarkersForCurrentScreen();
    }

    if (!isTargetScreenLetter) {
        openProgressionModalForStep(nextStep);
    }
}

// --- Handler for the 'Do Action' button in the modal ---
export function handleDoAction(stepNumber) {
    if (stepNumber === undefined) {
        console.error("handleDoAction called without step number.");
        return;
    }
    const stepData = progressionData[stepNumber];
    const currentAppState = getState();
    const currentScreen = currentAppState.currentScreen;

    // Close the modal before proceeding
    closeModal();
    setState('isModalOpen', false);
    setState('modalContent', null);

    let outcomeTarget = null; // The target step/screen after the action
    let actionSuccess = false; // Assume failure initially

    // --- Specific Action Logic ---
    switch (stepNumber) {
        case 14: // Escalader la paroi
            // TODO: Replace with actual player stats access
            const adresseEscalade = 4; // Placeholder
            const rollEscalade = rollD6() + rollD6(); 
            console.log(`Action Escalade (Step 14): Roll (2D6) = ${rollEscalade}, Requis <= ${adresseEscalade + 0 /* Escalade/Survie bonus ?*/}`); 
            // Assuming success requires rolling *equal to or less than* the score (common LDVELH mechanic)
            // Adjust logic if it's roll >= targetNumber
            // The text says "faire 9 ou plus", so using >= 9
            actionSuccess = rollEscalade >= 9;
            outcomeTarget = actionSuccess ? 'C' : 8;
            break;

        case 15: // Briser la glace
            // TODO: Replace with actual player stats access
            const puissance = 5; // Placeholder
            const rollGlace = rollD6(); 
            console.log(`Action Briser Glace (Step 15): Roll (1D6) = ${rollGlace}, Requis <= ${puissance}`);
            // The text says "faire 7 ou plus", so using >= 7
            actionSuccess = rollGlace >= 7;
            // Note: Text mentions needing 9+ on re-roll if failed, not handled here yet.
            outcomeTarget = actionSuccess ? 16 : 'A'; // Simple success/failure for now
            break;

        case 17: // Grimper sur le tronc
            // TODO: Replace with actual player stats access
            const adresseEscaladeTronc = 4; // Placeholder
            const rollTronc = rollD6() + rollD6();
            console.log(`Action Grimper Tronc (Step 17): Roll (2D6) = ${rollTronc}, Requis <= ${adresseEscaladeTronc + 0 /* Escalade bonus ?*/}`);
            // The text says "faire 8 ou plus", so using >= 8
            actionSuccess = rollTronc >= 8;
            outcomeTarget = actionSuccess ? 21 : 18;
            // Need to also handle the choice to go back to A, maybe add back as a choice?
            break;

        case 24: // Rester sur la corniche
            // TODO: Replace with actual player stats access
            const adresseSurvie = 4; // Placeholder
            const rollCorniche = rollD6() + rollD6();
            console.log(`Action Rester Corniche (Step 24): Roll (2D6) = ${rollCorniche}, Requis <= ${adresseSurvie + 0 /* Survie bonus ?*/}`);
            // The text says "faire 12 ou plus", so using >= 12
            actionSuccess = rollCorniche >= 12;
            outcomeTarget = actionSuccess ? 30 : 26;
            break;

        default:
            console.warn(`No specific action defined for step ${stepNumber} in handleDoAction.`);
            // Optionally, just re-open the modal or do nothing
            return; 
    }

    // Add visited step regardless of outcome? Or only on success?
    addVisitedStep(stepNumber);

    // Determine the next step/screen based on the outcomeTarget
    const targetInfo = determineChoiceTarget(outcomeTarget, currentScreen);

    if (targetInfo) {
        console.log(`Action outcome: ${actionSuccess ? 'Success' : 'Failure'}. Moving to target:`, targetInfo);
        setState('currentPlayerStep', targetInfo.nextStep);
        handlePostChoiceAction(targetInfo, currentScreen); // Reuse existing logic for navigation/modal opening
    } else {
        console.error(`Could not determine target info for action outcome: ${outcomeTarget}`);
        // Fallback: Update markers on current screen? Show error?
        updateMarkersForCurrentScreen();
    }
}

// --- Modal Combat Action Handlers (EXPORTED) ---

export function handleFleeCombat() {
    setState('isCombatActive', false);
    closeModal();
    updateMarkersForCurrentScreen();
}

export function handleEngageCombat() {
}

// --- Handler for Modal Close Request (passed to modal setup) ---
function handleCloseModalRequest() {
    if (isModalOpen()) {
        closeModal();
        setState('isModalOpen', false);
        setState('modalContent', null);
        if (getState().isCombatActive) {
            setState('isCombatActive', false);
            updateMarkersForCurrentScreen();
        }
    }
}

// --- Application Initialization ---
function initializeApp() {
    loadInitialData(); 

    setupView(); 
    
    createModalStructure(); 
    
    setupModalCloseHandlers(handleCloseModalRequest); 

    handleScreenLoadOrHashChange(updateMarkersForCurrentScreen); 
    
    window.addEventListener('hashchange', () => handleScreenLoadOrHashChange(updateMarkersForCurrentScreen));
}

document.addEventListener('DOMContentLoaded', initializeApp); 