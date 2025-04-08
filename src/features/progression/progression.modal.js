// Handles modal logic: creation, opening, closing, content population

import { getState, setState } from './progression.state.js';
import { handleChoice, handleFleeCombat, handleEngageCombat, handleDoAction } from './progression.controller.js';

// Import DOM selectors defined in the view
import { modalOverlaySelector, modalContentSelector, closeModalButtonSelector, modalDynamicContentId } from './progression.view.js';

let currentCloseModalHandler = null;

// Creates the modal structure in the DOM if it doesn't exist.
export function createModalStructure() {
    if (document.querySelector(modalOverlaySelector)) {
        return; // Already exists
    }
    const modalHTML = `
        <div id="${modalOverlaySelector.substring(1)}" style="display: none;">
            <div id="${modalContentSelector.substring(1)}">
                <span id="${closeModalButtonSelector.substring(1)}">&times;</span>
                <div id="${modalDynamicContentId}"></div> 
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Sets up listeners for closing the modal (called by Controller)
export function setupModalCloseHandlers(closeHandler) {
    currentCloseModalHandler = closeHandler; // Store the handler
    const closeButton = document.querySelector(closeModalButtonSelector);
    const overlay = document.querySelector(modalOverlaySelector);

    // Close button listener
    if (closeButton) {
        // Simple re-attachment (less prone to errors than cloning)
        closeButton.onclick = currentCloseModalHandler; 
    }
    
    // Overlay listener
    if (overlay) {
        // Simple re-attachment
        overlay.onclick = (event) => { 
            if (event.target === overlay && currentCloseModalHandler) {
                currentCloseModalHandler();
            }
        };
    }
    
    // Escape key listener
    document.removeEventListener('keydown', handleEscapeKeyModal);
    document.addEventListener('keydown', handleEscapeKeyModal);
}

// Named handler for escape key to allow removal
function handleEscapeKeyModal(event) {
    if (event.key === "Escape" && getState().isModalOpen && currentCloseModalHandler) {
        currentCloseModalHandler();
    }
}

// Opens the modal and populates its content based on state
export function openModal() {
    const modal = document.querySelector(modalOverlaySelector);
    const modalDynamicContentElement = document.getElementById(modalDynamicContentId);
    const modalData = getState().modalContent;

    if (!modal || !modalDynamicContentElement || !modalData) {
        console.error('(Restored) Progression Modal: Elements or data not found for opening.', { modal, modalDynamicContentElement, modalData });
        return;
    }

    // Determine if combat step using combatInfo presence
    const isCombatStep = modalData.type === 'progression' && !!modalData.combatInfo;
    
    // Set global combat state if entering a combat step
    if (isCombatStep) {
        setState('isCombatActive', true);
    }

    let dynamicHTML = '';
    if (modalData.type === 'progression') {
        dynamicHTML = buildProgressionModalHTML(modalData, isCombatStep);
    } else if (modalData.type === 'info') {
        dynamicHTML = `<p>${modalData.message}</p>`;
    } else {
        dynamicHTML = `<p>Contenu non géré: ${JSON.stringify(modalData)}</p>`;
    }

    modalDynamicContentElement.innerHTML = dynamicHTML;

    // Attach listeners AFTER content is set
    attachModalButtonListeners(modalDynamicContentElement);

    modal.style.display = 'flex';
    // Controller should update isModalOpen state
}

// Builds the HTML for the progression modal type
function buildProgressionModalHTML(modalData, isCombatStep) {
    let html = `<h2>Étape ${modalData.step}</h2>`;
    if (modalData.text) {
        html += `<p class="modal-description">${modalData.text}</p><hr>`;
    }

    // Add Action button if actionInfo exists
    if (modalData.actionInfo && modalData.actionInfo.buttonText) {
        html += `<div class="action-container">
                    <button class="choice-button do-action-button action-button">${modalData.actionInfo.buttonText}</button>
                 </div><hr>`;
    }

    html += `<div class="original-choices-container" ${isCombatStep ? 'data-combat-active="true"' : ''}>`;
    if (modalData.choices && modalData.choices.length > 0) {
        html += `<p>Choix possibles :</p><ul class="modal-choices">`;
        modalData.choices.forEach((choice, index) => {
            const targetRepresentation = typeof choice.target === 'string' ? `Aller à l\'Écran ${choice.target}` : `Aller au Numéro ${choice.target}`;
            const buttonText = choice.text || targetRepresentation;
            // Add disabled attribute if it's a combat step
            const disabledAttr = isCombatStep ? 'disabled' : '';
            html += `<li><button class="choice-button original-choice-button action-button" data-choice-target='${JSON.stringify(choice.target)}' ${disabledAttr}>${buttonText}</button></li>`;
        });
        html += `</ul>`;
    } else {
        html += `<p>Il n\'y a pas de choix de progression ici.</p>`;
    }
    html += `</div>`;
    // Only add combat actions container if it's a combat step
    if (isCombatStep) {
        html += `<hr><div class="combat-actions-container">`;
        html += `<p>Actions immédiates :</p><ul class="modal-choices combat-actions">`;
        html += `<li><button class="choice-button flee-combat-button action-button">Fuir le combat</button></li>`;
        html += `<li><button class="choice-button engage-combat-button action-button">Combattre</button></li>`;
        html += `</ul></div>`;
    }
    return html;
}

