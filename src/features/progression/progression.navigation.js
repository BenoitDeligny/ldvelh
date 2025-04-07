import { getState, setState } from './progression.state.js';

/**
 * Sets the active screen state and updates the URL hash.
 * This will trigger the 'hashchange' event listener in the controller.
 * @param {string} screenId - The ID of the screen to activate (e.g., 'screen_a').
 */
export function setActiveScreen(screenId) {
    const currentState = getState();
    // Basic validation: check if screen data exists in state
    if (!currentState.markersData || !currentState.markersData[screenId]) {
        console.error(`Navigation: Screen data not found for: ${screenId}`);
        return;
    }

    // Update state only if the screen is actually changing
    if (currentState.currentScreen !== screenId) {
        setState('currentScreen', screenId);
    }

    // Update URL hash - THIS WILL TRIGGER the 'hashchange' event
    if (window.location.hash !== `#${screenId}`) {
        window.location.hash = `#${screenId}`;
    } else {
        // If hash is already correct (e.g., direct navigation call after load),
        // we might need to manually trigger the update if hashchange won't fire.
        // However, the current controller setup should handle this via the initial
        // handleScreenLoadOrHashChange call.
        console.log(`Navigation: Hash already set to #${screenId}. Hashchange might not fire.`);
    }
}

/**
 * Handles initial page load and subsequent hash changes.
 * Determines the target screen, updates state, and triggers marker updates via the controller.
 * @param {function} markerUpdateCallback - The function (likely in the controller) to call to update markers.
 */
export function handleScreenLoadOrHashChange(markerUpdateCallback) {
    const hash = window.location.hash;
    let targetScreenId = hash.substring(1); // Get ID from hash (e.g., 'screen_a')
    console.log("Navigation: Hash change or initial load. Hash:", hash);

    const defaultScreen = 'screen_a'; // Default screen if hash is invalid/empty
    const state = getState();

    // Ensure marker data is available in the state before proceeding
    if (!state.markersData) {
        console.error("Navigation: markersData not loaded in state! Cannot determine target screen.");
        // Optionally, attempt to load data or show a loading/error state
        return; 
    }

    // Validate the screen ID from the hash
    if (!targetScreenId || !state.markersData[targetScreenId]) {
        if (targetScreenId) {
           console.warn(`Navigation: Invalid/missing screen data for hash: '${hash}'. Defaulting to ${defaultScreen}.`);
        }
        targetScreenId = defaultScreen;
        // Correct the URL hash without adding to history if it was invalid
        if (window.location.hash !== `#${targetScreenId}`) {
           history.replaceState(null, '', `#${targetScreenId}`);
        }
    }

    // Update the currentScreen state if it differs from the target
    if (state.currentScreen !== targetScreenId) {
         setState('currentScreen', targetScreenId);
    }

    // Now, explicitly call the callback provided by the controller to update markers
    if (markerUpdateCallback && typeof markerUpdateCallback === 'function') {
        markerUpdateCallback(); // Trigger the marker update in the controller
    } else {
        console.error("Navigation: Missing or invalid markerUpdateCallback function!");
    }
} 