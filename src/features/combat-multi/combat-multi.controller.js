// Controller for Multi Combat: Handles user interactions and orchestrates view/model
import {
    setupView,
    displayPlayerState,
    displayMonstersState,
    updateMonsterDisplay,
    addLogEntry,
    setActionButtonsState,
    addAttackListener,
    addFleeListener
} from './combat-multi.view.js'; // Updated: View is in the same directory
import { rollMultipleD6 } from '../../shared/game-logic/dice.logic.js'; // Updated path
import { getDamageDice, applyDamageToTarget, checkFleeSuccess } from '../../shared/game-logic/combat.logic.js'; // Updated path

// --- Combat State ---
let player = {
    id: 'player',
    name: "Héros Multi-Combat",
    initialCS: 18,
    currentCS: 18,
    dexterity: 5,
    isPlayer: true
};

let monsters = [
    { id: 'skel1', name: "Squelette Viking Alpha", initialCS: 7, currentCS: 7, isPlayer: false },
    { id: 'skel2', name: "Squelette Viking Beta", initialCS: 6, currentCS: 6, isPlayer: false },
    { id: 'skel3', name: "Squelette Viking Gamma", initialCS: 7, currentCS: 7, isPlayer: false },
    { id: 'skel4', name: "Squelette Viking Delta", initialCS: 7, currentCS: 7, isPlayer: false },
    { id: 'skel5', name: "Squelette Viking Epsilon", initialCS: 6, currentCS: 6, isPlayer: false },
    { id: 'skel6', name: "Squelette Viking Zeta", initialCS: 7, currentCS: 7, isPlayer: false },
    { id: 'skel7', name: "Squelette Viking Eta", initialCS: 6, currentCS: 6, isPlayer: false },
];

let combatEnded = false;

// --- Core Combat Logic Execution ---

// Applies damage, logs, updates display, checks for defeat and end of combat
function applyAndLogDamage(target, damage, attackerName) {
    if (target.currentCS <= 0) return false; // Already defeated

    const defeated = applyDamageToTarget(target, damage); // Business logic

    addLogEntry(
        `${target.name} subit <span class="log-result">${damage}</span> points de dégâts de ${attackerName}. FC restante: ${target.currentCS}`,
        target.isPlayer ? 'log-monster' : 'log-player'
    );

    // Update display for the specific target
    if (target.isPlayer) {
        displayPlayerState(player); // Update entire player display
    } else {
        updateMonsterDisplay(target); // Update specific monster card
    }

    if (defeated) {
        addLogEntry(`<span class="log-result">${target.name} est vaincu !</span>`);
        if (target.id === 'player') {
            endCombat("Vous avez été vaincu...");
        } else {
            // Check if all monsters are now defeated
            const livingMonsters = monsters.filter(m => m.currentCS > 0);
            if (livingMonsters.length === 0 && !combatEnded) {
                endCombat("Tous les adversaires sont vaincus !");
            }
        }
    }
    return defeated;
}

// Handles the attack turn for all living monsters
function monstersAttack() {
    if (combatEnded) return;
    addLogEntry("Riposte des adversaires...");
    const livingMonsters = monsters.filter(m => m.currentCS > 0);

    livingMonsters.forEach(monster => {
        if (combatEnded) return; // Stop if player was defeated by a previous monster
        addLogEntry(`Le <span class="log-monster">${monster.name}</span> attaque !`, 'log-monster');
        const numDice = getDamageDice(monster.currentCS, monster.initialCS, monster.isPlayer);
        const damage = (numDice === 0) ? 1 : rollMultipleD6(numDice);
        addLogEntry(`${monster.name} lance ${numDice}D6 (ou 1 pt min) et inflige ${damage} dégâts.`, 'log-monster');
        applyAndLogDamage(player, damage, monster.name);
    });
}

// --- Event Handlers ---