// Attaches listeners to buttons inside the modal content
function attachModalButtonListeners(contentElement) {
    // Original choices
    contentElement.querySelectorAll('.original-choice-button').forEach(button => {
        button.addEventListener('click', (event) => { // Use event target
             if (event.target.disabled) return; // Ignore clicks on disabled buttons
            try {
                const target = JSON.parse(event.target.dataset.choiceTarget);
                // Controller's handleChoice manages state (including isCombatActive)
                handleChoice(target); 
            } catch (e) {
                console.error("(Restored) Progression Modal: Error parsing choice target:", event.target.dataset.choiceTarget, e);
            }
        });
    });

    // Do Action button
    const doActionButton = contentElement.querySelector('.do-action-button');
    if (doActionButton) {
        doActionButton.addEventListener('click', () => {
            // Call a new handler in the controller for specific actions
            handleDoAction(getState().modalContent?.step); // Pass the current step number
        });
    }

    // Flee button
    const fleeButton = contentElement.querySelector('.flee-combat-button');
    if (fleeButton) {
        fleeButton.addEventListener('click', handleFleeCombat);
    }
    // Engage button
    const engageButton = contentElement.querySelector('.engage-combat-button');
    if (engageButton) {
        engageButton.addEventListener('click', () => {
            handleEngageCombat(); // Call controller handler (might not do much)
            // Visually enable choices and hide combat actions
            const originalChoicesContainer = contentElement.querySelector('.original-choices-container');
            if (originalChoicesContainer) {
                // Remove the disabling attribute/style
                originalChoicesContainer.removeAttribute('data-combat-active');
                originalChoicesContainer.querySelectorAll('button').forEach(btn => btn.disabled = false);
                 // Adjust styles if needed (CSS might handle this better based on data-attribute)
                originalChoicesContainer.style.opacity = '1'; 
                originalChoicesContainer.style.pointerEvents = 'auto';
            }
            const combatActionsContainer = contentElement.querySelector('.combat-actions-container');
            if (combatActionsContainer) {
                combatActionsContainer.style.display = 'none';
            }
        });
    }
}

// Closes the modal display and clears its content
export function closeModal() {
    const modal = document.querySelector(modalOverlaySelector);
    if (modal) {
        modal.style.display = 'none';
    }
    const modalDynamicContentElement = document.getElementById(modalDynamicContentId);
    if (modalDynamicContentElement) {
        modalDynamicContentElement.innerHTML = ''; // Clear content
    }
    // Controller handles state changes
}

// Returns the current modal open state
export function isModalOpen() {
    return getState().isModalOpen;
} 