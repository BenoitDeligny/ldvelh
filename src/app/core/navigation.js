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
