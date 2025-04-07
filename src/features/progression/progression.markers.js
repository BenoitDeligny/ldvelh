import { screensData } from './progression.screens.js';
import { markerAreaSelector } from './progression.dom.js';
import { getState } from '../core/state.js';
// Re-import progressionData if needed for isCombatMarker check
// import { progressionData } from '../data/progressionData.js'; 

// Removed unused functions: getMarkerType, generateMarkersForScreen,
// enableOrangeNumberMarkers, initializeMarkerVisualState, handleStaticInfoClick

export function updateMarkers(markersDataForScreen, clickHandler) {
    const container = document.querySelector(markerAreaSelector);
    if (!container) {
        console.error('Marker container not found.');
        return;
    }
    container.innerHTML = '';

    const appState = getState();
    const currentStep = appState.currentPlayerStep;
    const visitedSteps = appState.visitedSteps;
    const isCombatActive = appState.isCombatActive;
    const completedCombats = appState.completedCombats;
    
    markersDataForScreen.forEach(markerData => {
        const markerElement = document.createElement('div');
        markerElement.textContent = markerData.content;
        markerElement.className = `marker ${markerData.type}`;
        markerElement.style.top = markerData.top;
        markerElement.style.left = markerData.left;

        const markerContent = markerData.content;
        const markerNumber = parseInt(markerContent, 10);
        const isNumeric = !isNaN(markerNumber);
        const isCurrentActiveStep = isNumeric && markerNumber === currentStep;
        const isThisCombatCompleted = isNumeric && completedCombats.has(markerNumber);

        if (isThisCombatCompleted) {
            markerElement.classList.add('marker--combat-completed');
        }

        let isClickableForProgression = false;
        let isClickableForNavigation = false;

        switch (markerData.type) {
            case 'greenNumber':
                 if (!isCombatActive) {
                     markerElement.classList.add('marker--active');
                     isClickableForProgression = true; 
                 } else {
                     markerElement.classList.add('marker--inactive');
                 }
                 break;
            case 'orangeNumber':
                 const canBeActive = isCurrentActiveStep || visitedSteps.has(markerNumber) || isThisCombatCompleted;
                 if (canBeActive && !isCombatActive) {
                     markerElement.classList.add('marker--active');
                     isClickableForProgression = true;
                 } else {
                     markerElement.classList.add('marker--inactive');
                 }
                 break;
            case 'navLetter':
                 markerElement.classList.add('marker--nav-letter');
                 markerElement.classList.add('marker--active');
                 if (!isCombatActive) {
                     isClickableForNavigation = true;
                 }
                 break;
            default:
                 if (!isCombatActive && isCurrentActiveStep) {
                     markerElement.classList.add('marker--active');
                     isClickableForProgression = true;
                 } else {
                     markerElement.classList.add('marker--inactive');
                 }
                 break;
        }

        if (isClickableForProgression || isClickableForNavigation) {
             markerElement.addEventListener('click', (event) => {
                 event.preventDefault();
                 event.stopPropagation();
                 let clickType = isClickableForProgression ? 'progression' : 'navigation';
                 clickHandler(markerContent, clickType);
             });
         }

        container.appendChild(markerElement);
    });
} 