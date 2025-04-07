document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const playerNameEl = document.getElementById('player-name');
    const playerCsInitialEl = document.getElementById('player-cs-initial');
    const playerCsCurrentEl = document.getElementById('player-cs-current');
    const monsterNameEl = document.getElementById('monster-name');
    const monsterCsInitialEl = document.getElementById('monster-cs-initial');
    const monsterCsCurrentEl = document.getElementById('monster-cs-current');
    const attackButton = document.getElementById('attack-button');
    const fleeButton = document.getElementById('flee-button');
    const logList = document.getElementById('log-list');

    // --- Game State & Config ---
    // TODO: Load actual player stats
    const player = {
        name: "Héros Vaillant",
        initialCS: 15, // Example: Power 5 + Dexterity 4 + Perception 6
        currentCS: 15,
        dexterity: 4, // Still needed for fleeing
        // Add Power for attack bonuses later
    };

    const monster = {
        name: "Squelette Viking",
        initialCS: 7,
        currentCS: 7,
        // Add Dexterity if needed for monster flee checks?
    };

    let combatEnded = false;

    // --- Utility Functions ---
    function rollD6() {
        return Math.floor(Math.random() * 6) + 1;
    }

    // Function to roll multiple D6 and sum results
    function rollMultipleD6(numberOfDice) {
        let sum = 0;
        for (let i = 0; i < numberOfDice; i++) {
            sum += rollD6();
        }
        return sum;
    }
    
    function addLog(message, cssClass = 'log-system') {
        const li = document.createElement('li');
        li.innerHTML = message;
        li.className = cssClass;
        logList.appendChild(li);
        logList.parentElement.scrollTop = logList.parentElement.scrollHeight;
    }

    function updateCombatStrengthDisplay() {
        playerCsCurrentEl.textContent = player.currentCS;
        monsterCsCurrentEl.textContent = monster.currentCS;
    }

    function endCombat(message) {
        addLog(`<b>${message}</b>`, 'log-result');
        attackButton.disabled = true;
        fleeButton.disabled = true;
        combatEnded = true;
    }

    // --- Combat Logic ---

    // Determine number of damage dice based on Combat Strength (Table p.?) - Simplified version
    function getDamageDice(combatStrength) {
        // Based on the first image provided (Legendes/Monstres table)
        // Using Legend ranges for player, Monster ranges for monster
        // This is a simplified interpretation, actual ranges might differ per creature type
        const isPlayer = combatStrength === player.initialCS; // Simple check, might need better way
        const ranges = isPlayer 
            ? [[1, 6, 0], [7, 18, 1], [19, 30, 2], [31, 54, 3], [55, 78, 4], [79, 114, 5], [115, 150, 6], [151, 192, 7], [193, 234, 8], [235, 282, 9], [283, Infinity, 10]]
            : [[1, 8, 0], [9, 24, 1], [25, 40, 2], [41, 64, 3], [65, 88, 4], [89, 124, 5], [125, 172, 6], [173, 220, 7], [221, 276, 8], [277, 332, 9], [332, Infinity, 10]];
        
        for (const range of ranges) {
            if (combatStrength >= range[0] && combatStrength <= range[1]) {
                return range[2]; // Return number of dice (0 for 1 point)
            }
        }
        return 0; // Default if CS is somehow out of range
    }

    function applyDamage(target, damage) {
        target.currentCS -= damage;
        if (target.currentCS < 0) target.currentCS = 0;
        addLog(`Subit <span class="log-result">${damage}</span> points de dégâts. FC restante: ${target.currentCS}`);
        updateCombatStrengthDisplay();
        
        // Check for defeat
        if (target.currentCS <= 0) {
            if (target === player) {
                endCombat("Vous avez été vaincu...");
            } else {
                endCombat(`Vous avez vaincu le ${target.name} !`);
            }
        }
    }

    function monsterAttack() {
        if (combatEnded) return;
        addLog(`Le <span class="log-monster">${monster.name}</span> attaque !`);

        const numDice = getDamageDice(monster.initialCS); // Use initial CS for dice count
        if (numDice === 0) {
            addLog(`L'attaque du monstre inflige <span class="log-result">1</span> point (minimum).`, 'log-monster');
            applyDamage(player, 1);
        } else {
            const damageRoll = rollMultipleD6(numDice);
            // TODO: Add monster attack bonuses?
            const totalDamage = damageRoll;
            addLog(`Le monstre lance ${numDice}D6 : ${damageRoll}`, 'log-monster');
            applyDamage(player, totalDamage);
        }
    }

    function playerAttack() {
        if (combatEnded) return;
        addLog(`Vous attaquez le <span class="log-monster">${monster.name}</span>...`);
        
        const numDice = getDamageDice(player.initialCS); // Use initial CS for dice count
        if (numDice === 0) {
            addLog(`Votre attaque inflige <span class="log-result">1</span> point (minimum).`, 'log-player');
            applyDamage(monster, 1);
        } else {
            const damageRoll = rollMultipleD6(numDice);
            // TODO: Add player Power, weapon, skill bonuses
            const totalDamage = damageRoll;
            addLog(`Vous lancez ${numDice}D6 : ${damageRoll}`, 'log-player');
            applyDamage(monster, totalDamage);
        }
        
        // Monster attacks back if combat not ended by player attack
        if (!combatEnded) {
            monsterAttack();
        }
    }

    function playerFlee() {
        if (combatEnded) return;
        addLog(`Vous tentez de <span class="log-player">fuir</span>...`);

        const roll = rollMultipleD6(2); // 2D6 for flee according to Kami p13
        const fleeScore = roll + player.dexterity;
        addLog(`Jet de Fuite (2D6 + Adresse): ${roll} + ${player.dexterity} = ${fleeScore}`);
        addLog(`Force de Combat adverse actuelle: ${monster.currentCS}`); // Compare to current CS (easier if blessed?)

        if (fleeScore > monster.currentCS) { // Compare to currentCS based on Kami p13
            addLog(`<span class="log-result">Fuite réussie !</span>`, 'log-result');
            endCombat("Vous échappez au combat.");
        } else {
            addLog(`La <span class="log-result">fuite échoue !</span>`, 'log-result');
            monsterAttack(); // Monster attacks back!
        }
    }

    // --- Initialization ---
    function initializeCombat() {
        playerNameEl.textContent = player.name;
        playerCsInitialEl.textContent = player.initialCS;
        monsterNameEl.textContent = monster.name;
        monsterCsInitialEl.textContent = monster.initialCS;
        updateCombatStrengthDisplay(); // Set initial current CS

        attackButton.addEventListener('click', playerAttack);
        fleeButton.addEventListener('click', playerFlee);

        addLog(`Un <span class="log-monster">${monster.name}</span> (FC: ${monster.initialCS}) apparaît !`);
    }

    initializeCombat();
}); 