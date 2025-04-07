document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const playerNameEl = document.getElementById('player-name');
    const playerCsInitialEl = document.getElementById('player-cs-initial');
    const playerCsCurrentEl = document.getElementById('player-cs-current');
    const playerDexterityEl = document.getElementById('player-dexterity'); // Added display for Dexterity
    const monsterListEl = document.getElementById('monster-list');
    const attackButton = document.getElementById('attack-button');
    const fleeButton = document.getElementById('flee-button');
    const logList = document.getElementById('log-list');

    // --- Game State & Config ---
    const player = {
        id: 'player',
        name: "Héros Multi-Combat",
        initialCS: 18, 
        currentCS: 18,
        dexterity: 5, 
    };

    // Array of monsters
    let monsters = [
        { id: 'skel1', name: "Squelette Viking Alpha", initialCS: 7, currentCS: 7 },
        { id: 'skel2', name: "Squelette Viking Beta", initialCS: 6, currentCS: 6 },
        { id: 'skel3', name: "Squelette Viking Gamma", initialCS: 7, currentCS: 7 },
        { id: 'skel4', name: "Squelette Viking Delta", initialCS: 7, currentCS: 7 },
        { id: 'skel5', name: "Squelette Viking Epsilon", initialCS: 6, currentCS: 6 },
        { id: 'skel6', name: "Squelette Viking Zeta", initialCS: 7, currentCS: 7 },
        { id: 'skel7', name: "Squelette Viking Eta", initialCS: 6, currentCS: 6 },
    ];

    let combatEnded = false;

    // --- Utility Functions ---
    function rollD6() { return Math.floor(Math.random() * 6) + 1; }
    function rollMultipleD6(numberOfDice) {
        let sum = 0;
        for (let i = 0; i < numberOfDice; i++) { sum += rollD6(); }
        return sum;
    }
    function addLog(message, cssClass = 'log-system') {
        const li = document.createElement('li');
        li.innerHTML = message;
        li.className = cssClass;
        logList.appendChild(li);
        logList.parentElement.scrollTop = logList.parentElement.scrollHeight;
    }

    // --- Display Updates ---
    function updatePlayerDisplay() {
        playerNameEl.textContent = player.name;
        playerCsInitialEl.textContent = player.initialCS;
        playerCsCurrentEl.textContent = player.currentCS;
        playerDexterityEl.textContent = player.dexterity;
    }

    function updateMonsterListDisplay() {
        monsterListEl.innerHTML = ''; // Clear list
        monsters.forEach(monster => {
            if (monster.currentCS > 0) { // Only display living monsters
                const li = document.createElement('li');
                li.id = `monster-${monster.id}`;
                li.innerHTML = `
                    <span class="monster-name">${monster.name}</span>
                    <span>FC Initiale: ${monster.initialCS}</span> | 
                    <span>FC Actuelle: <span class="monster-current-cs">${monster.currentCS}</span></span>
                `;
                monsterListEl.appendChild(li);
            } else {
                 // Optionally display defeated monsters differently
                 const li = document.createElement('li');
                 li.style.opacity = "0.5";
                 li.innerHTML = `<span class="monster-name">${monster.name} (Vaincu)</span>`;
                 monsterListEl.appendChild(li);
            }
        });
    }

    function updateMonsterCSDisplay(monster) {
        const monsterEl = document.getElementById(`monster-${monster.id}`);
        if (monsterEl) {
            const csEl = monsterEl.querySelector('.monster-current-cs');
            if (csEl) csEl.textContent = monster.currentCS;
            if (monster.currentCS <= 0) {
                 monsterEl.style.opacity = "0.5";
                 monsterEl.innerHTML = `<span class="monster-name">${monster.name} (Vaincu)</span>`;
            }
        }
    }

    function endCombat(message) {
        addLog(`<b>${message}</b>`, 'log-result');
        attackButton.disabled = true;
        fleeButton.disabled = true;
        combatEnded = true;
    }

    // --- Combat Logic ---
    function getDamageDice(combatStrength, isPlayerSource = false) {
        const ranges = isPlayerSource
            ? [[1, 6, 0], [7, 18, 1], [19, 30, 2], [31, 54, 3], [55, 78, 4], [79, 114, 5], [115, 150, 6], [151, 192, 7], [193, 234, 8], [235, 282, 9], [283, Infinity, 10]]
            : [[1, 8, 0], [9, 24, 1], [25, 40, 2], [41, 64, 3], [65, 88, 4], [89, 124, 5], [125, 172, 6], [173, 220, 7], [221, 276, 8], [277, 332, 9], [332, Infinity, 10]];
        for (const range of ranges) {
            if (combatStrength >= range[0] && combatStrength <= range[1]) {
                return range[2]; // Return number of dice (0 = 1 point damage)
            }
        }
        return 0;
    }

    function applyDamage(target, damage, attackerName = "Attaquant") {
        if (target.currentCS <= 0) return; // Target already defeated
        target.currentCS -= damage;
        if (target.currentCS < 0) target.currentCS = 0;
        addLog(`${target.name} subit <span class="log-result">${damage}</span> points de dégâts de ${attackerName}. FC restante: ${target.currentCS}`);
        
        if (target.id === 'player') {
             updatePlayerDisplay();
        } else {
             updateMonsterCSDisplay(target);
        }
        
        // Check for defeat
        if (target.currentCS <= 0) {
            addLog(`<span class="log-result">${target.name} est vaincu !</span>`);
            if (target.id === 'player') {
                endCombat("Vous avez été vaincu...");
            }
             // Check if all monsters are defeated
             const livingMonsters = monsters.filter(m => m.currentCS > 0);
             if (livingMonsters.length === 0) {
                 endCombat("Tous les adversaires sont vaincus !");
             }
        }
    }
    
    function monstersAttack() {
        if (combatEnded) return;
        addLog("Riposte des adversaires...");
        const livingMonsters = monsters.filter(m => m.currentCS > 0);

        livingMonsters.forEach(monster => {
            if (combatEnded) return; // Stop if player was defeated by previous monster
            addLog(`Le <span class="log-monster">${monster.name}</span> attaque !`);
            const numDice = getDamageDice(monster.initialCS, false);
            const damage = (numDice === 0) ? 1 : rollMultipleD6(numDice);
            addLog(`${monster.name} lance ${numDice}D6 (ou 1 pt min) et inflige ${damage} dégâts.`, 'log-monster');
            applyDamage(player, damage, monster.name);
        });
    }

    function playerAttack() {
        if (combatEnded) return;
        
        const livingMonsters = monsters.filter(m => m.currentCS > 0);
        if (livingMonsters.length === 0) {
            addLog("Il n'y a plus d'adversaires à attaquer.", 'log-player');
            return;
        }

        // Determine the number of targets based on player's dexterity
        const numTargets = Math.min(player.dexterity, livingMonsters.length);
        if (numTargets <= 0) { // Should not happen with Dexterity >= 2, but safe check
             addLog("Votre Adresse ne vous permet pas d'attaquer ce tour.", 'log-player');
             // Skip player attack phase, monsters still attack?
             // According to rules (p13), if Dexterity limits attacks, important monsters attack one by one.
             // Here, we simplify: if player can't attack, monsters still attack as normal.
             monstersAttack(); 
             return;
        }
        
        // Select the first 'numTargets' living monsters
        const targets = livingMonsters.slice(0, numTargets);
        const targetNames = targets.map(t => `<span class="log-monster">${t.name}</span>`).join(', ');
        addLog(`Vous attaquez ${numTargets} adversaire(s): ${targetNames}...`, 'log-player');
        
        const numDice = getDamageDice(player.initialCS, true);
        const damage = (numDice === 0) ? 1 : rollMultipleD6(numDice);
        addLog(`Vous lancez ${numDice}D6 (ou 1 pt min) pour <span class="log-result">${damage}</span> dégâts par cible touchée.`, 'log-player');

        // Apply damage to selected targets
        targets.forEach(monster => {
            // Check if combat ended mid-attack (e.g., first target defeated everyone)
            if (combatEnded) return; 
            applyDamage(monster, damage, player.name);
        });
        
        // Monsters attack back if combat not ended
        if (!combatEnded) {
            monstersAttack();
        }
    }

    function playerFlee() {
        if (combatEnded) return;
        addLog(`Vous tentez de <span class="log-player">fuir</span>...`, 'log-player');
        const livingMonsters = monsters.filter(m => m.currentCS > 0);
        if (livingMonsters.length === 0) {
             addLog("Il n'y a plus personne à fuir !");
             return;
        }
        
        // Rule Kami p13: Compare to current CS of opponent(s).
        // Interpretation: Use the SUM of current CS of all living opponents.
        const totalMonsterCS = livingMonsters.reduce((sum, m) => sum + m.currentCS, 0);

        const roll = rollMultipleD6(2); 
        const fleeScore = roll + player.dexterity;
        addLog(`Jet de Fuite (2D6 + Adresse): ${roll} + ${player.dexterity} = ${fleeScore}`);
        addLog(`Force de Combat adverse totale actuelle: ${totalMonsterCS}`);

        if (fleeScore > totalMonsterCS) {
            addLog(`<span class="log-result">Fuite réussie !</span>`, 'log-result');
            endCombat("Vous échappez au combat.");
        } else {
            addLog(`La <span class="log-result">fuite échoue !</span>`, 'log-result');
            monstersAttack(); 
        }
    }

    // --- Initialization ---
    function initializeCombat() {
        updatePlayerDisplay();
        updateMonsterListDisplay(); 

        attackButton.addEventListener('click', playerAttack);
        fleeButton.addEventListener('click', playerFlee);

        addLog(`Vous affrontez ${monsters.length} adversaires !`);
    }

    initializeCombat();
}); 