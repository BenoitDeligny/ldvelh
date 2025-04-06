// --- Modal Management ---
// Note: domElements now exports selectors for the modal parts
import { modalOverlaySelector, modalContentSelector, closeModalButtonSelector } from './domElements.js';
import { getState, setState } from '../core/state.js'; // Import state access
import { handleChoice } from '../core/app.js'; // Import choice handler

// --- Functions ---

// Function to create the basic modal structure in the DOM
export function createModalStructure() {
    if (document.querySelector(modalOverlaySelector)) {
        return; // Avoid creating duplicates
    }

    const modalHTML = `
        <div id="modal-overlay" style="display: none;"> <!-- Start hidden -->
            <div id="modal-content">
                <span id="modal-close">&times;</span>
                <div id="modal-dynamic-content"></div> <!-- Container for dynamic text/choices -->
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Attach the main close listeners immediately after creation
    const closeButton = document.querySelector(closeModalButtonSelector);
    const overlay = document.querySelector(modalOverlaySelector);

    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
    if (overlay) {
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) { // Only close if clicking the overlay itself
                closeModal();
            }
        });
    }
     // Add Esc key listener
     document.addEventListener('keydown', (event) => {
        if (event.key === "Escape" && getState().isModalOpen) {
            closeModal();
        }
    });
}

// Function to open the modal and set its content dynamically using template literals
export function openModal() {
    const modal = document.querySelector(modalOverlaySelector);
    const modalDynamicContentElement = document.querySelector('#modal-dynamic-content');
    const modalData = getState().modalContent;

    if (!modal || !modalDynamicContentElement || !modalData) {
        console.error('Modal elements or data not found for opening.');
        return;
    }

    let dynamicHTML = ''; // Build HTML string

    if (modalData.type === 'progression') {
        dynamicHTML += `<h2>Étape ${modalData.step}</h2>`;
        if (modalData.choices && modalData.choices.length > 0) {
            dynamicHTML += `<p>Vous pouvez aller à :</p><ul class="modal-choices">`;
            modalData.choices.forEach((choice, index) => {
                const buttonText = typeof choice.target === 'string' ? `Écran ${choice.target}` : `Numéro ${choice.target}`;
                // Add data attributes to identify the choice target later
                dynamicHTML += `<li><button class="choice-button" data-choice-target='${JSON.stringify(choice.target)}' data-choice-index="${index}">${buttonText}</button></li>`;
            });
            dynamicHTML += `</ul>`;
        } else {
            dynamicHTML += `<p>Il n'y a pas d'autres choix à partir d'ici.</p>`;
        }
    } else if (modalData.type === 'info') {
        dynamicHTML += `<p>${modalData.message}</p>`;
    } else if (modalData.type === 'static') {
        dynamicHTML += `<h3>Info: Point ${modalData.content}</h3>`;
        dynamicHTML += `<p>Ceci est une information statique pour le point ${modalData.content}. Ajoutez plus de détails ici.</p>`;
        // Add more static info content as needed
    } else {
        dynamicHTML += `<p>Contenu par défaut: ${JSON.stringify(modalData)}</p>`;
    }

    // Set the generated HTML
    modalDynamicContentElement.innerHTML = dynamicHTML;

    // --- Attach Event Listeners AFTER setting innerHTML --- //
    if (modalData.type === 'progression' && modalData.choices && modalData.choices.length > 0) {
        modalDynamicContentElement.querySelectorAll('.choice-button').forEach(button => {
            // Retrieve the target from the data attribute
            const target = JSON.parse(button.dataset.choiceTarget);
            button.addEventListener('click', () => {
                handleChoice(target);
            });
        });
    }
    // --- End Event Listener Attachment --- //

    modal.style.display = 'flex';
    setState('isModalOpen', true);
}

// Function to close the modal
export function closeModal() {
    const modal = document.querySelector(modalOverlaySelector); // Query here
    if (modal) {
        modal.style.display = 'none';
        // Clear dynamic content when closing to prevent old listeners persisting?
        const modalDynamicContentElement = document.querySelector('#modal-dynamic-content');
        if (modalDynamicContentElement) {
             modalDynamicContentElement.innerHTML = '';
        }
    }
    setState('isModalOpen', false); // Update state
    setState('modalContent', null); // Clear modal content data
}

// Checks if the modal is currently open
export function isModalOpen() {
    // Directly check state, DOM check might be unreliable if called during transitions
    return getState().isModalOpen;
    // const overlay = document.querySelector(modalOverlaySelector);
    // return overlay && overlay.style.display === 'flex';
}
