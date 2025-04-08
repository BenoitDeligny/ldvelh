// View for Multi Combat: Handles DOM manipulations

let playerNameEl, playerCsInitialEl, playerCsCurrentEl, playerDexterityEl, playerDexterityDisplayEl;
let monsterListEl;
let attackButton, fleeButton;
let logList, logContainer;

export function setupView() {
    playerNameEl = document.getElementById('player-name');
    playerCsInitialEl = document.getElementById('player-cs-initial');
    playerCsCurrentEl = document.getElementById('player-cs-current');
    playerDexterityEl = document.getElementById('player-dexterity');
    playerDexterityDisplayEl = document.getElementById('player-dexterity-display');
    monsterListEl = document.getElementById('monster-list');
    attackButton = document.getElementById('attack-button');
    fleeButton = document.getElementById('flee-button');
    logList = document.getElementById('log-list');
    logContainer = logList ? logList.parentElement : null;

    if (!playerNameEl || !monsterListEl || !attackButton || !fleeButton || !logList) {
        console.warn("Multi Combat View: One or more essential elements might be missing!");
    }
}

// Update player display area
export function displayPlayerState(player) {
    if(playerNameEl) playerNameEl.textContent = player.name;
    if(playerCsInitialEl) playerCsInitialEl.textContent = player.initialCS;
    if(playerCsCurrentEl) playerCsCurrentEl.textContent = player.currentCS;
    if (playerDexterityEl) playerDexterityEl.textContent = player.dexterity;
    if (playerDexterityDisplayEl) playerDexterityDisplayEl.textContent = player.dexterity;
}

// Update the list of monsters display
export function displayMonstersState(monsters) {
    if (!monsterListEl) return;
    monsterListEl.innerHTML = ''; // Clear list
    monsters.forEach(monster => {
        const li = document.createElement('li');
        li.id = `monster-${monster.id}`; // Assign ID for potential future targeting
        if (monster.currentCS > 0) { 
            li.innerHTML = `
                <span class="monster-name">${monster.name}</span>
                <span>FC Initiale: ${monster.initialCS}</span> | 
                <span>FC Actuelle: <span class="monster-current-cs">${monster.currentCS}</span></span>
            `;
        } else {
            li.style.opacity = "0.5";
            li.innerHTML = `<span class="monster-name">${monster.name} (Vaincu)</span>`;
        }
        monsterListEl.appendChild(li);
    });
}

// Update the display for a single monster (e.g., after taking damage)
export function updateMonsterDisplay(monster) {
    const monsterEl = document.getElementById(`monster-${monster.id}`);
    if (monsterEl) {
        if (monster.currentCS > 0) {
            const csEl = monsterEl.querySelector('.monster-current-cs');
            if (csEl) csEl.textContent = monster.currentCS;
        } else { // Monster is defeated
            monsterEl.style.opacity = "0.5";
            monsterEl.innerHTML = `<span class="monster-name">${monster.name} (Vaincu)</span>`;
        }
    }
}

// Add entry to the combat log
export function addLogEntry(message, cssClass = 'log-system') {
    if (!logList) return;
    const li = document.createElement('li');
    li.innerHTML = message;
    li.className = cssClass;
    logList.appendChild(li);
    if (logContainer) {
        logContainer.scrollTop = logContainer.scrollHeight;
    }
}

// Enable/disable action buttons
export function setActionButtonsState(disabled) {
    if (attackButton) attackButton.disabled = disabled;
    if (fleeButton) fleeButton.disabled = disabled;
}

// Add listener to the attack button
export function addAttackListener(handler) {
    if (attackButton) attackButton.addEventListener('click', handler);
}

// Add listener to the flee button
export function addFleeListener(handler) {
    if (fleeButton) fleeButton.addEventListener('click', handler);
}

// Potentially add functions to update individual monster cards (e.g., after damage)
// export function updateMonsterCard(monsterId, monsterData) { ... } 