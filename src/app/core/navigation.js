import { updateMarkers } from '../ui/markers.js';
import { getState, setState } from './state.js';
import { handleMarkerClick } from './app.js';

export function setActiveScreen(screenId) {
    const currentState = getState();
    if (!currentState.markersData[screenId]) {
        console.error(`Screen data not found for: ${screenId}`);
        return;
    }

    if (currentState.currentScreen !== screenId) {
        setState('currentScreen', screenId);
    }

    if (window.location.hash !== `#${screenId}`) {
        try {
            window.location.hash = `#${screenId}`;
        } catch (error) {
            console.error(`Error updating hash for ${screenId}:`, error);
        }
    } else {
        updateMarkers(currentState.markersData[screenId], handleMarkerClick);
    }
}

export function handleScreenLoadOrHashChange() {
    const hash = window.location.hash;
    let targetScreenId = hash.substring(1);

    const defaultScreen = 'screen_a'; // Consider making this a constant or configurable
    const state = getState();

    // Validate screen ID from hash
    if (!targetScreenId || !state.markersData[targetScreenId]) {
        if (targetScreenId) {
           console.warn(`Invalid or missing screen data for hash: '${hash}'. Defaulting to ${defaultScreen}.`);
        }
        targetScreenId = defaultScreen;
        // Correct the URL hash without adding to history if it was invalid
        if (window.location.hash !== `#${defaultScreen}`) {
           history.replaceState(null, '', `#${defaultScreen}`);
        }
    }

    // Update the global state if the screen derived from hash is different
    if (state.currentScreen !== targetScreenId) {
         setState('currentScreen', targetScreenId);
    }

    // Update the markers displayed based on the determined (and validated) target screen
    if (state.markersData[targetScreenId]) {
        updateMarkers(state.markersData[targetScreenId], handleMarkerClick);
    } else {
        // This case should be unlikely due to validation above
        console.error(`Marker data unexpectedly not found after validation for screen: ${targetScreenId}`);
    }
}
