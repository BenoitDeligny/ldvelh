document.addEventListener('DOMContentLoaded', () => {
    const rollButton = document.getElementById('roll-button');
    const selectButtons = document.querySelectorAll('.select-button'); // Get all select buttons
    const optionCards = document.querySelectorAll('.stats-option-card'); // Get all cards
    const nameInput = document.getElementById('char-name'); // Get name input
    const createButton = document.getElementById('create-button'); // Get create button

    let generatedStats = []; // To store the 3 generated sets
    let selectedStats = null; // To store the final chosen set

    // Function to roll a single D6
    function rollD6() {
        return Math.floor(Math.random() * 6) + 1;
    }

    // Function to calculate one set of stats
    function generateStatsSet() {
        const power = rollD6() + 1;
        const dexterity = rollD6() + 1;
        const perception = rollD6() + 1;
        const age = rollD6() + 14;
        const combatStrength = power + dexterity + perception;
        return { power, dexterity, perception, age, combatStrength };
    }

    // Function to check if character creation is ready
    function checkCreationReadiness() {
        const nameIsEntered = nameInput.value.trim() !== '';
        const statsAreSelected = selectedStats !== null;
        createButton.disabled = !(nameIsEntered && statsAreSelected);
    }

    // Function to generate and display 3 stat options
    function rollAndDisplayOptions() {
        generatedStats = []; // Clear previous stats if any
        selectedStats = null; // Reset selection on new roll
        for (let i = 1; i <= 3; i++) {
            const stats = generateStatsSet();
            generatedStats.push(stats);

            // Get elements for the current option card
            const powerStatEl = document.getElementById(`power-stat-${i}`);
            const dexterityStatEl = document.getElementById(`dexterity-stat-${i}`);
            const perceptionStatEl = document.getElementById(`perception-stat-${i}`);
            const ageStatEl = document.getElementById(`age-stat-${i}`);
            const combatStrengthEl = document.getElementById(`combat-strength-${i}`);

            // Update the display
            if (powerStatEl) powerStatEl.textContent = stats.power;
            if (dexterityStatEl) dexterityStatEl.textContent = stats.dexterity;
            if (perceptionStatEl) perceptionStatEl.textContent = stats.perception;
            if (ageStatEl) ageStatEl.textContent = stats.age;
            if (combatStrengthEl) combatStrengthEl.textContent = stats.combatStrength;

            console.log(`Option ${i} Stats:`, stats);
        }

        // --- Button Logic --- 
        rollButton.disabled = true; // Disable roll button after clicking
        selectButtons.forEach(btn => btn.disabled = false); // Enable all select buttons
        // Remove any previous selection highlight
        optionCards.forEach(card => card.classList.remove('selected'));
        checkCreationReadiness(); // Check readiness after rolling (name might be entered)
    }

    // Function to handle stat selection
    function handleSelectOption(event) {
        const selectedOptionIndex = parseInt(event.target.dataset.option) - 1; // Get 0-based index
        selectedStats = generatedStats[selectedOptionIndex];

        // Highlight the selected card
        optionCards.forEach((card, index) => {
            card.classList.toggle('selected', index === selectedOptionIndex);
        });

        // Disable all select buttons after selection
        selectButtons.forEach(btn => btn.disabled = true);

        console.log("Selected Stats:", selectedStats);
        checkCreationReadiness(); // Check readiness after selecting stats
    }

    // Add event listener to the roll button
    if (rollButton) {
        rollButton.addEventListener('click', rollAndDisplayOptions);
    } else {
        console.error("Roll button not found!");
    }

    // Add event listeners to the select buttons
    selectButtons.forEach(button => {
        button.addEventListener('click', handleSelectOption);
    });

    if (nameInput) {
        nameInput.addEventListener('input', checkCreationReadiness); // Check on name input
    }

    if (createButton) {
        createButton.addEventListener('click', () => {
            if (!createButton.disabled) {
                // Character creation logic goes here!
                console.log("Creating character:", {
                    name: nameInput.value.trim(),
                    stats: selectedStats
                });
                alert(`Personnage ${nameInput.value.trim()} créé avec succès ! (Vérifiez la console pour les détails)`);
                // TODO: Implement actual character saving/next step
            }
        });
    }

    // Initial state: Buttons are disabled via HTML
    checkCreationReadiness(); // Initial check in case the page is reloaded with data (unlikely here)
}); 