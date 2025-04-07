import { screensData } from './screenData.js';

export const progressionData = {
  1: { 
      text: "Tu te matérialises en un lieu féerique qui te rappelle certains paysages de la Scandinavie, sur Terre. Une atmosphère de mystère plane sur le décor d'un réalisme saisissant. Une force invisible t'invite à aller au bout d'un petit sentier dérobé devant toi...",
      choices: [{ target: 7 }, { target: 18 }] 
  },
  2: { 
      text: "Un chemin borde les sous-bois qui couvrent cette étroite vallée. Tu sens l'air froid et sec te mordre la peau... Mais le plus inquiétant, c'est le silence écrasant qui règne sur les lieux. Rapidement, tu arrives aux abords de la chaumière en contrebas. Les arbres semblent grandir et étendre leur ombre menaçante...",
      choices: [{ target: 11 }] 
  },
  3: { 
      text: "A l'intérieur de la chaumière, tu découvres une étonnante reconstitution d'une halle viking plongée dans le silence.",
      choices: [{ target: 5 }, { target: 21 }] 
  },
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

export const screenStartNodes = {
  A: 1,
  B: 11,
  C: 21,
};


function createScreenNumberMap() {
    const map = {};
    for (const screenId in screensData) {
        if (screensData.hasOwnProperty(screenId)) {
            screensData[screenId].forEach(marker => {
                const num = parseInt(marker.content, 10);
                if (!isNaN(num) && num >= 1 && num <= 30) {
                    if (map[num]) {
                        console.warn(`Progression step ${num} found on screens ${map[num]} and ${screenId}. Using ${map[num]}.`);
                    } else {
                        map[num] = screenId;
                    }
                }
            });
        }
    }
    return map;
}

const screenNumberMap = createScreenNumberMap();

export function getScreenForNumber(number) {
    return screenNumberMap[number] || null;
} 