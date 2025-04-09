// View for Multi Combat: Handles DOM manipulations

let playerSection, monstersSection, combatLog, attackButton, fleeButton;

// Setup: Get references to DOM elements
export function setupView() {
    playerSection = document.getElementById('player-section');
    monstersSection = document.getElementById('monsters-section');
    combatLog = document.getElementById('combat-log');
    attackButton = document.getElementById('attack-button');
    fleeButton = document.getElementById('flee-button');

    if (!playerSection || !monstersSection || !combatLog || !attackButton || !fleeButton) {
        console.error("Combat Multi View: Missing required DOM elements!");
    }
    combatLog.innerHTML = ''; // Clear log on setup
}

// Display Player State
export function displayPlayerState(player) {
    if (!playerSection || !player) return;
    playerSection.innerHTML = `
        <h3>${player.name}</h3>
        <p>FC: ${player.currentCS} / ${player.initialCS}</p>
        <p>Dés de combat: ${player.combatDiceCount !== undefined ? player.combatDiceCount + 'D6' : 'N/A'}</p>
        <p>Adresse: ${player.dexterity || 'N/A'}</p>
        <p>Puissance: ${player.power || 'N/A'}</p> 
        <p>Perception: ${player.perception || 'N/A'}</p> 
    `;
}

// Display Monster Groups State - Now includes allocation controls and current CS list
export function displayMonsterGroupsState(monsterGroups, targetAllocations = {}, maxDexterity, allocationHandlers) {
    if (!monstersSection) return;
    monstersSection.innerHTML = ''; // Clear previous monster display

    if (monsterGroups.length === 0) {
        monstersSection.innerHTML = '<p>Aucun adversaire restant.</p>';
        return;
    }

    let totalAllocated = Object.values(targetAllocations).reduce((sum, count) => sum + count, 0);

    monsterGroups.forEach(group => {
        const monsterCard = document.createElement('div');
        monsterCard.classList.add('monster-card');
        monsterCard.dataset.groupId = group.id;
        const allocatedCount = targetAllocations[group.id] || 0;

        // Generate the current CS list string
        const currentCSList = group.individualsData.map(ind => ind.currentCS).join(', ');

        monsterCard.innerHTML = `
            <h4>${group.name} (x${group.count})</h4>
            <p>FC (Initiale): ${group.initialCS}</p>
            <p class="current-cs-list">FC Actuelle: ${currentCSList}</p>
            <div class="allocation-controls">
                <button class="allocate-btn minus" data-group-id="${group.id}" ${allocatedCount === 0 ? 'disabled' : ''}>-</button>
                <span class="allocation-count" data-group-id="${group.id}">Ciblé: ${allocatedCount}</span>
                <button class="allocate-btn plus" data-group-id="${group.id}" ${(totalAllocated >= maxDexterity || allocatedCount >= group.count) ? 'disabled' : ''}>+</button>
            </div>
        `;

        // Add event listeners to new buttons
        const minusButton = monsterCard.querySelector('.allocate-btn.minus');
        const plusButton = monsterCard.querySelector('.allocate-btn.plus');

        if (minusButton && allocationHandlers.deallocate) {
            minusButton.addEventListener('click', () => allocationHandlers.deallocate(group.id));
        }
        if (plusButton && allocationHandlers.allocate) {
            plusButton.addEventListener('click', () => allocationHandlers.allocate(group.id));
        }

        monstersSection.appendChild(monsterCard);
    });

    // Update main attack button state
    if (attackButton) {
        attackButton.disabled = (totalAllocated === 0);
    }
}

// Function to specifically update allocation UI elements without full redraw
export function updateAllocationUI(targetAllocations, monsterGroups, maxDexterity) {
    if (!monstersSection || !attackButton || !monsterGroups) return;

    let totalAllocated = Object.values(targetAllocations).reduce((sum, count) => sum + count, 0);

    // Need monsterGroups to check group.count
    const groupsById = monsterGroups.reduce((acc, group) => {
        acc[group.id] = group;
        return acc;
    }, {});

    // Update buttons based on current allocations and group counts
    for (const groupId in targetAllocations) {
        const group = groupsById[groupId];
        if (!group) continue; // Skip if group doesn't exist anymore

        const allocatedCount = targetAllocations[groupId] || 0;
        const countSpan = monstersSection.querySelector(`.allocation-count[data-group-id="${groupId}"]`);
        const minusButton = monstersSection.querySelector(`.allocate-btn.minus[data-group-id="${groupId}"]`);
        const plusButton = monstersSection.querySelector(`.allocate-btn.plus[data-group-id="${groupId}"]`);

        if (countSpan) countSpan.textContent = `Ciblé: ${allocatedCount}`;
        if (minusButton) minusButton.disabled = (allocatedCount === 0);
        // Check group count from the passed monsterGroups array
        if (plusButton) plusButton.disabled = (totalAllocated >= maxDexterity || allocatedCount >= group.count);
    }

    attackButton.disabled = (totalAllocated === 0);
}

// Add Log Entry
export function addLogEntry(message, type = 'log-info') {
    if (!combatLog) return;
    const entry = document.createElement('p');
    entry.classList.add('log-entry', type);
    entry.innerHTML = message; // Use innerHTML to allow span styling
    combatLog.appendChild(entry);
    combatLog.scrollTop = combatLog.scrollHeight;
}

// Set Action Buttons State (Now primarily for Flee button and initial state)
export function setActionButtonsState(disabled, disableAttack = disabled) {
    // Keep flee button logic simple
    if (fleeButton) fleeButton.disabled = disabled;
    // Attack button disable state is now mostly handled by updateAllocationUI based on allocation count
    // Only use this for initial setup or forced disable (e.g., combat end)
    if (attackButton && disableAttack) {
        attackButton.disabled = disabled;
    }
}

// Add Attack Listener
export function addAttackListener(handler) {
    if (attackButton) {
        // Remove previous listener to avoid duplicates if re-initialized
        attackButton.replaceWith(attackButton.cloneNode(true));
        attackButton = document.getElementById('attack-button'); // Re-select after cloning
        attackButton.addEventListener('click', handler);
    }
}

// Add Flee Listener
export function addFleeListener(handler) {
    if (fleeButton) {
        // Remove previous listener
        fleeButton.replaceWith(fleeButton.cloneNode(true));
        fleeButton = document.getElementById('flee-button'); // Re-select after cloning
        fleeButton.addEventListener('click', handler);
    }
}

// Potentially add functions to update individual monster cards (e.g., after damage)
// export function updateMonsterCard(monsterId, monsterData) { ... } 