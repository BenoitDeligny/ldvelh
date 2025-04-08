import { screensData } from './progression.screens.js';

export const progressionData = {
  1: { 
      text: "Tu te matérialises en un lieu féerique qui te rappelle certains paysages de la Scandinavie, sur Terre. Une atmosphère de mystère plane sur le décor d'un réalisme saisissant. Une force invisible t'invite à aller au bout d'un petit sentier dérobé devant toi...",
      choices: [{ target: 'A', text: "Regarde l'écran A pour choisir ta destination" }]
  },
  2: { 
      text: "Un chemin borde les sous-bois qui couvrent cette étroite vallée. Tu sens l'air froid et sec te mordre la peau... Mais le plus inquiétant, c'est le silence écrasant qui règne sur les lieux. Rapidement, tu arrives aux abords de la chaumière en contrebas. Les arbres semblent grandir et étendre leur ombre menaçante...",
      choices: [{ target: 'A', text: "Regarde l'écran A pour choisir une nouvelle destination" }]
  },
  3: { 
      text: "A l'intérieur de la chaumière, tu découvres une étonnante reconstitution d'une halle viking plongée dans le silence. - Tu peux ajouter les objets indiqués dans l'écran ci-après à l'équipement de ton personnage. Leur numéro correspond à un sticker que tu trouveras à la p. 164.",
      choices: [{ target: 'A', text: "Ensuite regarde l'écran A pour choisir une nouvelle destination" }]
  },
  4: { 
      text: "Prenant ton courage à deux mains, tu t'enfonces dans le bois. La lumière tamisée qui filtre à travers le feuillage projette des ombres inquiétantes sur le sol. Une légère brise agite les branches... Sans rencontrer âme qui vive, tu sors enfin des bois.",
      choices: [{ target: 9, text: "Va au 09" }]
  },
  5: { 
      text: "La forêt est de plus en plus dense. Tu as le sentiment que quelque chose est tapi dans les recoins obscurs. Les troncs d'une taille impressionnante et les buissons épineux forment des labyrinthes naturels. Tu as la sensation d'être observé... Parfois, tu aperçois des formes furtives... À d'autres moments, tu entends des rires étouffés...",
      choices: [
          { target: 10, text: "Si tu continues à marcher vers le nord, va au 10" },
          { target: 11, text: "Si tu tournes vers l'ouest va au 11" },
          { target: 6, text: "Si tu reviens sur tes pas, va au 06" },
          { target: 12, text: "Enfin, si tu tournes vers l'est, va au 12" }
      ]
  },
  6: { 
      text: "Derrière quelques buissons, se dresse un cercle de feu. La chaleur qui se dégage de la barrière de flammes transforme l'air froid en une légère brume qui monte vers les hauteurs. Au centre du cercle, une forme humaine est allongée sur une grosse roche plate...",
      choices: [
          { target: 7, text: "Si tu prends le risque de traverser les flammes, va au 07" },
          { target: 'A', text: "Si tu préfères renoncer et passer ton chemin, retourne à l'écran A" }
      ]
  },
  7: { 
      text: "Prenant ton élan, tu traverses le mur de flammes. Miracle, tu ne ressens aucune brûlure. Devant toi, sur une grosse pierre plate repose une femme. Soudain un grondement retentit. Du sol jaillissent trois squelettes de guerriers vikings qui se ruent sur toi. — Si tu veux fuir en retraversant le mur de flammes, tu dois faire 8 ou plus [Bonus : Adresse + Sport]. Si tu réussis à repasser le mur de flammes, retourne à l'écran A pour choisir ta nouvelle destination. Si tu échoues, le combat est inévitable. Les règles du combat sont en p. 12.",
      choices: [
          { target: 'A', text: "Tenter de fuir (Test : Adr+Sport ≥ 8)" },
          { target: 13, text: "Si tu es victorieux [du combat], va au 13" }
      ],
      combatInfo: { active: true }
  },
  8: { 
      text: "Le sentier serpente au pied d'un étrange massif montagneux. Au milieu de la falaise rocheuse, tu distingues l'entrée d'une caverne que tu ne peux atteindre qu'en escaladant la paroi.",
      choices: [
          { target: 14, text: "Si tu escalades la paroi, va au 14" },
          { target: 10, text: "Si tu poursuis ta route, va au 10" },
          { target: 11, text: "Si tu descends vers l'étang glacé, va au 11" }
      ]
  },
  9: { 
      text: "Tu découvres un bassin naturel où vient se jeter une cascade. Devant toi se dresse une paroi rocheuse abrupte et anguleuse. À mi-hauteur, tu remarques l'entrée d'une grotte à laquelle tu ne peux accéder qu'en escaladant la falaise.",
      choices: [
          { target: 14, text: "Si tu veux escalader la falaise, va au 14" },
          { target: 'A', text: "Sinon retourne à l'écran A pour choisir une nouvelle destination" }
      ]
  },
  10: { 
      text: "Le sentier continue au pied de la paroi rocheuse pour aboutir à un arbre titanesque haut de plusieurs centaines de mètres.",
      choices: [
          { target: 'B', text: "Si tu vas vers l'arbre gigantesque, va à l'écran B" },
          { target: 'F', text: "Si tu préfères suivre la route vers les montagnes, va à l'écran F" }
      ]
  },
  11: { 
      text: "La surface de l'étang est presque entièrement gelée. Mais la pellicule de glace est suffisamment fine pour laisser apparaître un saumon pris au piège. Le poisson avance vers toi et tu entends une voix étouffée : « Che t'en zubblie, libèrre-moi... Che ne feux bas mourrirr tans zette brrizon te klaze... »",
      choices: [
          { target: 10, text: "Si tu poursuis ta route sur le chemin, va au 10" },
          { target: 'A', text: "Tu peux aussi aller à l'écran A pour choisir une autre destination" },
          { target: 15, text: "Si tu perces la glace pour le libérer, va au 15" }
      ]
  },
  12: {
      text: "La forêt fait place à une vaste plaine. Au loin se profilent des montagnes enneigées. Un arbre solitaire et titanesque domine la plaine. Sa cime se perd dans les nuages.",
      choices: [
          { target: 'B', text: "Si tu marches vers l'arbre géant, va à l'écran B" },
          { target: 'F', text: "Si tu poursuis ton chemin vers les montagnes, va à l'écran F" }
      ]
  },
  13: {
      text: "Tu réduis le dernier zombie viking à l'état d'osselets... Aussitôt, leurs armes et boucliers tombent en poussière. Sur la grande pierre plate, la jeune femme en armure se réveille. S'asseyant lentement sur le bord du rocher, elle pose sur toi un regard pénétrant. « Je te remercie de m'avoir tirée de ce piège magique, te dit-elle. Je suis Brunhilde, reine des Walkyries et toi, tu dois être la Légende... Je te fais don de ma lance. Elle t'aidera dans la quête qui t'attend... » — Ajoute le sticker Lance de Walkyrie (n°1, p. 162) à ton équipement. Alors qu'elle te parle, tu la vois disparaître peu à peu... « Les forces du grand Néant menacent de nous faire disparaître en nous rayant de la mémoire des hommes. Tu as été choisi pour conserver le souvenir... et nous sauver de la destruction. Tu dois retrouver la source de notre pouvoir, la source de l'Hydromel qui donne la vie éternelle. Les nornes te diront où elle se trouve. » Elle a presque disparu quand elle te lance un dernier cri : « ... tu es notre Légende. Surtout ne nous oublie pas... » Il n'y a plus que la pierre plate et le silence.",
      choices: [{ target: 'A', text: "Retourne à l'écran A pour choisir ta destination" }]
  },
  14: {
      text: "Pour escalader la paroi, tu dois faire 9 ou plus [Bonus : Adresse + Escalade ou Survie].",
      choices: [
          { target: 'C', text: "Si tu réussis va à l'écran C" },
          { target: 8, text: "Si tu échoues retourne au 08" }
      ],
      actionInfo: { buttonText: "Tenter d'escalader la paroi" }
  },
  15: {
      text: "Pour briser la glace, tu dois faire 7 ou plus [Bonus : Puissance]. Si tu échoues, tu peux recommencer mais tu dois faire 9 ou plus. Si tu échoues encore, le saumon ira se perdre dans les profondeurs de l'étang.",
      choices: [
          { target: 16, text: "Si tu réussis va au 16" },
          { target: 'A', text: "Si tu échoues [finalement], tu pourras retourner à l'écran A" }
      ],
      actionInfo: { buttonText: "Tenter de briser la glace" }
  },
  16: {
      text: "Le saumon saute hors de l'eau et, dans un nuage d'étincelles, se transforme en un personnage singulièrement petit, un nain de contes de fées, vêtu d'une tunique sombre émaillée d'étoiles et d'un chapeau pointu de magicien. « Zois béni barr les Æzirrs, dit-il. Che me zuis laizzé brrentre au biège bar le frroid et ch'ai bien krru ma terrnière hürre arrifée. Bourr te rremerrzier, che t'offre zezi. Elle te borrterra janze... » Le nain te tend un joyau. — Ajoute le sticker Pierre de chance (n° 2, p. 162) dans ton équipement. « Che tois te laizzer, ajoute-t-il sans te laisser le temps de réagir. Mais nous nous rreferrrons zürrement bientôt... » Aussitôt, il disparaît dans un pop de bulle de savon qui explose.",
      choices: [{ target: 'A', text: "Retourne à l'écran A pour choisir une nouvelle destination" }]
  },
  17: {
      text: "Chaque racine est faite d'un métal différent : fer, bronze, argent et or, mais tous présentent les aspects du bois. Le tronc offre un nombre important de prises qui te permettront de l'escalader. — Si tu décides de grimper sur le tronc, tu dois faire 8 ou plus [Bonus : Adresse + Escalader].",
      choices: [
          { target: 21, text: "Si tu réussis [à grimper] va au 21" },
          { target: 18, text: "Si tu échoues [à grimper], va au 18" },
          { target: 'A', text: "Tu peux également revenir à l'écran A" }
      ],
      actionInfo: { buttonText: "Tenter de grimper sur le tronc" }
  },
  18: {
      text: "Tu t'y reprends à plusieurs reprises, mais tes vains efforts sont salués par un petit rire venant de plus haut. Agrippé à l'écorce, tu vois un écureuil presque aussi grand que toi. Il te regarde et rit de bon cœur. « Ce n'est pas drôle, lui dis-tu en guise de reproche. — Pourtant, jeune Légende, c'est plutôt comique, te répond l'animal. Je peux t'aider si tu veux. » Cet écureuil géant est doué de parole et son pelage est pailleté d'or.",
      choices: [
          { target: 20, text: "Si tu continues de lui parler, va au 20" },
          { target: 19, text: "Si tu décides de l'ignorer pour tenter à nouveau de grimper, va au 19" },
          { target: 'A', text: "Si tu préfères repartir, retourne à l'écran A" }
      ]
  },
  19: {
      text: "Tu tentes de trouver une nouvelle prise pour grimper sur la racine, mais tu sens un souffle froid dans ton cou. L'écureuil est juste derrière toi et sa grosse tête est quasiment sur ton épaule. « Si tu le désires, dit-il avec une voix doucereuse, je veux bien t'aider et t'emmener où tu voudras sur l'arbre... » Ses gros yeux battent des cils pour t'amadouer.",
      choices: [
          { target: 22, text: "Si tu acceptes son aide, va au 22" },
          { target: 'A', text: "Si tu décides de repartir [...], retourne à l'écran A" }
      ]
  },
  20: {
      text: "L'écureuil géant à la fourrure dorée s'exprime très clairement en suédois ancien... « Qui es-tu ? demandes-tu sans réfléchir. Peux-tu m'aider et m'expliquer ce qui se passe ici ? — Jeune Légende, je suis Ratatosk, messager des dieux et des hommes à travers les mondes du Grand Arbre. Mais les réponses à tes questions, tu les trouveras auprès de Vedrfolnir, le seigneur du ciel. — Qui est Ved-je-ne-sais-quoi ? — C'est l'aigle doré, le maître du ciel et des secrets célestes... répond gravement l'écureuil. » Apparemment, Ratatosk, l'écureuil attend ta réaction.",
      choices: [
          { target: 32, text: "Si tu lui demandes de t'emmener voir Vedrfolnir [...], allez au 32" },
          { target: 'B', text: "Autrement, [...] Va à l'écran B pour choisir ta destination" }
      ]
  },
  21: {
      text: "Tu escalades rapidement le tronc de l'arbre géant. Mais à mesure que tu grimpes, le tronc se met à grossir à vue d'œil. L'arbre est aussi grand qu'un gratte-ciel et tu as été rétréci... Tu es sur un nœud d'écorce et les ondulations du tronc sont grandes comme des corniches.",
      choices: [
          { target: 23, text: "Si tu décides de redescendre vers la terre ferme, va au 23" },
          { target: 24, text: "Si tu décides de monter encore plus haut, va au 24" }
      ]
  },
  22: {
      text: "Tu souris à ce gros écureuil espiègle. Il te rend ton sourire et cligne rapidement des yeux. « Je suis Ratatosk, te dit-il. Où veux-tu aller ? » Aussitôt, il t'agrippe avec ses petites pattes noires et t'installe sur son dos.",
      choices: [{ target: 'B', text: "Retourne à l'écran B pour choisir ta destination" }]
  },
  23: {
      text: "La descente est épuisante. D'autant qu'en te rapprochant de la terre ferme, tu n'as pas retrouvé ta taille réelle. Dans le ciel, tu aperçois un rapace à la robe dorée fondre sur toi à une vitesse vertigineuse.",
      choices: [
          { target: 28, text: "Si tu décides de combattre cet oiseau gigantesque, va au 28" },
          { target: 29, text: "Si tu prends la fuite et te réfugies [...], va au 29" }
      ]
  },
  24: {
      text: "En enjambant les veinures de l'écorce, tu poursuis ton chemin. Mais au détour d'un nœud, tu te retrouves nez à nez avec la truffe humide et noiraude d'un écureuil gigantesque. Tu as à peu près la taille de son œil gauche qui t'observe. « Je te salue jeune Légende, lance-t-il. » Son souffle est si puissant que tu manques de tomber dans le vide. — Tu dois faire 12 ou plus [Bonus : Adresse + Survie] pour rester sur la corniche.",
      choices: [
          { target: 30, text: "Si tu réussis, va au 30" },
          { target: 26, text: "Si tu échoues, va au 26" }
      ],
      actionInfo: { buttonText: "Tenter de rester sur la corniche" }
  },
  25: {
      text: "Tel un pont de bois, la branche traverse les airs pour atteindre une sorte de nid. Les brindilles ont la taille d'arbres adultes. Au bord du nid se trouve un aigle géant. Lentement, il tourne la tête et t'examine avec cette vivacité propre aux grands rapaces.",
      choices: [
          { target: 32, text: "Si tu restes là [...], va au 32" },
          { target: 27, text: "Si tu préfères rebrousser chemin, retourne au 27" }
      ]
  },
  26: {
      text: "Tu tombes dans le vide. Le sol est à plusieurs centaines de mètres. Jamais tu n'aurais pensé avoir grimpé aussi haut. En tournoyant dans les airs, tu vois un rapace qui fond sur toi. L'aigle t'attrape dans ses serres gigantesques et te porte vers le sommet, dans un nid posé sur l'une des branches. N'aie crainte, jeune Légende, résonne une voix caverneuse, tu es en sécurité. » Avec une infinie délicatesse, l'aigle te dépose dans son nid et se pose dans un nuage de poussière.",
      choices: [{ target: 32, text: "Va au 32" }]
  },
  27: {
      text: "Tu parviens enfin à la fourche de l'arbre géant. Elle forme une immense plaine d'où partent trois branches principales. Ton arrivée perturbe une douzaine de daims bleus qui s'enfuient rapidement vers les hauteurs.",
      choices: [
          { target: 'D', text: "Choisis la branche D" },
          { target: 'E', text: "Choisis la branche E" },
          { target: 'F', text: "Choisis la branche F" }
      ]
  },
  28: {
      text: "Tu te prépares à un combat sans merci avec un aigle gigantesque. Mais arrivé à ta hauteur, il se transforme en un vieillard décharné vêtu d'une robe brodée d'or. « Tu n'as rien à craindre de moi, jeune Légende, dit le vieil homme. Si tu n'as pas confiance, alors poursuis ton chemin. » Ses yeux vifs et ses cheveux coiffés en arrière, lui donnent des allures de rapace.",
      choices: [
          { target: 32, text: "Si tu décides de t'entretenir avec lui, va au 32" },
          { target: 31, text: "Si tu préfères continuer vers la base de l'arbre, va au 31" },
          { target: 27, text: "Si tu veux repartir vers le sommet de l'arbre, va au 27" }
      ]
  },
  29: {
      text: "Dans les mousses qui recouvrent les racines de l'arbre, tu trouves un trou pour te cacher. Retenant ta respiration, tu entends l'aigle qui tourne autour de ta cachette. Finalement le rapace disparaît.",
      choices: [
          { target: 33, text: "Si tu veux redescendre sur la terre ferme, va au 33" },
          { target: 'Q', text: "Si tu poursuis ton chemin dans ces ténèbres, va à l'écran Q" },
          { target: 27, text: "Si tu veux escalader le tronc jusqu'à la fourche de l'arbre, va au 27" }
      ]
  },
  30: {
      text: "L'écureuil géant se redresse comme pris de panique et te regarde effrayé. « Je suis désolé, dit-il timidement. Si je peux t'aider en quoi que ce soit, dit-le-moi. »",
      choices: [
          { target: 23, text: "Si tu décides de fuir [...], retourne au 23" },
          { target: 20, text: "Si tu parles avec cet étrange animal, retourne au 20" },
          { target: 27, text: "Si tu l'ignores et que tu poursuis ton escalade, va au 27" }
      ]
  },
  31: {
      text: "À la base de la racine, tu découvres plusieurs grottes naturelles. La lumière est rare et une menace invisible plane sur ces tunnels ténébreux.",
      choices: [
          { target: 33, text: "Si tu préfères éviter les tunnels [...], va au 33" },
          { target: 'Q', text: "Si tu t'enfonces dans les entrailles de la terre, va à l'écran Q" },
          { target: 27, text: "Si tu veux remonter vers la fourche de l'arbre, va au 27" }
      ]
  },
  32: {
      text: "L'aigle doré s'est transformé en vieillard au regard perçant et à la chevelure raide. « Qui es-tu ? demandes-tu. Et quel est cet endroit ? — Je suis Vedrfolnir, le seigneur du ciel, répond le vieillard d'une voix rauque. Et tu es ici aux pieds d'Yggdrasil, l'arbre-monde qui relie l'Asgard au Midgard, le Jotunheim à la terre des Nidavelirs, la terre des vivants aux souterrains des morts... » Derrière lui, apparaît un lézard humanoïde, grotesque et translucide. Il s'approche de toi en traversant le vieillard. « Désolé, dit-il d'une voix artificielle et nasillarde. Je suis en retard... J'espère que je n'ai rien manqué. » Le vieillard n'a pas l'air de remarquer la présence de l'homme-lézard. « T'inquiète pas, il ne peut pas me voir, ajoute le lézard comme s'il lisait dans tes pensées. Je m'appelle Zard et je suis à ta disposition pour toute information sur ta quête... À condition, bien entendu, que cela figure dans ma banque de données... — Qui es-tu ? Ou plutôt, qu'est-ce que tu es ? demandes-tu un peu stupéfait. — Je suis... heu, comment dire ?... une... ou plutôt un... enfin bref, je suis un... ( Il hésite une seconde puis te considère d'un œil entendu. ) Personne ne t'a mis au courant ? »",
      choices: []
  },
  33: {
      text: "Placeholder Text for Step 33 (Not provided in images)",
      choices: []
  }
};

export const screenStartNodes = {
  A: 1,
  B: 11,
  C: 21,
  D: 1,
  E: 1,
  F: 1,
  Q: 1
};

function createScreenNumberMap() {
    const map = {};
    for (const screenId in screensData) {
        if (screensData.hasOwnProperty(screenId)) {
            screensData[screenId].forEach(marker => {
                const num = parseInt(marker.content, 10);
                if (!isNaN(num) && num >= 1 && num <= 33) {
                    if (map[num]) {
                        map[num] = screenId; 
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