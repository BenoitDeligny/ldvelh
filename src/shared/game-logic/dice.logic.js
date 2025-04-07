/**
 * Rolls a single 6-sided die.
 * @returns {number} A random integer between 1 and 6.
 */
export function rollD6() {
    return Math.floor(Math.random() * 6) + 1;
}

/**
 * Rolls multiple 6-sided dice and returns their sum.
 * @param {number} numberOfDice - The number of dice to roll.
 * @returns {number} The sum of the dice rolls.
 */
export function rollMultipleD6(numberOfDice) {
    let sum = 0;
    // Ensure numberOfDice is a positive integer
    const numDice = Math.max(0, Math.floor(numberOfDice)); 
    for (let i = 0; i < numDice; i++) {
        sum += rollD6();
    }
    return sum;
} 