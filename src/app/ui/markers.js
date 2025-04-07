import { screensData } from '../data/screenData.js';
import { markerAreaSelector } from './domElements.js';
import { getState } from '../core/state.js';

export function getMarkerType(markerElement) {
    const content = markerElement.textContent;
    const isLetter = isNaN(parseInt(content));
    const isOrange = markerElement.classList.contains('marker-letter');
    const isBackNav = markerElement.classList.contains('marker-nav-back');

    if (isBackNav) return 'backNav';
    if (isLetter && isOrange) return 'forwardNavLetter';
    if (!isLetter && isOrange) return 'orangeNumber';
    if (!isLetter && !isOrange) return 'greenNumber';
    return 'unknown';
}

export function generateMarkersForScreen(screenId) {
    const markerArea = document.querySelector(markerAreaSelector);
    if (!markerArea) {
        console.error('Marker area not found on page.');
        return;
    }

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

        switch (markerData.type) {
            case 'orangeNumber':
            case 'forwardNavLetter':
                markerElement.classList.add('marker-letter');
                break;
            case 'backNav':
                markerElement.classList.add('marker-nav-back');
                break;
        }

        markerArea.appendChild(markerElement);
    });

    return markerArea.querySelectorAll('.marker');
}

export function enableOrangeNumberMarkers() {
    document.querySelectorAll('.marker').forEach(marker => {
        const isLetter = isNaN(parseInt(marker.textContent));
        if (marker.classList.contains('marker-letter') && !isLetter) {
            marker.classList.add('enabled');
        }
    });
}

export function initializeMarkerVisualState(currentScreenId) {
    const isCurrentScreenUnlocked = isScreenUnlocked(currentScreenId);

    document.querySelectorAll('.marker').forEach(marker => {
        const type = getMarkerType(marker);

        if (type === 'forwardNavLetter') {
            marker.classList.add('enabled');
        } else if (type === 'orangeNumber' && isCurrentScreenUnlocked) {
            marker.classList.add('enabled');
        }
    });
}

function handleStaticInfoClick(markerContent, clickHandler) {
    clickHandler(markerContent, 'static_info');
}

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

        let isClickableForProgression = false;
        let isClickableForNavigation = false;

        switch (markerData.type) {
            case 'greenNumber':
                markerElement.classList.add('marker--active');
                isClickableForProgression = true;
                break;
            case 'orangeNumber':
                if (isCurrentActiveStep || visitedSteps.has(markerNumber)) {
                    markerElement.classList.add('marker--active');
                    isClickableForProgression = true;
                } else {
                    markerElement.classList.add('marker--inactive');
                }
                break;
            case 'navLetter':
                markerElement.classList.add('marker--nav-letter');
                markerElement.classList.add('marker--active');
                isClickableForNavigation = true;
                break;
            default:
                if (isCurrentActiveStep) {
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
