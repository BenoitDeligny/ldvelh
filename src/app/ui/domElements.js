// --- DOM Element References & Selectors ---

// Elements expected to exist on page load
export function getAllMarkers() {
    return document.querySelectorAll('.marker');
}

export const markerAreaSelector = '.marker-area'; // Selector for the container

// Selectors for elements created dynamically (like the modal)
export const modalOverlaySelector = '#modal-overlay';
export const modalContentSelector = '#modal-content';
export const modalTextSelector = '#modal-text';
export const closeModalButtonSelector = '#modal-close';
