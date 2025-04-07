import { modalOverlaySelector, modalContentSelector, closeModalButtonSelector } from './domElements.js';
import { getState, setState } from '../core/state.js';
import { handleChoice } from '../core/app.js';

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

    let dynamicHTML = '';

    if (modalData.type === 'progression') {
        dynamicHTML += `<h2>Étape ${modalData.step}</h2>`;
        if (modalData.text) {
            dynamicHTML += `<p class="modal-description">${modalData.text}</p>`;
        }
        if (modalData.choices && modalData.choices.length > 0) {
            dynamicHTML += `<p>Vous pouvez aller à :</p><ul class="modal-choices">`;
            modalData.choices.forEach((choice, index) => {
                const buttonText = typeof choice.target === 'string' ? `Écran ${choice.target}` : `Numéro ${choice.target}`;
                dynamicHTML += `<li><button class="choice-button" data-choice-target='${JSON.stringify(choice.target)}' data-choice-index="${index}">${buttonText}</button></li>`;
            });
            dynamicHTML += `</ul>`;
        } else {
            dynamicHTML += `<p>Il n'y a pas d'autres choix à partir d'ici.</p>`;
        }
    } else if (modalData.type === 'info') {
        dynamicHTML += `<p>${modalData.message}</p>`;
    } else {
        dynamicHTML += `<p>Contenu par défaut: ${JSON.stringify(modalData)}</p>`;
    }

    modalDynamicContentElement.innerHTML = dynamicHTML;

    if (modalData.type === 'progression' && modalData.choices && modalData.choices.length > 0) {
        modalDynamicContentElement.querySelectorAll('.choice-button').forEach(button => {
            const target = JSON.parse(button.dataset.choiceTarget);
            button.addEventListener('click', () => {
                handleChoice(target);
            });
        });
    }

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
