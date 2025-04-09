// Controller for Multi Combat: Handles user interactions and orchestrates view/model
import {
    setupView,
    displayPlayerState,
    displayMonsterGroupsState,
    updateAllocationUI,
    addLogEntry,
    setActionButtonsState,
    addAttackListener,
    addFleeListener
} from './combat-multi.view.js';
import { rollMultipleD6 } from '../../shared/game-logic/dice.logic.js';
import { getDamageDice, applyDamageToTarget, checkFleeSuccess } from '../../shared/game-logic/combat.logic.js';

// --- Character Loading Logic (Integrated) ---
const SLOTS_STORAGE_KEY_C2 = 'characterSlotsData';
const ACTIVE_CHAR_ID_KEY_C2 = 'activeCharacterId';

function loadActiveCharacterFromStorage() {
    try {
        const activeId = localStorage.getItem(ACTIVE_CHAR_ID_KEY_C2);
        if (!activeId) {
            console.warn("Combat Multi: No active character ID found.");
            return null;
        }
        const savedSlots = localStorage.getItem(SLOTS_STORAGE_KEY_C2);
        if (!savedSlots) {
            console.error("Combat Multi: Character slots not found.");
            return null;
        }
        const characters = JSON.parse(savedSlots);
        if (!Array.isArray(characters)) {
            console.error("Combat Multi: Invalid character slots data.");
            return null;
        }
        const activeCharacter = characters.find(char => char.id && char.id.toString() === activeId);
        if (!activeCharacter) {
            console.warn(`Combat Multi: Active character with ID ${activeId} not found.`);
            return null;
        }
        return activeCharacter;
    } catch (error) {
        console.error("Combat Multi: Error loading active character:", error);
        return null;
    }
}
// --- End Character Loading Logic ---

// --- Combat State ---
let playerCharacter = null;
let monsters = [];
let currentMonsterGroups = [];
let targetAllocations = {};
let currentRound = 1; // Add round counter
let combatEnded = false;

// --- Grouping Function ---
function createMonsterGroups(monstersList, maxGroupSize) {
    const livingMonsters = monstersList.filter(m => m.currentCS > 0);
    if (livingMonsters.length === 0) return [];

    const groups = {}; // Key will be composite: "name_initialCS"

    livingMonsters.forEach(monster => {
        // Use a composite key: name + initialCS
        const groupKey = `${monster.name}_CS${monster.initialCS}`;
        if (!groups[groupKey]) { 
            groups[groupKey] = [];
        }
        groups[groupKey].push(monster);
    });

    const finalGroups = [];
    let groupCounter = 0;

    // Iterate through the composite keys
    for (const groupKey in groups) {
        const monsterList = groups[groupKey];
        if (monsterList.length === 0) continue;
        // All monsters in this list have the same name and initialCS
        const monsterData = monsterList[0]; 
        const effectiveMaxGroupSize = Math.max(1, maxGroupSize);

        for (let i = 0; i < monsterList.length; i += effectiveMaxGroupSize) {
            const subGroup = monsterList.slice(i, i + effectiveMaxGroupSize);
            finalGroups.push({
                id: `group_${groupCounter++}`,
                // Use the base name (remove the _CS part if needed, but not necessary here)
                name: monsterData.name, 
                count: subGroup.length,
                initialCS: monsterData.initialCS, // Store the correct initial CS for this group
                individualsData: subGroup.map(m => ({ id: m.id, currentCS: m.currentCS }))
            });
        }
    }
    return finalGroups;
}

// --- Allocation Handlers ---
function handleAllocateTarget(groupId) {
    if (combatEnded) return;
    const group = currentMonsterGroups.find(g => g.id === groupId);
    if (!group) return;

    let totalAllocated = Object.values(targetAllocations).reduce((sum, count) => sum + count, 0);
    const currentAllocation = targetAllocations[groupId] || 0;

    if (totalAllocated < playerCharacter.dexterity && currentAllocation < group.count) {
        targetAllocations[groupId] = currentAllocation + 1;
        updateAllocationUI(targetAllocations, currentMonsterGroups, playerCharacter.dexterity);
    }
}

