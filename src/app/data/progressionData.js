// front/src/app/data/progressionData.js
import { screensData } from './screenData.js';

// Defines the possible choices for each step number.
// Target can be a number or a screen letter ('A', 'B', 'C').
export const progressionData = {
  1: { choices: [{ target: 7 }, { target: 18 }] },
  2: { choices: [{ target: 11 }] },
  3: { choices: [{ target: 5 }, { target: 21 }] },
  4: { choices: [{ target: 10 }, { target: 'B' }] },
  5: { choices: [{ target: 12 }] },
  6: { choices: [{ target: 2 }, { target: 15 }, { target: 25 }] },
  7: { choices: [{ target: 14 }, { target: 20 }] },
  8: { choices: [{ target: 29 }] },
  9: { choices: [{ target: 30 }] },
  10: { choices: [{ target: 6 }] },
  11: { choices: [{ target: 19 }, { target: 22 }] },
  12: { choices: [{ target: 16 }] },
  13: { choices: [{ target: 17 }, { target: 24 }] },
  14: { choices: [{ target: 8 }, { target: 'C' }] },
  15: { choices: [{ target: 26 }] },
  16: { choices: [{ target: 13 }] },
  17: { choices: [{ target: 27 }] },
  18: { choices: [{ target: 4 }, { target: 23 }] },
  19: { choices: [{ target: 9 }] },
  20: { choices: [{ target: 3 }] },
  21: { choices: [{ target: 1 }] },
  22: { choices: [{ target: 28 }] },
  23: { choices: [{ target: 11 }] },
  24: { choices: [{ target: 'A' }] },
  25: { choices: [{ target: 12 }, { target: 17 }] },
  26: { choices: [{ target: 5 }, { target: 19 }] },
  27: { choices: [{ target: 8 }, { target: 15 }] },
  28: { choices: [{ target: 20 }, { target: 30 }] },
  29: { choices: [{ target: 25 }] },
  30: { choices: [] }, // End point
};

// Defines the starting step number for each screen letter.
export const screenStartNodes = {
  A: 1,
  B: 11,
  C: 21,
};

// --- Screen Number Mapping (Calculated once on module load) ---

// Function to generate the map from screen data
function createScreenNumberMap() {
    const map = {};
    console.log("Calculating Screen Number Map..."); // Log to confirm it runs once
    for (const screenId in screensData) {
        if (screensData.hasOwnProperty(screenId)) { // Good practice check
            screensData[screenId].forEach(marker => {
                const num = parseInt(marker.content, 10);
                if (!isNaN(num) && num >= 1 && num <= 30) {
                    if (map[num]) {
                        // Warn if a number appears on multiple screens
                        console.warn(`Progression step number ${num} found on multiple screens: ${map[num]} and ${screenId}. Using the first found (${map[num]}).`);
                    } else {
                        map[num] = screenId;
                    }
                }
            });
        }
    }
    return map;
}

// Calculate the map immediately when the module is loaded
const screenNumberMap = createScreenNumberMap();

// Helper function to find which screen a number belongs to using the pre-calculated map
export function getScreenForNumber(number) {
    return screenNumberMap[number] || null;
} 