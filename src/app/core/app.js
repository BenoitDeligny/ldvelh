import { createModalStructure, openModal, closeModal, isModalOpen } from '../ui/modal.js';
import { setActiveScreen } from './navigation.js';
import { setState, getState, addVisitedStep } from './state.js';
import { updateMarkers } from '../ui/markers.js';
import { progressionData, screenStartNodes, getScreenForNumber } from '../data/progressionData.js';

// Handles clicks coming from markers.js
// Receives clickType: 'progression' or 'navigation'
export function handleMarkerClick(markerContent, clickType) {
    switch (clickType) {
        case 'progression':
            // Clicked a numeric marker (Green are always clickable, Orange only if current step)
            const clickedStepNumber = parseInt(markerContent, 10);
            if (isNaN(clickedStepNumber)) {
                console.error(`Progression click received for non-numeric content: ${markerContent}`);
                return;
            }

            // Get progression data for the *clicked* step number
            const stepData = progressionData[clickedStepNumber];
            if (stepData) {
                setState('modalContent', { type: 'progression', step: clickedStepNumber, choices: stepData.choices });
                openModal();
            } else {
                // Handle case where clicked step has no progression data (e.g., endpoint like 30)
                setState('modalContent', { type: 'info', message: `Étape ${clickedStepNumber} atteinte (fin de la progression ici?).` });
                openModal();
            }
            break;

        case 'navigation':
            // Clicked a navigation letter
            const targetScreenId = `screen_${markerContent.toLowerCase()}`;
            if (getState().markersData[targetScreenId]) {
                setActiveScreen(targetScreenId);
            } else {
                console.warn(`Navigation letter '${markerContent}' corresponds to unknown screen ID '${targetScreenId}'.`);
            }
            break;

        // case 'static_info': // Removed - No longer used
        //     break;

        default:
            console.warn(`Unhandled click type: ${clickType} for marker: ${markerContent}`);
    }
}

// Helper function to open the modal for the next step after potential screen updates
function openNextStepModal(step) {
    setTimeout(() => {
        const nextStepData = progressionData[step];
        if (nextStepData && nextStepData.choices && nextStepData.choices.length > 0) {
            setState('modalContent', { type: 'progression', step: step, choices: nextStepData.choices });
            openModal();
        } else {
            setState('modalContent', { type: 'info', message: `Vous avez atteint l'étape ${step}. Il n'y a pas d'autres choix ici.` });
            openModal();
        }
    }, 50);
}

// Handles choice selection from the progression modal
export function handleChoice(target) {
    let nextStep;
    let targetScreenId;
    const currentAppState = getState();
    // Get the step number associated with the modal that triggered the choice
    const choiceOriginStep = currentAppState.modalContent?.step; 
    const currentScreen = currentAppState.currentScreen;

    // Add the step *from which the choice was made* to visited steps
    if (choiceOriginStep !== undefined) {
        addVisitedStep(choiceOriginStep);
    } else {
        console.warn("Could not determine origin step for handleChoice.");
        // Fallback to adding current player step if needed?
        // addVisitedStep(currentAppState.currentPlayerStep);
    }

    // Determine next step and target screen based on choice
    if (typeof target === 'string') {
        targetScreenId = `screen_${target.toLowerCase()}`;
        nextStep = screenStartNodes[target];
        if (nextStep === undefined) {
            console.error(`No start node defined for screen letter: ${target}`);
            closeModal();
            return;
        }
    } else {
        nextStep = target;
        targetScreenId = getScreenForNumber(nextStep);
        if (!targetScreenId) {
            console.warn(`Could not find screen for step number: ${nextStep}. Defaulting to current screen ${currentScreen}.`);
            targetScreenId = currentScreen;
        }
    }

    // IMPORTANT: Update the player's current step state to the chosen next step
    setState('currentPlayerStep', nextStep);

    closeModal(); // Close the choice modal

    // Navigate or update markers based on screen change
    if (targetScreenId !== currentScreen) {
        setActiveScreen(targetScreenId);
        // Modal for the new step will be opened by openNextStepModal below
        openNextStepModal(nextStep);
    } else {
        // Staying on the same screen: Manually update markers
        updateMarkers(currentAppState.markersData[currentScreen], handleMarkerClick);
        // Open modal for the new step
        openNextStepModal(nextStep);
    }
}

// Handles rendering the correct screen based on URL hash or state
function handleScreenLoadOrHashChange() {
    const hash = window.location.hash;
    let targetScreenId = hash.substring(1); // Remove #

    const defaultScreen = 'screen_a';
    const state = getState();

    if (!targetScreenId || !state.markersData[targetScreenId]) {
        if (targetScreenId) {
           console.warn(`Invalid or missing screen data for hash: '${hash}'. Defaulting to ${defaultScreen}.`);
        }
        targetScreenId = defaultScreen;
        if (window.location.hash !== `#${defaultScreen}`) {
           history.replaceState(null, '', `#${defaultScreen}`);
        }
    }

    if (state.currentScreen !== targetScreenId) {
         setState('currentScreen', targetScreenId);
    }

    if (state.markersData[targetScreenId]) {
        updateMarkers(state.markersData[targetScreenId], handleMarkerClick);
    } else {
        console.error(`Marker data unexpectedly not found for screen: ${targetScreenId}`);
    }
}

// Initial application setup
function initializeApp() {
    createModalStructure();
    handleScreenLoadOrHashChange();
    window.addEventListener('hashchange', handleScreenLoadOrHashChange);
    console.log("Application Initialized - SPA Mode (Green markers always active)");
}

document.addEventListener('DOMContentLoaded', initializeApp);