function handleDeallocateTarget(groupId) {
    if (combatEnded) return;
    const currentAllocation = targetAllocations[groupId] || 0;
    if (currentAllocation > 0) {
        targetAllocations[groupId] = currentAllocation - 1;
        updateAllocationUI(targetAllocations, currentMonsterGroups, playerCharacter.dexterity);
    }
}

function resetAllocations() {
    targetAllocations = {};
    currentMonsterGroups.forEach(group => {
        targetAllocations[group.id] = 0;
    });
}

// --- Core Combat Logic Execution ---

function applyAndLogDamage(target, damage, attackerName) {
    if (!target || target.currentCS <= 0) return false;

    const defeated = applyDamageToTarget(target, damage);

    addLogEntry(
        `${target.name} subit <span class="log-result">${damage}</span> points de dégâts de ${attackerName}. FC restante: ${target.currentCS}`,
        target.isPlayer ? 'log-monster' : 'log-player'
    );

    // --- Recalculate groups and potentially reset allocations ---
    currentMonsterGroups = createMonsterGroups(monsters, playerCharacter.dexterity || 1);
    const currentGroupIds = new Set(currentMonsterGroups.map(g => g.id));
    const previousGroupIds = new Set(Object.keys(targetAllocations));
    let structureChanged = false;
    if (currentGroupIds.size !== previousGroupIds.size || 
        ![...previousGroupIds].every(id => currentGroupIds.has(id))) {
        structureChanged = true;
        resetAllocations();
    }
    // ---------------------------------------------------------
    
    // Update display for the affected combatant
    if (target.isPlayer) {
        // Recalculate player combat dice before updating display
        target.combatDiceCount = getDamageDice(target.currentCS, target.initialCS, target.isPlayer);
        displayPlayerState(target); // Update player display
    } else {
         // Update monster groups display (also handles allocation UI implicitly)
         displayMonsterGroupsState(currentMonsterGroups, targetAllocations, playerCharacter.dexterity, { allocate: handleAllocateTarget, deallocate: handleDeallocateTarget });
    }
    // ---------------------------------------------------------

    if (defeated) {
        addLogEntry(`<span class="log-result">${target.name} est vaincu !</span>`);
        if (target.isPlayer) {
            endCombat("Vous avez été vaincu...");
        } else {
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
    if (combatEnded || !playerCharacter) return;
    addLogEntry("Riposte des adversaires...");
    const livingMonsters = monsters.filter(m => m.currentCS > 0);
    
    let totalDamageToPlayer = 0;
    let monsterAttackLogs = []; // Store individual attack logs

    // First, calculate damage from all monsters and prepare logs
    livingMonsters.forEach(monster => {
        if (combatEnded) return;
        const numDice = getDamageDice(monster.currentCS, monster.initialCS, monster.isPlayer);
        const damage = (numDice === 0) ? 1 : rollMultipleD6(numDice);
        monsterAttackLogs.push(`Le <span class="log-monster">${monster.name}</span> attaque (lance ${numDice}D6) et inflige <span class="log-result">${damage}</span> dégâts.`);
        totalDamageToPlayer += damage;
    });

    // Now, log all individual attacks
    monsterAttackLogs.forEach(log => addLogEntry(log, 'log-monster'));

    // Then, apply the total damage to the player IF there was any damage
    if (totalDamageToPlayer > 0 && !combatEnded) {
        addLogEntry(`Vous subissez un total de <span class="log-result">${totalDamageToPlayer}</span> dégâts ce round.`, 'log-player');
        // This call will handle updating player CS, dice count, display, and checking defeat
        applyAndLogDamage(playerCharacter, totalDamageToPlayer, "les adversaires"); 
    }

    // Schedule the start of the next round (only if combat didn't end)
    if (!combatEnded) {
        setTimeout(() => {
            if (!combatEnded) { // Double check combat end state
                currentRound++;
                addLogEntry(`<b>--- Début du Round ${currentRound} ---</b>`, 'log-round');
                setActionButtonsState(false, false);
                updateAllocationUI(targetAllocations, currentMonsterGroups, playerCharacter.dexterity);
            }
        }, 500); // Delay before the next player turn starts
    }
}

// --- Player Actions ---

function handlePlayerAttack() {
    if (combatEnded) return;

    let totalAllocated = Object.values(targetAllocations).reduce((sum, count) => sum + count, 0);
    if (totalAllocated === 0) {
        addLogEntry("Vous devez allouer au moins une cible pour attaquer.", 'log-player');
        return;
    }

    addLogEntry("Vous attaquez !", 'log-player');
    setActionButtonsState(true);

    // Calculate damage ONCE
    const damageDice = getDamageDice(playerCharacter.currentCS, playerCharacter.initialCS, playerCharacter.isPlayer);
    const damage = (damageDice === 0) ? 1 : rollMultipleD6(damageDice);
    addLogEntry(`Vous lancez ${damageDice}D6 (ou 1 pt min) et obtenez <span class="log-result">${damage}</span> points de dégâts par cible touchée.`, 'log-player');

    // --- Identify all targets FIRST based on allocations ---
    let targetsToHit = []; // Store { monster, damage, attackerName }
    for (const groupId in targetAllocations) {
        const allocationCount = targetAllocations[groupId];
        if (allocationCount > 0) {
            const group = currentMonsterGroups.find(g => g.id === groupId);
            if (!group) continue;

            const individuals = group.individualsData;
            let allocatedTargetsInGroup = 0;
            for (const individual of individuals) {
                if (allocatedTargetsInGroup >= allocationCount) break;
                
                // Find the monster object, ensure it's still alive *at this point*
                const monster = monsters.find(m => m.id === individual.id && m.currentCS > 0); 
                if (monster) {
                    targetsToHit.push({ monster: monster, damage: damage, attackerName: playerCharacter.name });
                    allocatedTargetsInGroup++;
                }
            }
        }
    }
    // ----------------------------------------------------

    // --- Apply damage AFTER identifying all targets ---
    let combatEndedDuringAttack = false;
    for (const hit of targetsToHit) {
        // applyAndLogDamage returns true if target is defeated, also checks internal combatEnded flag
        applyAndLogDamage(hit.monster, hit.damage, hit.attackerName);
        if (combatEnded) { // Check global flag updated by applyAndLogDamage
            combatEndedDuringAttack = true;
            break; // Stop applying further hits if combat ended
        }
    }
    // -------------------------------------------------

    // Reset allocations AFTER the attack sequence
    resetAllocations();
    // If combat didn't end, update the allocation UI for the next turn (monstersAttack might redraw anyway, but good practice)
    if (!combatEnded) {
        updateAllocationUI(targetAllocations, currentMonsterGroups, playerCharacter.dexterity);
    }
    
    // Monsters retaliate if combat didn't end during the player's attack
    if (!combatEndedDuringAttack) {
        setTimeout(() => {
            if (!combatEnded) { // Final check before monster turn
                monstersAttack();
            }
        }, 500);
    }
}

function handlePlayerFlee() {
    if (combatEnded || !playerCharacter) return;
    addLogEntry(`Vous tentez de <span class="log-player">fuir</span>...`, 'log-player');
    const livingMonsters = monsters.filter(m => m.currentCS > 0);
    
    const success = checkFleeSuccess(playerCharacter.dexterity || 1, livingMonsters);

    if (success) {
        if (livingMonsters.length === 0) {
             addLogEntry("Il n'y a plus personne à fuir !");
             return; 
         }
        addLogEntry(`<span class="log-result">Fuite réussie !</span>`, 'log-result');
        endCombat("Vous échappez au combat.");
    } else {
        addLogEntry(`La <span class="log-result">fuite échoue !</span>`, 'log-result');
        setTimeout(monstersAttack, 500); 
    }
}

// --- Combat End Logic ---

function endCombat(message) {
    if (combatEnded) return; 
    addLogEntry(`<b>${message}</b>`, 'log-result');
    setActionButtonsState(true);
    combatEnded = true;
}

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    setupView();

    playerCharacter = loadActiveCharacterFromStorage();
    if (!playerCharacter) {
        console.error("COMBAT MULTI ERROR: No active player character loaded!");
        alert("Erreur : Aucun personnage actif trouvé. Veuillez en activer un depuis l'écran de création.");
        document.body.innerHTML = "<p style='color: red; text-align: center; margin-top: 50px;'>Erreur: Personnage actif manquant.</p>";
        return;
    }

    playerCharacter.initialCS = playerCharacter.combatStrength || 10;
    playerCharacter.currentCS = playerCharacter.initialCS;
    playerCharacter.dexterity = playerCharacter.dexterity || 3;
    playerCharacter.isPlayer = true;
    // Calculate initial combat dice
    playerCharacter.combatDiceCount = getDamageDice(playerCharacter.currentCS, playerCharacter.initialCS, playerCharacter.isPlayer);

    // --- Update Attack Button Text ---
    const dexterityDisplaySpan = document.getElementById('player-dexterity-display');
    if (dexterityDisplaySpan) {
        dexterityDisplaySpan.textContent = playerCharacter.dexterity;
    } else {
        console.warn("Could not find element with ID 'player-dexterity-display' to update target count.");
    }
    // ---------------------------------

    // Initialize the INDIVIDUAL monsters list with repeating names and reduced CS
    monsters = [
        // CS reduced by 4, min 1
        { id: 'skel_chef1', name: "Chef Squelette", initialCS: 5, currentCS: 5, isPlayer: false }, // 9 - 4 = 5
        { id: 'skel1', name: "Squelette Viking", initialCS: 3, currentCS: 3, isPlayer: false }, // 7 - 4 = 3
        { id: 'skel2', name: "Gobelin", initialCS: 2, currentCS: 2, isPlayer: false },          // Renamed from Squelette Viking CS 2
        { id: 'skel3', name: "Squelette Viking", initialCS: 3, currentCS: 3, isPlayer: false }, // 7 - 4 = 3
        { id: 'skel4', name: "Squelette Viking", initialCS: 3, currentCS: 3, isPlayer: false }, // 7 - 4 = 3
        { id: 'skel5', name: "Gobelin", initialCS: 2, currentCS: 2, isPlayer: false },          // Renamed from Squelette Viking CS 2
        { id: 'skel6', name: "Squelette Viking", initialCS: 3, currentCS: 3, isPlayer: false }, // 7 - 4 = 3
        { id: 'skel7', name: "Gobelin", initialCS: 2, currentCS: 2, isPlayer: false },          // Renamed from Squelette Viking CS 2
        { id: 'skel8', name: "Squelette Viking", initialCS: 3, currentCS: 3, isPlayer: false }, // 7 - 4 = 3
        { id: 'skel9', name: "Gobelin", initialCS: 2, currentCS: 2, isPlayer: false },          // Renamed from Squelette Viking CS 2
        // Total: 1 Chef, 5 Vikings (CS3), 4 Gobelins (CS2)
    ];
    combatEnded = false;

    // Create initial monster groups for display
    currentMonsterGroups = createMonsterGroups(monsters, playerCharacter.dexterity);
    
    // Initialize allocations to zero for each group
    resetAllocations(); 

    // Initial UI setup
    displayPlayerState(playerCharacter);
    displayMonsterGroupsState(
        currentMonsterGroups, 
        targetAllocations, 
        playerCharacter.dexterity, 
        { allocate: handleAllocateTarget, deallocate: handleDeallocateTarget }
    );
    addLogEntry(`Le combat commence ! Vous affrontez ${monsters.length} adversaires.`);
    addLogEntry(`<b>--- Début du Round ${currentRound} ---</b>`, 'log-round'); // Log Round 1 start
    setActionButtonsState(false, true);
    updateAllocationUI(targetAllocations, currentMonsterGroups, playerCharacter.dexterity);

    // Attach event listeners
    addAttackListener(handlePlayerAttack);
    addFleeListener(handlePlayerFlee);
}); 