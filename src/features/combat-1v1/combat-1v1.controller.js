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

// --- Character Loading Logic (Integrated) ---
const SLOTS_STORAGE_KEY_C1 = 'characterSlotsData'; // Suffix to avoid potential name collisions if merging later
const ACTIVE_CHAR_ID_KEY_C1 = 'activeCharacterId';

function loadActiveCharacterFromStorage() {
    try {
        const activeId = localStorage.getItem(ACTIVE_CHAR_ID_KEY_C1);
        if (!activeId) {
            console.warn("Combat 1v1: No active character ID found.");
            return null;
        }
        const savedSlots = localStorage.getItem(SLOTS_STORAGE_KEY_C1);
        if (!savedSlots) {
            console.error("Combat 1v1: Character slots not found.");
            return null;
        }
        const characters = JSON.parse(savedSlots);
        if (!Array.isArray(characters)) {
            console.error("Combat 1v1: Invalid character slots data.");
            return null;
        }
        const activeCharacter = characters.find(char => char.id && char.id.toString() === activeId);
        if (!activeCharacter) {
            console.warn(`Combat 1v1: Active character with ID ${activeId} not found.`);
            return null;
        }
        return activeCharacter;
    } catch (error) {
        console.error("Combat 1v1: Error loading active character:", error);
        return null;
    }
}
// --- End Character Loading Logic ---

let playerCharacter = null;
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
    const isPlayerTarget = target === playerCharacter;
    const defeated = applyDamageToTarget(target, damage); // Business logic
    
    // Log message (View update)
    addLogEntry(
        `${target.name} subit <span class="log-result">${damage}</span> points de dégâts de ${attackerName}. FC restante: ${target.currentCS}`,
        isPlayerTarget ? 'log-monster' : 'log-player' // CSS class based on who is attacked
    );
    
    // Update CS display (View update)
    updateCurrentCombatStrength(playerCharacter.currentCS, monster.currentCS);

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
    applyAndLogDamage(playerCharacter, damageRoll, monster.name); // Apply damage to player
}

// --- Event Handlers ---

function handlePlayerAttack() {
    if (combatEnded) return;
    
    addLogEntry(`Vous attaquez le <span class="log-monster">${monster.name}</span>...`, 'log-player');
    
    // Business logic calls
    const numDice = getDamageDice(playerCharacter.currentCS, playerCharacter.initialCS, playerCharacter.isPlayer);
    const damageRoll = (numDice === 0) ? 1 : rollMultipleD6(numDice); // Min 1 damage
    
    addLogEntry(`Vous lancez ${numDice}D6 (ou 1 pt min): ${damageRoll}`, 'log-player');
    const monsterDefeated = applyAndLogDamage(monster, damageRoll, playerCharacter.name); // Apply damage to monster

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
    const success = checkFleeSuccess(playerCharacter.dexterity, monster); 
    
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
    setupView(); // Initialize view references first

    playerCharacter = loadActiveCharacterFromStorage();

    if (!playerCharacter) {
        console.error("COMBAT 1v1 ERROR: No active player character loaded!");
        alert("Erreur : Aucun personnage actif trouvé. Veuillez en activer un depuis l\'écran de création.");
        document.body.innerHTML = "<p style='color: red; text-align: center; margin-top: 50px;'>Erreur: Personnage actif manquant.</p>";
        return; // Stop execution if no character
    }

    // Ensure player character has necessary properties 
    playerCharacter.initialCS = playerCharacter.combatStrength || 10; 
    playerCharacter.currentCS = playerCharacter.initialCS; 
    playerCharacter.dexterity = playerCharacter.dexterity || 3; 
    playerCharacter.isPlayer = true;

    // Reset monster state 
    monster = {
        name: "Squelette Viking Test",
        initialCS: 12,
        currentCS: 12,
        isPlayer: false
    };

    combatEnded = false;

    // Initial display
    displayInitialCombatState(playerCharacter, monster); 
    addLogEntry(`Un <span class="log-monster">${monster.name}</span> (FC: ${monster.initialCS}) apparaît !`);
    setActionButtonsState(false);

    console.log("Combat 1v1 Initialized with:", playerCharacter, monster);

    // Attach event listeners now that initialization is successful
    addAttackButtonListener(handlePlayerAttack);
    addFleeButtonListener(handlePlayerFlee);
}); 