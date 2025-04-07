import { modalOverlaySelector, modalContentSelector, closeModalButtonSelector } from './domElements.js';
import { getState, setState } from '../core/state.js';
import { handleChoice, handleMarkerClick } from '../core/app.js';
import { updateMarkers } from './markers.js';

export function createModalStructure() {
    if (document.querySelector(modalOverlaySelector)) {
        return;
    }

    const modalHTML = `
        <div id="modal-overlay" style="display: none;">
            <div id="modal-content">
                <span id="modal-close">&times;</span>
                <div id="modal-dynamic-content"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const closeButton = document.querySelector(closeModalButtonSelector);
    const overlay = document.querySelector(modalOverlaySelector);

    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
    if (overlay) {
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) { closeModal(); }
        });
    }
    document.addEventListener('keydown', (event) => {
        if (event.key === "Escape" && getState().isModalOpen) {
            closeModal();
        }
    });
}

export function openModal() {
    const modal = document.querySelector(modalOverlaySelector);
    const modalDynamicContentElement = document.querySelector('#modal-dynamic-content');
    const modalData = getState().modalContent;

    if (!modal || !modalDynamicContentElement || !modalData) {
        console.error('Modal elements or data not found for opening.');
        return;
    }

    let isCombatStep = false;
    if (modalData.type === 'progression' && modalData.step === 7) {
        setState('isCombatActive', true);
        isCombatStep = true;
    }

    let dynamicHTML = '';

    if (modalData.type === 'progression') {
        dynamicHTML += `<h2>Étape ${modalData.step}</h2>`;
        if (modalData.text) {
            dynamicHTML += `<p class="modal-description">${modalData.text}</p><hr>`;
        }

        dynamicHTML += `<div class="original-choices-container" ${isCombatStep ? 'style="opacity: 0.5;"' : ''}>`;
        if (modalData.choices && modalData.choices.length > 0) {
            dynamicHTML += `<p>Choix possibles :</p><ul class="modal-choices">`;
            modalData.choices.forEach((choice, index) => {
                const targetRepresentation = typeof choice.target === 'string' ? `Aller à l\'Écran ${choice.target}` : `Aller au Numéro ${choice.target}`;
                const buttonText = targetRepresentation;
                const disabledAttribute = isCombatStep ? 'disabled' : '';
                dynamicHTML += `<li><button class="choice-button original-choice-button" data-choice-target='${JSON.stringify(choice.target)}' data-choice-index="${index}" ${disabledAttribute}>${buttonText}</button></li>`;
            });
            dynamicHTML += `</ul></div>`;
        } else {
            dynamicHTML += `<p>Il n\'y a pas de choix de progression ici.</p></div>`;
        }

        if (isCombatStep) {
            dynamicHTML += `<hr><div class="combat-actions-container">`;
            dynamicHTML += `<p>Actions immédiates :</p><ul class="modal-choices combat-actions">`;
            dynamicHTML += `<li><button class="choice-button flee-combat-button">Fuir le combat</button></li>`;
            dynamicHTML += `<li><button class="choice-button engage-combat-button">Combattre</button></li>`;
            dynamicHTML += `</ul></div>`;
        }

    } else if (modalData.type === 'info') {
        dynamicHTML += `<p>${modalData.message}</p>`;
    } else {
        dynamicHTML += `<p>Contenu par défaut: ${JSON.stringify(modalData)}</p>`;
    }

    modalDynamicContentElement.innerHTML = dynamicHTML;

    setTimeout(() => {
        const fleeCombatButton = modalDynamicContentElement.querySelector('.flee-combat-button');
        const engageCombatButton = modalDynamicContentElement.querySelector('.engage-combat-button');
        const originalChoiceButtons = modalDynamicContentElement.querySelectorAll('.original-choice-button');

        if (fleeCombatButton) {
            fleeCombatButton.addEventListener('click', () => {
                setState('isCombatActive', false);
                closeModal();
                const currentState = getState();
                setTimeout(() => {
                    const updatedState = getState();
                     if (updatedState.markersData && updatedState.markersData[updatedState.currentScreen]) {
                        updateMarkers(updatedState.markersData[updatedState.currentScreen], handleMarkerClick);
                     }
                }, 0);
            });
        }

        if (engageCombatButton) {
            engageCombatButton.addEventListener('click', () => {
                const combatActionsContainer = modalDynamicContentElement.querySelector('.combat-actions-container');
                const originalChoicesContainer = modalDynamicContentElement.querySelector('.original-choices-container');

                if (combatActionsContainer) {
                    combatActionsContainer.style.display = 'none';
                } else {
                    console.error("[Modal Error] Combat actions container not found!");
                }
                if (originalChoicesContainer) {
                    originalChoicesContainer.style.opacity = '1';
                }

                originalChoiceButtons.forEach((btn, index) => {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                });
            });
        }

        originalChoiceButtons.forEach((button, index) => {
            const targetJson = button.dataset.choiceTarget;
            if (!targetJson) {
                console.error(`[Modal Error] Original choice button ${index} missing data-choice-target`);
                return;
            }
            try {
                 const target = JSON.parse(targetJson);
                 button.addEventListener('click', () => {
                    if (button.disabled) {
                        console.warn("[Modal Warning] Clicked button is disabled, ignoring.");
                        return;
                    }
                    if (getState().isCombatActive) {
                        setState('isCombatActive', false);
                    }
                    handleChoice(target);
                 });
            } catch (e) {
                console.error(`[Modal Error] Error parsing target for original choice button ${index}: ${targetJson}`, e);
            }
        });

    }, 0);

    modal.style.display = 'flex';
    setState('isModalOpen', true);
}

export function closeModal() {
    const modal = document.querySelector(modalOverlaySelector);
    if (modal) {
        modal.style.display = 'none';
        const modalDynamicContentElement = document.querySelector('#modal-dynamic-content');
        if (modalDynamicContentElement) {
            modalDynamicContentElement.innerHTML = '';
        }
    }
    setState('isModalOpen', false);
    setState('modalContent', null);
}

export function isModalOpen() {
    return getState().isModalOpen;
}
