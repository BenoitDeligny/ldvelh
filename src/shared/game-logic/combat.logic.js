import { rollMultipleD6 } from './dice.logic.js';

/**
 * Determines the number of damage dice based on combat strength.
 * Uses initial Combat Strength and separate tables for Player/Monster.
 * @param {number} currentCS - Current Combat Strength (unused in current logic but potentially useful).
 * @param {number} initialCS - Initial Combat Strength (used for lookup).
 * @param {boolean} isPlayer - True if the attacker is the player.
 * @returns {number} The number of D6 to roll (0 means 1 minimum damage).
 */
export function getDamageDice(currentCS, initialCS, isPlayer) {
    const ranges = isPlayer
        ? [[1, 6, 0], [7, 18, 1], [19, 30, 2], [31, 54, 3], [55, 78, 4], [79, 114, 5], [115, 150, 6], [151, 192, 7], [193, 234, 8], [235, 282, 9], [283, Infinity, 10]]
        : [[1, 8, 0], [9, 24, 1], [25, 40, 2], [41, 64, 3], [65, 88, 4], [89, 124, 5], [125, 172, 6], [173, 220, 7], [221, 276, 8], [277, 332, 9], [332, Infinity, 10]];
    const csToCheck = initialCS; 
    for (const range of ranges) {
        if (csToCheck >= range[0] && csToCheck <= range[1]) {
            return range[2];
        }
    }
    return 0;
}

/**
 * Applies damage to a target's current Combat Strength.
 * Ensures CS doesn't go below 0.
 * @param {object} target - The target object (must have a currentCS property).
 * @param {number} damage - The amount of damage to apply.
 * @returns {boolean} True if the target was defeated (currentCS <= 0), false otherwise.
 */
export function applyDamageToTarget(target, damage) {
    if (!target || typeof target.currentCS === 'undefined') {
        console.error("Invalid target for applyDamageToTarget:", target);
        return false;
    }
    const damageAmount = Math.max(0, Math.floor(damage)); // Ensure positive integer damage
    target.currentCS -= damageAmount;
    if (target.currentCS < 0) target.currentCS = 0;
    return target.currentCS <= 0;
}

/**
 * Checks if a flee attempt is successful based on player dexterity and opponent strength.
 * Handles both single and multiple opponents.
 * @param {number} playerDexterity - The player's dexterity score.
 * @param {Array<object>|object} opponents - A single opponent object or an array of opponent objects (must have currentCS).
 * @returns {boolean} True if the flee attempt is successful, false otherwise.
 */
export function checkFleeSuccess(playerDexterity, opponents) {
    let livingOpponents = [];
    if (Array.isArray(opponents)) {
        livingOpponents = opponents.filter(m => m && m.currentCS > 0);
    } else if (opponents && opponents.currentCS > 0) {
        livingOpponents = [opponents];
    }
    
    if (livingOpponents.length === 0) return true; // Can always flee if no one is there
    
    const totalMonsterCS = livingOpponents.reduce((sum, m) => sum + m.currentCS, 0);
    const roll = rollMultipleD6(2);
    const fleeScore = roll + playerDexterity;
    
    // Log the attempt details (could be moved to UI layer later)
    console.log(`Jet de Fuite (2D6 + Adresse): ${roll} + ${playerDexterity} = ${fleeScore}`);
    console.log(`Force de Combat adverse totale actuelle: ${totalMonsterCS}`);
    
    return fleeScore > totalMonsterCS;
}

// Potential future additions:
// - Function to determine attack order (initiative)
// - Functions for special abilities, items, etc. 