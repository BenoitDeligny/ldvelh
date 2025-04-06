// --- Marker Logic ---
import { screensData } from '../data/screenData.js'; // Import screen data
import { markerAreaSelector } from './domElements.js'; // Import marker area selector
import { getState } from '../core/state.js'; // Import ONLY getState

// Determines the type of marker based on its classes and content
// Reverted to check the element itself, simpler for the event handler
export function getMarkerType(markerElement) {
    const content = markerElement.textContent;
    const isLetter = isNaN(parseInt(content));
    const isOrange = markerElement.classList.contains('marker-letter');
    const isBackNav = markerElement.classList.contains('marker-nav-back');

    if (isBackNav) return 'backNav';
    if (isLetter && isOrange) return 'forwardNavLetter'; // Orange letter
    if (!isLetter && isOrange) return 'orangeNumber'; // Orange number
    if (!isLetter && !isOrange) return 'greenNumber'; // Must be green number
    return 'unknown';
}

// Generates marker HTML elements based on screen data and appends them
export function generateMarkersForScreen(screenId) {
    const markerArea = document.querySelector(markerAreaSelector);
    if (!markerArea) {
        console.error('Marker area not found on page.');
        return;
    }

    // Clear existing markers if any (e.g., for SPA navigation in future)
    markerArea.innerHTML = '';

    const screenMarkersData = screensData[screenId];
    if (!screenMarkersData) {
        console.error(`No data found for screen: ${screenId}`);
        return;
    }

    screenMarkersData.forEach(markerData => {
        const markerElement = document.createElement('div');
        markerElement.classList.add('marker');
        markerElement.style.top = markerData.top;
        markerElement.style.left = markerData.left;
        markerElement.textContent = markerData.content;

        // Add specific classes based on the type from data
        switch (markerData.type) {
            case 'orangeNumber':
            case 'forwardNavLetter':
                markerElement.classList.add('marker-letter');
                break;
            case 'backNav':
                markerElement.classList.add('marker-nav-back');
                break;
            // greenNumber doesn't need an extra class beyond 'marker'
        }

        markerArea.appendChild(markerElement);
    });

    // Return the NodeList of newly created markers for attaching listeners
    return markerArea.querySelectorAll('.marker');
}

// Enables the visual state of orange number markers
export function enableOrangeNumberMarkers() {
    // Select markers dynamically now
    document.querySelectorAll('.marker').forEach(marker => {
        // Need to determine type based on the generated element or associated data
        // Simpler: Check if it has marker-letter class but content is a number
        const isLetter = isNaN(parseInt(marker.textContent));
        if (marker.classList.contains('marker-letter') && !isLetter) {
            marker.classList.add('enabled');
        }
    });
}

// Initializes the visual state of markers based on type and persisted state
export function initializeMarkerVisualState(currentScreenId) {
    const isCurrentScreenUnlocked = isScreenUnlocked(currentScreenId);

    document.querySelectorAll('.marker').forEach(marker => {
        const type = getMarkerType(marker);

        if (type === 'forwardNavLetter') {
            marker.classList.add('enabled'); // Letters are always visually enabled
        } else if (type === 'orangeNumber' && isCurrentScreenUnlocked) {
            marker.classList.add('enabled'); // Enable orange numbers if state is persisted
        }
        // BackNav markers are enabled by CSS
        // Green numbers are enabled by CSS
        // Orange numbers without persisted state remain disabled by CSS
    });
}

// Simplified function to handle static info clicks (implementation in app.js)
function handleStaticInfoClick(markerContent, clickHandler) {
    // Pass the information to the main click handler, maybe with a specific type?
    clickHandler(markerContent, 'static_info');
}

export function updateMarkers(markersDataForScreen, clickHandler) {
    const container = document.querySelector(markerAreaSelector);
    if (!container) {
        console.error('Marker container not found.');
        return;
    }
    container.innerHTML = ''; // Clear previous markers

    const currentStep = getState().currentPlayerStep;

    markersDataForScreen.forEach(markerData => {
        const markerElement = document.createElement('div');
        markerElement.textContent = markerData.content;
        markerElement.className = `marker ${markerData.type}`;
        markerElement.style.top = markerData.top;
        markerElement.style.left = markerData.left;

        // --- Determine Marker State --- //
        const markerContent = markerData.content;
        const markerNumber = parseInt(markerContent, 10);
        const isNumeric = !isNaN(markerNumber);
        const isNavLetter = !isNumeric && markerData.type !== 'backNav';
        const isGreen = markerData.type === 'greenNumber';
        const isOrange = markerData.type === 'orangeNumber';
        const isCurrentActiveStep = isNumeric && markerNumber === currentStep;

        // --- Add State Classes (Revised Logic for Green Markers) --- //
        let isClickableForProgression = false;
        let isClickableForNavigation = false;
        // let isClickableForInfo = false; // Removed

        if (isGreen && isNumeric) {
            // ALL Green numeric markers are now active and clickable for progression
            markerElement.classList.add('marker--active');
            isClickableForProgression = true;
            // Optionally, add a specific visual distinction for the *actual* current step later if needed
            // if (isCurrentActiveStep) { markerElement.classList.add('marker--current-step-highlight'); }
        } else if (isOrange && isNumeric) {
            // Orange numeric markers: Active only if it's the current step
            if (isCurrentActiveStep) {
                markerElement.classList.add('marker--active');
                isClickableForProgression = true;
            } else {
                // Inactive orange numbers - currently not clickable
                markerElement.classList.add('marker--inactive');
                // Potentially add marker--disabled if unlock mechanic exists
            }
        } else if (isNavLetter) {
            // Navigation letters are always clickable for navigation
            markerElement.classList.add('marker--nav-letter');
            markerElement.classList.add('navLetter') // Match CSS background rule
            isClickableForNavigation = true;
        } else if (isNumeric) {
            // Catch-all for other numeric markers (if any type added later)
            // Default to inactive unless it's the current step
             if (isCurrentActiveStep) {
                markerElement.classList.add('marker--active');
                isClickableForProgression = true;
            } else {
                 markerElement.classList.add('marker--inactive');
            }
        }

        // --- Attach Event Listener --- //
        if (isClickableForProgression || isClickableForNavigation) {
            markerElement.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                let clickType = 'unknown';
                if (isClickableForProgression) clickType = 'progression';
                else if (isClickableForNavigation) clickType = 'navigation';
                // No longer sending 'static_info'
                clickHandler(markerContent, clickType);
            });
        }

        container.appendChild(markerElement);
    });
}

// Remove or comment out functions that are no longer needed or replaced
// export function getMarkerType(marker) { ... }
// export function enableOrangeNumberMarkers() { ... }
// export function initializeMarkerVisualState(screenId) { ... }
