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
  4: { 
      text: "Prenant ton courage à deux mains, tu t'enfonces dans le bois. La lumière tamisée qui filtre à travers le feuillage projette des ombres inquiétantes sur le sol. Une légère brise agite les branches... Sans rencontrer âme qui vive, tu sors enfin des bois.",
      choices: [{ target: 9 }] 
  },
  5: { 
      text: "La forêt est de plus en plus dense. Tu as le sentiment que quelque chose est tapi dans les recoins obscurs. Les troncs d'une taille impressionnante et les buissons épineux forment des labyrinthes naturels. Tu as la sensation d'être observé... Parfois, tu aperçois des formes furtives... À d'autres moments, tu entends des rires étouffés...",
      choices: [{ target: 10 }, { target: 11 }, { target: 6 }, { target: 12 }] 
  },
  6: { 
      text: "Derrière quelques buissons, se dresse un cercle de feu. La chaleur qui se dégage de la barrière de flammes transforme l'air froid en une légère brume qui monte vers les hauteurs. Au centre du cercle, une forme...",
      choices: [{ target: 2 }, { target: 15 }, { target: 25 }] 
  },
  7: { 
      text: "Prenant ton élan, tu traverses le mur de flammes. Miracle, tu ne ressens aucune brûlure. Devant toi, sur une grosse pierre plate repose une femme. Soudain un grondement retentit. Du sol jaillissent trois squelettes de guerriers vikings qui se ruent sur toi. Pour fuir en retraitant par les flammes, tu dois faire 8 ou plus [Bonus: Adresse + Sport]. Si tu échoues ou si tu choisis de combattre, suis les règles p.12.",
      choices: [{ target: 'A' }, { target: 13 }] 
  },
  8: { 
      text: "Le sentier serpente au pied d'un étrange massif montagneux. Au milieu de la falaise rocheuse, tu distingues l'entrée d'une caverne que tu ne peux atteindre qu'en escaladant la paroi.",
      choices: [{ target: 14 }, { target: 10 }, { target: 11 }] 
  },
  9: { 
      text: "Tu découvres un bassin naturel où vient se jeter une cascade. Devant toi se dresse une paroi rocheuse abrupte et anguleuse. À mi-hauteur, tu remarques l'entrée d'une grotte à laquelle tu ne peux accéder qu'en escaladant la falaise.",
      choices: [{ target: 14 }, { target: 'A' }] 
  },
  10: { 
      text: "Le sentier continue au pied de la paroi rocheuse pour aboutir à un arbre titanesque haut de plusieurs centaines de mètres.",
      choices: [{ target: 'B' }, { target: 'F' }] // Note: Target 'F' might need definition in screenStartNodes if it's a new screen
  },
  11: { 
      text: "La surface de l'étang est presque entièrement gelée. Mais la pellicule de glace est suffisamment fine pour laisser apparaître un saumon pris au piège. Le poisson avance vers toi et tu entends une voix étouffée : « Che t'en zubblie, libèrre-moi... Che ne feux bas mourrirr tans zette brrizon te klaze... »",
      choices: [{ target: 10 }, { target: 'A' }, { target: 15 }] 
  },
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