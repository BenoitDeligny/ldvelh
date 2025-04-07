// View for Progression Screens: Handles DOM manipulations for markers

// DOM Selectors (used by modal.js and view.js)
export const markerAreaSelector = '.marker-area';
export const modalOverlaySelector = '#modal-overlay';
export const modalContentSelector = '#modal-content';
export const closeModalButtonSelector = '#modal-close';
export const modalDynamicContentId = 'modal-dynamic-content'; 

// DOM element references (initialized in setupView)
let markerArea; // Removed modal elements refs

// Initialize DOM element references for the view
export function setupView() { // Removed closeModalHandler param
    console.log("(Restored) Progression View: Getting DOM elements...");
    markerArea = document.querySelector(markerAreaSelector);
    if (!markerArea) {
        console.error("(Restored) Progression View: Marker area not found!");
        return false;
    }
    // No longer creates modal structure or gets modal refs here
    return true; 
}

// --- Marker Related DOM Functions ---
export function clearMarkers() {
    if (markerArea) {
        markerArea.innerHTML = '';
    } else {
         console.error("(Restored) clearMarkers: Marker area not found.");
    }
}

export function createAndAppendMarker(markerData, appState, clickHandler) {
    if (!markerArea) {
        console.error("(Restored) createAndAppendMarker: Marker area not found.");
        return;
    }

    const markerElement = document.createElement('div');
    markerElement.textContent = markerData.content;
    markerElement.className = `marker ${markerData.type}`;
    markerElement.style.top = markerData.top;
    markerElement.style.left = markerData.left;

    const markerContent = markerData.content;
    const markerNumber = parseInt(markerContent, 10);
    const isNumeric = !isNaN(markerNumber);
    const isCurrentActiveStep = isNumeric && markerNumber === appState.currentPlayerStep;
    const isVisited = isNumeric && appState.visitedSteps.has(markerNumber);
    const isCombatActive = appState.isCombatActive;
    const isThisCombatCompleted = isNumeric && appState.completedCombats.has(markerNumber);

    let isActive = false;
    let isNavLetter = false;

    if (isThisCombatCompleted) {
        markerElement.classList.add('marker--combat-completed');
    }

    if (markerData.type === 'navLetter') {
        isNavLetter = true;
        isActive = true; 
    } else if (markerData.type === 'greenNumber') {
        isActive = true; 
    } else if (markerData.type === 'orangeNumber') {
        isActive = isCurrentActiveStep || isVisited; 
    }

    markerElement.classList.toggle('marker--active', isActive);
    markerElement.classList.toggle('marker--inactive', !isActive);
    if (isNavLetter) {
        markerElement.classList.add('marker--nav-letter'); 
    }

    let isClickable = false;
    let clickType = 'none';

    if (isNavLetter) {
        isClickable = true;
        clickType = 'navigation';
    } else if (isActive && (markerData.type === 'greenNumber' || isCurrentActiveStep || isVisited)) {
        isClickable = true;
        clickType = 'progression';
    }

    if (isCombatActive) {
        isClickable = false;
    }

    if (isClickable && clickType !== 'none') {
        markerElement.style.cursor = 'pointer';
        markerElement.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            clickHandler(markerContent, clickType);
        });
    } else {
        markerElement.style.cursor = 'not-allowed'; 
    }

    markerArea.appendChild(markerElement);
}

// --- Modal Related DOM Functions REMOVED ---
// (createModalStructureIfNotExists, openModal, buildProgressionModalHTML, 
//  attachModalButtonListeners, closeModal, addModalCloseListeners, handleEscapeKey, isModalOpen)
// Imports related to modal logic are also removed implicitly as they are no longer used.

// Keep track of the close handler provided by the controller
let currentCloseModalHandler = null; 

// DOM element references (initialized in setupView)
let modalOverlay, modalContent, modalCloseButton, modalDynamicContent;

// Attach modal close listeners (using the handler from controller)
function addModalCloseListeners(closeHandler) {
    currentCloseModalHandler = closeHandler; // Store handler for escape key
    if (typeof closeHandler !== 'function') {
        console.warn("addModalCloseListeners: No valid close handler provided.");
        return;
    }
    const currentCloseButton = document.getElementById(closeModalButtonSelector.substring(1));
    if (currentCloseButton) {
        currentCloseButton.replaceWith(currentCloseButton.cloneNode(true)); 
        document.getElementById(closeModalButtonSelector.substring(1)).addEventListener('click', closeHandler);
    }
    
    const currentOverlay = document.getElementById(modalOverlaySelector.substring(1));
    if (currentOverlay) {
         // Store the parent before replacing
         const parent = currentOverlay.parentNode;
         const clone = currentOverlay.cloneNode(true);
         parent.replaceChild(clone, currentOverlay);
         
         // === FIX: Re-assign module variable to the new node ===
         modalOverlay = clone; 
         // ======================================================
         
         // Attach listener to the new node (now referenced by modalOverlay)
         modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) { // Check against the correct (new) node
                closeHandler();
            }
        });
    } else {
        console.error("Could not find overlay element in addModalCloseListeners");
    }
    
    document.removeEventListener('keydown', handleEscapeKey);
    document.addEventListener('keydown', handleEscapeKey);
}

// Separate handler for Escape key to allow removal and use stored handler
function handleEscapeKey(event) {
     if (event.key === "Escape" && getState().isModalOpen && currentCloseModalHandler) {
        currentCloseModalHandler();
    }
}

// Function to check modal state (might be useful for controller)
export function isModalOpen() {
    return getState().isModalOpen;
} 