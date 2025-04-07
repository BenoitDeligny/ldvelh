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

// --- Central Event Handler for Marker Clicks (Called by View/Markers) ---
export function handleMarkerClick(markerContent, clickType) {
    console.log(`Progression Controller: Marker clicked - Content: ${markerContent}, Type: ${clickType}`);
    switch (clickType) {
        case 'progression':
            const clickedStepNumber = parseInt(markerContent, 10);
            if (isNaN(clickedStepNumber)) {
                console.error(`Progression click received for non-numeric content: ${markerContent}`);
                return;
            }
            // Open modal for the clicked progression step
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
    
    console.log(`Progression Controller: Updating markers for screen ${currentScreenId}`);
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

    console.log(`Progression Controller: Choice selected. Target: ${JSON.stringify(target)}, Origin: ${choiceOriginStep}`);

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

// --- Modal Combat Action Handlers (EXPORTED) ---

export function handleFleeCombat() {
    console.log("Progression Controller: Flee combat chosen.");
    setState('isCombatActive', false);
    closeModal();
    updateMarkersForCurrentScreen();
}

export function handleEngageCombat() {
    console.log("Progression Controller: Engage combat chosen.");
}

// --- Handler for Modal Close Request (passed to modal setup) ---
function handleCloseModalRequest() {
    // === DEBUG LOG ===
    console.log("Progression Controller: handleCloseModalRequest() called.");
    // ================
    if (isModalOpen()) {
        console.log("Progression Controller: Modal close requested.");
        closeModal();
        setState('isModalOpen', false);
        setState('modalContent', null);
        if (getState().isCombatActive) {
            console.log("Controller: Resetting combat active state due to modal close.");
            setState('isCombatActive', false);
            updateMarkersForCurrentScreen();
        }
    }
}

// --- Application Initialization ---
function initializeApp() {
    console.log("(Restored) Progression Controller: Initializing application...");
    loadInitialData(); 

    // Setup View (only gets markerArea ref now)
    setupView(); 
    
    // Create modal structure using the function from modal.js
    createModalStructure(); 
    
    // Setup modal close handlers using the function from modal.js
    setupModalCloseHandlers(handleCloseModalRequest); 

    // Initial screen load and marker update
    handleScreenLoadOrHashChange(updateMarkersForCurrentScreen); 
    
    // Listen for future hash changes
    window.addEventListener('hashchange', () => handleScreenLoadOrHashChange(updateMarkersForCurrentScreen));
    
    console.log("(Restored) Progression Application Initialized");
}

document.addEventListener('DOMContentLoaded', initializeApp); 