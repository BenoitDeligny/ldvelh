import { createModalStructure, openModal, closeModal, isModalOpen } from '../ui/modal.js';
import { setActiveScreen } from './navigation.js';
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
            if (stepData && stepData.choices && stepData.choices.length > 0) {
                setState('modalContent', { 
                    type: 'progression', 
                    step: clickedStepNumber, 
                    text: stepData.text,
                    choices: stepData.choices 
                });
                openModal();
            } else {
                setState('modalContent', { 
                    type: 'info', 
                    message: `Étape ${clickedStepNumber} atteinte. ${stepData?.text || ''}`
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
    setTimeout(() => {
        const nextStepData = progressionData[step];
        if (nextStepData && nextStepData.choices && nextStepData.choices.length > 0) {
            setState('modalContent', { 
                type: 'progression', 
                step: step, 
                text: nextStepData.text,
                choices: nextStepData.choices 
            });
            openModal();
        } else {
            setState('modalContent', { 
                type: 'info', 
                message: `Vous avez atteint l'étape ${step}. ${nextStepData?.text || ''}`
            });
            openModal();
        }
    }, 50);
}

export function handleChoice(target) {
    let nextStep;
    let targetScreenId;
    const currentAppState = getState();
    const choiceOriginStep = currentAppState.modalContent?.step;
    const currentScreen = currentAppState.currentScreen;

    if (choiceOriginStep !== undefined) {
        addVisitedStep(choiceOriginStep);
    } else {
        console.warn("Could not determine origin step for handleChoice.");
    }

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

    setState('currentPlayerStep', nextStep);

    closeModal();

    if (targetScreenId !== currentScreen) {
        setActiveScreen(targetScreenId);
        openNextStepModal(nextStep);
    } else {
        updateMarkers(currentAppState.markersData[currentScreen], handleMarkerClick);
        openNextStepModal(nextStep);
    }
}

function handleScreenLoadOrHashChange() {
    const hash = window.location.hash;
    let targetScreenId = hash.substring(1);

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

function initializeApp() {
    createModalStructure();
    handleScreenLoadOrHashChange();
    window.addEventListener('hashchange', handleScreenLoadOrHashChange);
    console.log("Application Initialized - SPA Mode (Green markers always active)");
}

document.addEventListener('DOMContentLoaded', initializeApp);