function handlePlayerAttack() {
    if (combatEnded) return;

    const livingMonsters = monsters.filter(m => m.currentCS > 0);
    if (livingMonsters.length === 0) {
        addLogEntry("Il n'y a plus d'adversaires à attaquer.", 'log-player');
        return;
    }

    // Determine targets based on player dexterity
    const numTargets = Math.min(player.dexterity, livingMonsters.length);
    if (numTargets <= 0) {
        addLogEntry("Votre Adresse ne vous permet pas d'attaquer ce tour.", 'log-player');
        // Monsters still attack even if player can't
        setTimeout(monstersAttack, 500); 
        return;
    }

    const targets = livingMonsters.slice(0, numTargets);
    const targetNames = targets.map(t => `<span class="log-monster">${t.name}</span>`).join(', ');
    addLogEntry(`Vous attaquez ${numTargets} adversaire(s): ${targetNames}...`, 'log-player');

    // Calculate player damage
    const numDice = getDamageDice(player.currentCS, player.initialCS, player.isPlayer);
    const damage = (numDice === 0) ? 1 : rollMultipleD6(numDice);
    addLogEntry(`Vous lancez ${numDice}D6 (ou 1 pt min) pour <span class="log-result">${damage}</span> dégâts par cible touchée.`, 'log-player');

    // Apply damage to each target
    targets.forEach(monster => {
        if (combatEnded) return;
        applyAndLogDamage(monster, damage, player.name);
    });

    // Monsters attack back if combat isn't over
    if (!combatEnded) {
        setTimeout(monstersAttack, 500); 
    }
}

function handlePlayerFlee() {
    if (combatEnded) return;
    addLogEntry(`Vous tentez de <span class="log-player">fuir</span>...`, 'log-player');
    const livingMonsters = monsters.filter(m => m.currentCS > 0);
    
    // Pass the array of living monsters to the check function
    const success = checkFleeSuccess(player.dexterity, livingMonsters); 

    if (success) {
        if (livingMonsters.length === 0) {
             addLogEntry("Il n'y a plus personne à fuir !"); // Should ideally not happen if flee is disabled
             return; 
         }
        addLogEntry(`<span class="log-result">Fuite réussie !</span>`, 'log-result');
        endCombat("Vous échappez au combat.");
    } else {
        addLogEntry(`La <span class="log-result">fuite échoue !</span>`, 'log-result');
        // Monsters attack if flee fails
        setTimeout(monstersAttack, 500); 
    }
}

// --- Combat End Logic ---

function endCombat(message) {
    if (combatEnded) return; 
    addLogEntry(`<b>${message}</b>`, 'log-result');
    setActionButtonsState(true); // Disable buttons
    combatEnded = true;
}

// --- Initialization ---

// Resets state to initial values (useful for testing/reloading)
function resetCombatState() {
    player.currentCS = player.initialCS;
    // Important: Create new monster objects to avoid modifying original CS across reloads
    monsters = [
        { id: 'skel1', name: "Squelette Viking Alpha", initialCS: 7, currentCS: 7, isPlayer: false },
        { id: 'skel2', name: "Squelette Viking Beta", initialCS: 6, currentCS: 6, isPlayer: false },
        { id: 'skel3', name: "Squelette Viking Gamma", initialCS: 7, currentCS: 7, isPlayer: false },
        { id: 'skel4', name: "Squelette Viking Delta", initialCS: 7, currentCS: 7, isPlayer: false },
        { id: 'skel5', name: "Squelette Viking Epsilon", initialCS: 6, currentCS: 6, isPlayer: false },
        { id: 'skel6', name: "Squelette Viking Zeta", initialCS: 7, currentCS: 7, isPlayer: false },
        { id: 'skel7', name: "Squelette Viking Eta", initialCS: 6, currentCS: 6, isPlayer: false },
    ];
    combatEnded = false;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Multi Combat Controller: Initializing...");
    setupView(); // Get DOM elements

    resetCombatState(); // Set initial CS and combat status

    // Initial UI setup
    displayPlayerState(player);
    displayMonstersState(monsters);
    addLogEntry(`Le combat commence ! Vous affrontez ${monsters.length} adversaires.`);
    setActionButtonsState(false); // Enable buttons

    // Attach event listeners
    addAttackListener(handlePlayerAttack);
    addFleeListener(handlePlayerFlee);

    console.log("Multi Combat Controller: Initialization complete.");
}); 