// Controller for 1v1 Combat: Handles user interactions and orchestrates view/model
import {
    setupView,
    displayInitialCombatState,
    updateCurrentCombatStrength,
    addLogEntry,
    setActionButtonsState,
    addAttackButtonListener,
    addFleeButtonListener
} from './combat-1v1.view.js';
import { rollMultipleD6 } from '../../shared/game-logic/dice.logic.js';
import { getDamageDice, applyDamageToTarget, checkFleeSuccess } from '../../shared/game-logic/combat.logic.js';

// --- Combat State ---
let player = {
    name: "Héros Vaillant",
    initialCS: 15,
    currentCS: 15,
    dexterity: 4,
    isPlayer: true
};
let monster = {
    name: "Squelette Viking",
    initialCS: 7,
    currentCS: 7,
    isPlayer: false
    // Note: monster dexterity isn't used in checkFleeSuccess as currently defined in combat.js
};
let combatEnded = false;

// --- Core Combat Logic Execution ---

// Handles applying damage and checking for combat end
function applyAndLogDamage(target, damage, attackerName) {
    const isPlayerTarget = target === player;
    const defeated = applyDamageToTarget(target, damage); // Business logic
    
    // Log message (View update)
    addLogEntry(
        `${target.name} subit <span class="log-result">${damage}</span> points de dégâts de ${attackerName}. FC restante: ${target.currentCS}`,
        isPlayerTarget ? 'log-monster' : 'log-player' // CSS class based on who is attacked
    );
    
    // Update CS display (View update)
    updateCurrentCombatStrength(player.currentCS, monster.currentCS);

    if (defeated) {
        const message = isPlayerTarget ? "Vous avez été vaincu..." : `Vous avez vaincu le ${target.name} !`;
        endCombat(message);
    }
    return defeated;
}

// Handles the monster's attack turn
function monsterAttack() {
    if (combatEnded) return;
    
    addLogEntry(`Le <span class="log-monster">${monster.name}</span> attaque !`, 'log-monster');
    
    // Business logic calls
    const numDice = getDamageDice(monster.currentCS, monster.initialCS, monster.isPlayer);
    const damageRoll = (numDice === 0) ? 1 : rollMultipleD6(numDice); // Min 1 damage
    
    addLogEntry(`Le monstre lance ${numDice}D6 (ou 1 pt min): ${damageRoll}`, 'log-monster');
    applyAndLogDamage(player, damageRoll, monster.name); // Apply damage to player
}

// --- Event Handlers ---

function handlePlayerAttack() {
    if (combatEnded) return;
    
    addLogEntry(`Vous attaquez le <span class="log-monster">${monster.name}</span>...`, 'log-player');
    
    // Business logic calls
    const numDice = getDamageDice(player.currentCS, player.initialCS, player.isPlayer);
    const damageRoll = (numDice === 0) ? 1 : rollMultipleD6(numDice); // Min 1 damage
    
    addLogEntry(`Vous lancez ${numDice}D6 (ou 1 pt min): ${damageRoll}`, 'log-player');
    const monsterDefeated = applyAndLogDamage(monster, damageRoll, player.name); // Apply damage to monster

    // Monster attacks back if not defeated and combat not ended
    if (!combatEnded && !monsterDefeated) {
        // Use setTimeout to slightly delay the monster's attack for better readability
        setTimeout(monsterAttack, 500); 
    }
}

function handlePlayerFlee() {
    if (combatEnded) return;
    
    addLogEntry(`Vous tentez de <span class="log-player">fuir</span>...`, 'log-player');
    
    // Business logic call (Note: combat.js checkFleeSuccess currently only takes player dexterity and the opponent object)
    const success = checkFleeSuccess(player.dexterity, monster); 
    
    if (success) {
        addLogEntry(`<span class="log-result">Fuite réussie !</span>`, 'log-result');
        endCombat("Vous échappez au combat.");
    } else {
        addLogEntry(`La <span class="log-result">fuite échoue !</span>`, 'log-result');
        // Monster attacks if flee fails
        setTimeout(monsterAttack, 500); 
    }
}

// --- Combat End Logic ---

function endCombat(message) {
    if (combatEnded) return; // Prevent multiple calls
    addLogEntry(`<b>${message}</b>`, 'log-result');
    setActionButtonsState(true); // Disable buttons (View update)
    combatEnded = true;
}

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("Combat 1v1 Controller: Initializing...");
    setupView(); // Initialize view references

    // Reset state for potential reloads (though typically state would come from elsewhere)
    player.currentCS = player.initialCS;
    monster.currentCS = monster.initialCS;
    combatEnded = false;

    // Initial display
    displayInitialCombatState(player, monster); 
    addLogEntry(`Un <span class="log-monster">${monster.name}</span> (FC: ${monster.initialCS}) apparaît !`);
    setActionButtonsState(false); // Ensure buttons are enabled initially

    // Attach event listeners
    addAttackButtonListener(handlePlayerAttack);
    addFleeButtonListener(handlePlayerFlee);

    console.log("Combat 1v1 Controller: Initialization complete.");
}); 