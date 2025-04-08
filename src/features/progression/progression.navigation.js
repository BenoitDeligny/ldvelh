import { getState, setState } from './progression.state.js';

/**
 * Sets the active screen state and updates the URL hash.
 * This will trigger the 'hashchange' event listener in the controller.
 * @param {string} screenId - The ID of the screen to activate (e.g., 'screen_a').
 */
export function setActiveScreen(screenId) {
    const currentState = getState();
    if (!currentState.markersData || !currentState.markersData[screenId]) {
        console.error(`Navigation: Screen data not found for: ${screenId}`);
        return;
    }

    if (currentState.currentScreen !== screenId) {
        setState('currentScreen', screenId);
    }

    if (window.location.hash !== `#${screenId}`) {
        window.location.hash = `#${screenId}`;
    }
}

/**
 * Handles initial page load and subsequent hash changes.
 * Determines the target screen, updates state, and triggers marker updates via the controller.
 * @param {function} markerUpdateCallback - The function (likely in the controller) to call to update markers.
 */
export function handleScreenLoadOrHashChange(markerUpdateCallback) {
    const hash = window.location.hash;
    let targetScreenId = hash.substring(1);

    const defaultScreen = 'screen_a'; 
    const state = getState();

    if (!state.markersData) {
        console.error("Navigation: markersData not loaded in state! Cannot determine target screen.");
        return;
    }

    if (!targetScreenId || !state.markersData[targetScreenId]) {
        if (targetScreenId) {
           console.warn(`Navigation: Invalid/missing screen data for hash: '${hash}'. Defaulting to ${defaultScreen}.`);
        }
        targetScreenId = defaultScreen;
        if (window.location.hash !== `#${targetScreenId}`) {
           history.replaceState(null, '', `#${targetScreenId}`);
        }
    }

    if (state.currentScreen !== targetScreenId) {
         setState('currentScreen', targetScreenId);
    }

    if (markerUpdateCallback && typeof markerUpdateCallback === 'function') {
        markerUpdateCallback(); 
    } else {
        console.error("Navigation: Missing or invalid markerUpdateCallback function!");
    }
} 