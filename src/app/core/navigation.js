// --- Navigation Logic ---
import { forwardNavConfig, backwardNavConfig } from './config.js';
import { updateMarkers } from '../ui/markers.js';
import { getState, setState } from './state.js';
import { handleMarkerClick } from './app.js';

// Handles navigation based on marker content and direction
export function navigate(markerContent, direction = 'forward') {
    const config = direction === 'forward' ? forwardNavConfig : backwardNavConfig;
    const destination = config[markerContent];

    if (destination) {
        window.location.href = destination;
    } else {
        // console.error removed previously
    }
}

export function navigateToScreen(screenId) {
    setState('currentScreen', screenId);
    const targetHtmlFile = `./${screenId}.html`;
    try {
        window.location.href = targetHtmlFile;
    } catch (error) {
        console.error(`Error navigating to ${targetHtmlFile}:`, error);
    }
}

// Sets the active screen, updates the hash, and triggers marker rendering.
export function setActiveScreen(screenId) {
    const currentState = getState();
    if (!currentState.markersData[screenId]) {
        console.error(`Screen data not found for: ${screenId}`);
        return;
    }

    // Only update hash and state if the screen is changing
    if (currentState.currentScreen !== screenId) {
        setState('currentScreen', screenId);
        try {
            // Update URL hash without triggering hashchange listener immediately
            // (to avoid double rendering if called from hashchange handler)
            // history.pushState(null, '', `#${screenId}`);
            // Simpler approach: Just change the hash. The hashchange listener will handle the update.
            window.location.hash = `#${screenId}`;
        } catch (error) {
            console.error(`Error updating hash for ${screenId}:`, error);
            // Fallback or alternative handling if needed
        }
    }

    // Always render the markers for the target screen
    // We need handleMarkerClick here, assuming updateMarkers needs it.
    // If updateMarkers doesn't directly need it, this dependency can be removed.
    updateMarkers(currentState.markersData[screenId], handleMarkerClick);
}
