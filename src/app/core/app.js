import { createModalStructure, openModal, closeModal, isModalOpen } from '../ui/modal.js';
import { setActiveScreen, handleScreenLoadOrHashChange } from './navigation.js';
import { setState, getState, addVisitedStep } from './state.js';
import { updateMarkers } from '../ui/markers.js';
import { progressionData, screenStartNodes, getScreenForNumber } from '../data/progressionData.js';

export function handleMarkerClick(markerContent, clickType) {
    switch (clickType) {
        case 'progression':
            const clickedStepNumber = parseInt(markerContent, 10);
            if (isNaN(clickedStepNumber)) {
                console.error(`Progression click received for non-numeric content: ${markerContent}`);
                return;
            }
            const stepData = progressionData[clickedStepNumber];
            if (stepData && (stepData.choices?.length > 0 || stepData.combatInfo)) {
                setState('modalContent', { 
                    type: 'progression', 
                    step: clickedStepNumber, 
                    text: stepData.text,
                    choices: stepData.choices,
                    combatInfo: stepData.combatInfo
                });
                openModal();
            } else if (stepData) {
                setState('modalContent', { 
                    type: 'info', 
                    message: `Étape ${clickedStepNumber} atteinte. ${stepData?.text || 'Pas de description.'}`
                });
                openModal();
            } else {
                 console.error(`Data not found for step ${clickedStepNumber} in handleMarkerClick`);
                 setState('modalContent', { 
                    type: 'info', 
                    message: `Erreur: Données non trouvées pour l\'étape ${clickedStepNumber}.`
                });
                openModal();
            }
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

function openNextStepModal(step) {
    // Use setTimeout to slightly delay opening the next modal.
    // This can help prevent potential visual glitches or state inconsistencies 
    // if the new modal tries to open exactly at the same time the old one is closing,
    // or during the screen transition/marker update triggered by handleChoice/handlePostChoiceAction.
    // A small delay (like 50ms) usually gives the browser enough time to settle.
    setTimeout(() => {
        const nextStepData = progressionData[step];
        // Use the corrected condition from handleMarkerClick to check progression type
        if (nextStepData && (nextStepData.choices?.length > 0 || nextStepData.combatInfo)) {
            setState('modalContent', { 
                type: 'progression', 
                step: step, 
                text: nextStepData.text,
                choices: nextStepData.choices,
                combatInfo: nextStepData.combatInfo
            });
            openModal();
        } else if (nextStepData) { // Step exists but no choices/combat
             setState('modalContent', { 
                type: 'info', 
                message: `Vous avez atteint l\'étape ${step}. ${nextStepData?.text || ''}` // Display text if available
            });
            openModal();
        } else {
            // Handle case where step data doesn't exist
             console.error(`Data not found for step ${step} in openNextStepModal`);
             setState('modalContent', { 
                type: 'info', 
                message: `Erreur: Données non trouvées pour l\'étape ${step}.`
            });
            openModal(); // Open info modal even on error?
        }
    }, 50); 
}

// --- Helper function to determine target step and screen --- 
function determineChoiceTarget(target, currentScreen) {
    let nextStep;
    let targetScreenId;
    let isTargetScreenLetter = false;

    if (typeof target === 'string') {
        isTargetScreenLetter = true;
        targetScreenId = `screen_${target.toLowerCase()}`;
        nextStep = screenStartNodes[target];
        if (nextStep === undefined) {
            console.error(`No start node defined for screen letter: ${target}`);
            return null; // Indicate error: No start node found
        }
    } else {
        nextStep = target;
        targetScreenId = getScreenForNumber(nextStep);
        if (!targetScreenId) {
            // If screen not found for step, default to current screen but log warning
            console.warn(`Could not find screen for step number: ${nextStep}. Defaulting to current screen ${currentScreen}.`);
            targetScreenId = currentScreen; 
        }
    }
    return { nextStep, targetScreenId, isTargetScreenLetter };
}

// --- Helper function to handle actions after a choice is made --- 
function handlePostChoiceAction(targetInfo, currentScreen) {
    if (!targetInfo) return; // Exit if target determination failed

    const { nextStep, targetScreenId, isTargetScreenLetter } = targetInfo;

    // 1. Handle Navigation or Marker Update
    if (targetScreenId !== currentScreen) {
        // If screen changes, setActiveScreen will handle hash update and eventually marker update via hashchange
        setActiveScreen(targetScreenId);
    } else if (!isTargetScreenLetter) {
        // If same screen AND target was a number, update markers directly
        const currentAppState = getState(); 
        updateMarkers(currentAppState.markersData[currentScreen], handleMarkerClick);
    }
    // If same screen AND target was a letter, no immediate marker update needed (handled by hashchange or initial load)

    // 2. Open Next Modal if needed
    if (!isTargetScreenLetter) {
        // Only open next modal if the target was a number
        openNextStepModal(nextStep);
    }
}

// --- Refactored main function --- 
export function handleChoice(target) {
    const currentAppState = getState();
    const choiceOriginStep = currentAppState.modalContent?.step;
    const currentScreen = currentAppState.currentScreen;

    // Record the step the choice originated from
    if (choiceOriginStep !== undefined) {
        addVisitedStep(choiceOriginStep);
    } else {
        console.warn("Could not determine origin step for handleChoice.");
    }

    // Close the current modal first
    closeModal();

    // Determine where the choice leads
    const targetInfo = determineChoiceTarget(target, currentScreen);
    
    // Only proceed if the target was valid
    if (targetInfo) {
        // Update the player's current step state
        setState('currentPlayerStep', targetInfo.nextStep);
        // Perform navigation, marker updates, and open next modal as needed
        handlePostChoiceAction(targetInfo, currentScreen);
    } 
    // If targetInfo is null, an error was already logged by determineChoiceTarget
}

function initializeApp() {
    createModalStructure();
    handleScreenLoadOrHashChange();
    window.addEventListener('hashchange', handleScreenLoadOrHashChange);
    console.log("Application Initialized - SPA Mode");
}

document.addEventListener('DOMContentLoaded', initializeApp);

