import { rollD6 } from './dice.logic.js';

/**
 * Generates a complete set of character statistics based on game rules.
 * Rules: Attributes = 1D6+1, Age = 1D6+14, CombatStrength = P+D+P
 * @returns {object} An object containing power, dexterity, perception, age, and combatStrength.
 */
export function generateStatsSet() {
    const power = rollD6() + 1;
    const dexterity = rollD6() + 1;
    const perception = rollD6() + 1;
    const age = rollD6() + 14;
    const combatStrength = power + dexterity + perception;
    return { power, dexterity, perception, age, combatStrength };
}

// Potential future additions:
// - Function to validate character name
// - Function to calculate initial equipment/gold? 