import { createModalStructure, openModal, closeModal, isModalOpen } from '../ui/modal.js';
import { setActiveScreen } from './navigation.js';
import { setState, getState, addVisitedStep } from './state.js';
import { updateMarkers } from '../ui/markers.js';
import { progressionData, screenStartNodes, getScreenForNumber } from '../data/progressionData.js';

// Handles clicks coming from markers.js
// Now receives a clickType: 'progression', 'navigation', or 'static_info'
export function handleMarkerClick(markerContent, clickType) {
    const currentStep = getState().currentPlayerStep;

    switch (clickType) {
        case 'progression':
            // This should only happen if the clicked marker *is* the current step
            const stepData = progressionData[currentStep];
            if (stepData) {
                setState('modalContent', { type: 'progression', step: currentStep, choices: stepData.choices });
                openModal();
            } else {
                // Handle case where current step has no progression data (shouldn't normally happen for active step?)
                setState('modalContent', { type: 'info', message: `Étape ${currentStep} atteinte (pas de données de progression).` });
                openModal();
            }
            break;

        case 'navigation':
            // Clicked a navigation letter
            const targetScreenId = `screen_${markerContent.toLowerCase()}`;
            if (getState().markersData[targetScreenId]) {
                setActiveScreen(targetScreenId); // Navigate SPA style
            } else {
                console.warn(`Navigation letter '${markerContent}' corresponds to unknown screen ID '${targetScreenId}'.`);
            }
            break;

        case 'static_info':
            // Clicked an inactive green number
            console.log(`Static info requested for: ${markerContent}`);
            // TODO: Implement the actual display logic for static info
            // Example: Open modal with static content
            setState('modalContent', {
                type: 'static', // Use the 'static' type defined in modal.js
                content: markerContent // Pass the content (e.g., "15")
            });
            openModal();
            break;

        default:
            console.warn(`Unhandled click type: ${clickType} for marker: ${markerContent}`);
    }
}

// Helper function to open the modal for the next step after potential screen updates
function openNextStepModal(step) {
    // Use setTimeout to allow DOM updates (marker rendering) to complete
    setTimeout(() => {
        const nextStepData = progressionData[step];
        if (nextStepData && nextStepData.choices && nextStepData.choices.length > 0) {
            setState('modalContent', { type: 'progression', step: step, choices: nextStepData.choices });
            openModal();
        } else {
            setState('modalContent', { type: 'info', message: `Vous avez atteint l'étape ${step}. Il n'y a pas d'autres choix ici.` });
            openModal();
        }
    }, 50); // Small delay for rendering
}

// Handles choice selection from the progression modal
export function handleChoice(target) {
    let nextStep;
    let targetScreenId;
    const currentAppState = getState();
    const currentStep = currentAppState.currentPlayerStep;
    const currentScreen = currentAppState.currentScreen;

    addVisitedStep(currentStep); // Mark current step as visited

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

    // Update the player's current step *before* navigation/rendering
    setState('currentPlayerStep', nextStep);

    closeModal(); // Close the current choice modal immediately

    // Navigate or update markers based on screen change
    if (targetScreenId !== currentScreen) {
        // Changing screens: setActiveScreen updates hash, triggers hashchange listener
        setActiveScreen(targetScreenId);
        // We need the modal for the *new* step AFTER the screen has rendered.
        // Use the helper function with setTimeout.
        openNextStepModal(nextStep);
    } else {
        // Staying on the same screen: Manually update markers and open modal
        updateMarkers(currentAppState.markersData[currentScreen], handleMarkerClick);
        openNextStepModal(nextStep); // Open modal for the new step
    }
}

// Handles rendering the correct screen based on URL hash or state
function handleScreenLoadOrHashChange() {
    const hash = window.location.hash;
    let targetScreenId = hash.substring(1); // Remove #

    const defaultScreen = 'screen_a';
    const state = getState();

    // Validate targetScreenId or use default
    if (!targetScreenId || !state.markersData[targetScreenId]) {
        if (targetScreenId) { // Only log if there was an invalid hash
           console.warn(`Invalid or missing screen data for hash: '${hash}'. Defaulting to ${defaultScreen}.`);
        }
        targetScreenId = defaultScreen;
        // Use replaceState to correct the URL hash without adding to history
        if (window.location.hash !== `#${defaultScreen}`) {
           history.replaceState(null, '', `#${defaultScreen}`);
        }
    }

    // Ensure app state reflects the screen being displayed
    if (state.currentScreen !== targetScreenId) {
         setState('currentScreen', targetScreenId);
    }

    // Render markers for the determined screen
    if (state.markersData[targetScreenId]) {
        updateMarkers(state.markersData[targetScreenId], handleMarkerClick);
    } else {
        // This case should ideally not be reached due to validation above
        console.error(`Marker data unexpectedly not found for screen: ${targetScreenId}`);
    }
    // Note: Modal opening is handled by handleChoice or handleMarkerClick, not directly on hashchange.
}

// Initial application setup
function initializeApp() {
    createModalStructure(); // Create the modal elements once

    // Perform initial screen load based on current URL hash
    handleScreenLoadOrHashChange();

    // Listen for hash changes to handle subsequent navigation
    window.addEventListener('hashchange', handleScreenLoadOrHashChange);

    console.log("Application Initialized - SPA Mode");
}

document.addEventListener('DOMContentLoaded', initializeApp);

