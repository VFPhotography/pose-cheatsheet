// Structure des catégories / sous-catégories + poses de base (banque de départ).
// Ce contenu est un point de départ : Victor complète avec ses propres photos via "+ Ajouter".
// Chaque pose porte un champ focal:[min,max] (en mm) utilisé pour la comparaison avec le matériel déclaré.

const CATEGORIES = [
  {
    id: "mariage",
    label: "Mariage",
    icon: "rings",
    subcategories: [
      { id: "preparatifs", label: "Préparatifs" },
      { id: "ceremonie", label: "Cérémonie" },
      { id: "portraits-couple", label: "Portraits de couple" },
      { id: "groupe", label: "Photos de groupe" },
      { id: "cocktail", label: "Cocktail" },
      { id: "soiree", label: "Soirée" }
    ]
  },
  {
    id: "couple",
    label: "Couple",
    icon: "heart",
    subcategories: [
      { id: "classiques", label: "Poses classiques" },
      { id: "mouvement", label: "En mouvement" },
      { id: "proches", label: "Assis / proches" },
      { id: "details", label: "Gros plans / détails" }
    ]
  },
  {
    id: "famille",
    label: "Famille",
    icon: "people",
    subcategories: [
      { id: "multigen", label: "Groupe multigénérationnel" },
      { id: "enfants", label: "Enfants" },
      { id: "parent-enfant", label: "Duo parent-enfant" },
      { id: "individuel", label: "Portraits individuels" }
    ]
  },
  {
    id: "corporate",
    label: "Corporate",
    icon: "briefcase",
    subcategories: [
      { id: "trombinoscope", label: "Portraits / trombinoscope" },
      { id: "atelier", label: "Ambiance travail / atelier" },
      { id: "equipe", label: "Groupe équipe" },
      { id: "networking", label: "Networking" }
    ]
  }
];

const SEED_POSES = [
  // --- MARIAGE / Préparatifs
  { cat: "mariage", sub: "preparatifs", name: "Détails posés", direction: "Alliances, bouquet, parfum, chaussures posés sur un fond texturé (lit, rebord de fenêtre).", technique: "50mm ou 35mm, f/2.8-f/4, lumière naturelle douce, mise au point macro si possible.", focal: [35, 50] },
  { cat: "mariage", sub: "preparatifs", name: "Enfilage de la robe / dernier bouton", direction: "Se placer derrière ou sur le côté, demander aux proches de continuer naturellement sans regarder l'objectif.", technique: "70-200mm à distance pour rester discret, f/2.8, priorité au visage net.", focal: [70, 200] },
  { cat: "mariage", sub: "preparatifs", name: "Regard dans le miroir", direction: "Cadrer le reflet + le sujet, demander un léger sourire ou un regard pensif vers le miroir.", technique: "35-50mm, attention à ne pas se refléter soi-même, f/2.2.", focal: [35, 50] },

  // --- MARIAGE / Cérémonie
  { cat: "mariage", sub: "ceremonie", name: "Entrée / arrivée", direction: "Se positionner en angle (jamais pile dans l'axe) pour capter l'émotion des visages qui se tournent.", technique: "70-200mm, mode silencieux/rideau électronique, f/4 pour profondeur de champ de sécurité.", focal: [70, 200] },
  { cat: "mariage", sub: "ceremonie", name: "Échange des vœux / alliances", direction: "Se rapprocher discrètement, viser le contact visuel entre les mariés et les mains au moment de l'échange.", technique: "70-200mm à f/2.8, rafale courte pour ne pas louper le geste.", focal: [70, 200] },
  { cat: "mariage", sub: "ceremonie", name: "Premier baiser", direction: "Anticiper le signal (officiant), se placer légèrement de côté pour éviter les dos qui cachent la scène.", technique: "70-200mm, vitesse mini 1/500e, rafale.", focal: [70, 200] },

  // --- MARIAGE / Portraits de couple
  { cat: "mariage", sub: "portraits-couple", name: "Front contre front", direction: "\"Rapprochez vos fronts, fermez les yeux, respirez\" — capter juste avant/après un sourire spontané.", technique: "85mm, f/1.8-2.2, contre-jour ou lumière rasante en fin de journée.", focal: [85, 85] },
  { cat: "mariage", sub: "portraits-couple", name: "Marche vers l'objectif, mains liées", direction: "\"Marchez naturellement en discutant, je vous suis\" — plusieurs passages, ne pas regarder l'objectif au début.", technique: "35-50mm, suivi en marchant, f/2.8 pour garder les deux nets.", focal: [35, 50] },
  { cat: "mariage", sub: "portraits-couple", name: "Danse improvisée / tour", direction: "Faire tourner la mariée d'un mouvement lent, capter le mouvement de la robe/du voile.", technique: "50-85mm, vitesse 1/250e mini pour figer, ou 1/60e pour filé volontaire.", focal: [50, 85] },
  { cat: "mariage", sub: "portraits-couple", name: "Silhouette contre-jour", direction: "Se placer face au soleil bas, couple en profil ou de dos, corps légèrement décalés pour se distinguer.", technique: "50-85mm, exposition sur le ciel, f/4-5.6, spot lumineux type golden hour.", focal: [50, 85] },

  // --- MARIAGE / Photos de groupe
  { cat: "mariage", sub: "groupe", name: "Grand groupe pyramidal", direction: "Petits devant assis, moyens debout, grands au fond légèrement décalés — jamais tous alignés à la même hauteur.", technique: "24-35mm à bonne distance, f/5.6-f/8 pour la profondeur de champ, flash de débouchage si contre-jour.", focal: [24, 35] },
  { cat: "mariage", sub: "groupe", name: "Lancer / saut collectif", direction: "Compte à rebours annoncé à voix haute (\"3-2-1 sautez !\"), rafale déclenchée juste avant le \"1\".", technique: "24-35mm, vitesse 1/1000e mini, rafale haute cadence.", focal: [24, 35] },
  { cat: "mariage", sub: "groupe", name: "Groupe rapproché rieur", direction: "Serrer le groupe, demander une blague ou un \"dites plus fort que le voisin je vous entends pas !\" pour un rire naturel.", technique: "35-50mm, f/4, plusieurs déclenchements rapprochés.", focal: [35, 50] },

  // --- MARIAGE / Cocktail
  { cat: "mariage", sub: "cocktail", name: "Discussion animée", direction: "Rester en retrait, capter les échanges naturels sans diriger, privilégier les mains qui parlent et les regards croisés.", technique: "70-200mm, f/2.8-4, discrétion maximale, pas de flash direct.", focal: [70, 200] },
  { cat: "mariage", sub: "cocktail", name: "Trinquer / verre levé", direction: "Repérer un groupe qui lève son verre, se placer avant le \"tchin\" pour capter le geste et les sourires.", technique: "35-50mm, f/2.8, rafale courte.", focal: [35, 50] },
  { cat: "mariage", sub: "cocktail", name: "Ambiance large + détails", direction: "Alterner plan large du lieu/déco et gros plans (petits fours, decoration de table) pour varier le rythme du récit.", technique: "24mm pour le large, 50mm pour les détails.", focal: [24, 50] },

  // --- MARIAGE / Soirée
  { cat: "mariage", sub: "soiree", name: "Ouverture de bal", direction: "Se placer en angle 3/4 face, jamais complètement de dos ni pile face, suivre les mariés dans leur mouvement.", technique: "24-70mm, f/2.8, ISO élevé (1600-6400), flash rebond si plafond blanc bas.", focal: [24, 70] },
  { cat: "mariage", sub: "soiree", name: "Dancefloor plein", direction: "Capter le mouvement flou des danseurs autour d'un point net (les mariés), varier les angles bas/hauts.", technique: "24-35mm, vitesse lente 1/30e avec flash synchro pour filé + net (flash + rideau).", focal: [24, 35] },
  { cat: "mariage", sub: "soiree", name: "Pièce montée / gâteau", direction: "Cadrer serré sur le geste de découpe, veiller à la lumière sur les visages des mariés penchés vers le gâteau.", technique: "35-50mm, f/2.8, flash rebond doux pour équilibrer l'ambiance.", focal: [35, 50] },

  // --- COUPLE / Poses classiques
  { cat: "couple", sub: "classiques", name: "Face à face, mains jointes", direction: "\"Rapprochez-vous, prenez-vous les mains, regardez-vous\" — laisser un temps de silence pour un moment vrai.", technique: "85mm, f/1.8-2.5, lumière douce (ombre ou golden hour).", focal: [85, 85] },
  { cat: "couple", sub: "classiques", name: "Un partenaire porte l'autre sur le dos", direction: "Demander de rire pendant le mouvement, capter juste après le déséquilibre/rire spontané.", technique: "35-50mm, vitesse 1/500e, rafale.", focal: [35, 50] },
  { cat: "couple", sub: "classiques", name: "Baiser sur le front", direction: "L'un incline légèrement la tête, l'autre dépose un baiser — capter la texture des mains et le regard fermé.", technique: "85mm, f/2, cadrage serré poitrine.", focal: [85, 85] },

  // --- COUPLE / En mouvement
  { cat: "couple", sub: "mouvement", name: "Marche main dans la main, dos à la caméra", direction: "Les faire marcher loin devant, demander un regard échangé à mi-parcours.", technique: "35-50mm, f/4, suivre en marchant en arrière si sécurité du terrain le permet.", focal: [35, 50] },
  { cat: "couple", sub: "mouvement", name: "Course / rire complice", direction: "\"Courez doucement en vous tenant la main en riant\" — répéter 2-3 fois pour un mouvement naturel.", technique: "50mm, vitesse 1/640e mini, mode continu AF.", focal: [50, 50] },
  { cat: "couple", sub: "mouvement", name: "Tourner sur soi / robe qui vole", direction: "Faire tourner lentement puis accélérer, déclencher au moment du mouvement le plus ample.", technique: "50-85mm, 1/500e, rafale haute cadence.", focal: [50, 85] },

  // --- COUPLE / Assis / proches
  { cat: "couple", sub: "proches", name: "Assis dos contre un mur/arbre", direction: "Épaule contre épaule ou l'un sur les genoux de l'autre, regard vers l'horizon ou complice entre eux.", technique: "50-85mm, f/2, exploiter la texture du support en arrière-plan flou.", focal: [50, 85] },
  { cat: "couple", sub: "proches", name: "Allongés dans l'herbe", direction: "Vue du dessus ou de profil bas, têtes rapprochées, mains qui se frôlent.", technique: "35mm en plongée ou 85mm au ras du sol, f/2.5.", focal: [35, 85] },
  { cat: "couple", sub: "proches", name: "Sur un banc / marches", direction: "Corps légèrement tournés l'un vers l'autre plutôt que face caméra, jambes croisées naturellement.", technique: "50-85mm, f/2.2, attention à l'arrière-plan (fuyantes, lignes).", focal: [50, 85] },

  // --- COUPLE / Gros plans / détails
  { cat: "couple", sub: "details", name: "Mains entrelacées + bagues", direction: "Demander de joindre les mains naturellement, jouer sur les textures (tissu, peau, bijoux).", technique: "85-100mm, f/2, mise au point précise sur la bague ou les jointures.", focal: [85, 100] },
  { cat: "couple", sub: "details", name: "Regard complice, profils face à face", direction: "Cadrage très serré sur les deux visages de profil, front proche, léger sourire.", technique: "85mm, f/1.8, mise au point sur les yeux du sujet le plus proche.", focal: [85, 85] },
  { cat: "couple", sub: "details", name: "Nuque / cheveux au vent", direction: "Photographier de dos ou de 3/4 arrière pendant un mouvement de tête ou de vent.", technique: "85mm, f/2, contre-jour pour souligner les mèches.", focal: [85, 85] },

  // --- FAMILLE / Groupe multigénérationnel
  { cat: "famille", sub: "multigen", name: "Assis en arc de cercle", direction: "Grands-parents assis au centre, enfants/petits-enfants disposés en arc pour éviter l'alignement plat.", technique: "24-35mm, f/5.6-8 pour tout garder net, flash de débouchage en extérieur.", focal: [24, 35] },
  { cat: "famille", sub: "multigen", name: "Marche en famille", direction: "Faire avancer le groupe vers l'objectif en discutant naturellement, capter les interactions latérales.", technique: "35mm, f/4, rafale, suivi AF continu.", focal: [35, 35] },
  { cat: "famille", sub: "multigen", name: "Câlin collectif", direction: "\"Rapprochez-vous tous et faites un câlin de groupe\" — capter juste après le mouvement de rassemblement.", technique: "24-35mm, f/4, rafale courte.", focal: [24, 35] },

  // --- FAMILLE / Enfants
  { cat: "famille", sub: "enfants", name: "Jeu / course libre", direction: "Laisser l'enfant jouer sans consigne stricte, se mettre à sa hauteur, anticiper les moments de rire.", technique: "35-50mm, vitesse rapide 1/640e, AF continu suivi.", focal: [35, 50] },
  { cat: "famille", sub: "enfants", name: "Portrait au ras du sol", direction: "Se mettre au niveau des yeux de l'enfant, capter un regard direct ou une expression curieuse.", technique: "50-85mm, f/2, mise au point sur l'œil le plus proche.", focal: [50, 85] },
  { cat: "famille", sub: "enfants", name: "Chatouilles / rire éclat", direction: "Demander à un parent de chatouiller doucement l'enfant, rafale au moment du rire.", technique: "35-50mm, f/2.8, rafale haute cadence.", focal: [35, 50] },

  // --- FAMILLE / Duo parent-enfant
  { cat: "famille", sub: "parent-enfant", name: "Porté sur les épaules", direction: "Parent porte l'enfant sur les épaules, demander un regard vers le bas ou vers l'horizon ensemble.", technique: "35mm, f/4, léger contre-plongée pour valoriser.", focal: [35, 35] },
  { cat: "famille", sub: "parent-enfant", name: "Front contre front assis", direction: "Assis face à face ou l'un contre l'autre, moment calme et silencieux à capter.", technique: "50-85mm, f/2, lumière douce latérale.", focal: [50, 85] },
  { cat: "famille", sub: "parent-enfant", name: "Marche main dans la main de dos", direction: "Les filmer/photographier de dos en train de marcher, insister sur la différence de taille des mains.", technique: "35-50mm, f/4, cadrage bas pour inclure les jambes.", focal: [35, 50] },

  // --- FAMILLE / Portraits individuels
  { cat: "famille", sub: "individuel", name: "Portrait 3/4 lumière douce", direction: "Léger angle de 3/4, menton légèrement baissé, regard vers la lumière la plus douce disponible.", technique: "85mm, f/2, lumière de fenêtre ou ombre extérieure homogène.", focal: [85, 85] },
  { cat: "famille", sub: "individuel", name: "Portrait environnemental", direction: "Inclure un élément du lieu (jardin, intérieur familier) pour raconter le contexte de vie.", technique: "35-50mm, f/2.8-4, sujet décentré selon règle des tiers.", focal: [35, 50] },
  { cat: "famille", sub: "individuel", name: "Regard vers l'objectif, sourire naturel", direction: "Faire parler la personne juste avant le déclenchement (question simple) pour un sourire authentique.", technique: "85mm, f/1.8-2, priorité œil AF.", focal: [85, 85] },

  // --- CORPORATE / Portraits / trombinoscope
  { cat: "corporate", sub: "trombinoscope", name: "Portrait studio mobile", direction: "Fond neutre, épaules légèrement de 3/4, regard caméra franc, expression professionnelle mais détendue.", technique: "70-200mm ou 85mm, f/4-5.6, éclairage studio mobile ou lumière de fenêtre diffusée, tethering pour validation directe.", focal: [70, 200] },
  { cat: "corporate", sub: "trombinoscope", name: "Portrait lumière naturelle bureau", direction: "Positionner la personne face à une fenêtre, éviter les ombres dures, fond dégagé et cohérent avec la charte.", technique: "50-85mm, f/3.5-5, ISO adapté à la lumière ambiante, réflecteur si besoin.", focal: [50, 85] },
  { cat: "corporate", sub: "trombinoscope", name: "Portrait debout bras croisés", direction: "Position stable, épaules ouvertes, léger sourire, éviter la symétrie parfaite (léger angle du corps).", technique: "70-200mm, f/4, distance suffisante pour compression flatteuse.", focal: [70, 200] },

  // --- CORPORATE / Ambiance travail / atelier
  { cat: "corporate", sub: "atelier", name: "Geste technique en action", direction: "Demander de reproduire un geste métier habituel sans regarder l'objectif, se placer pour capter les mains et le visage concentré.", technique: "24-70mm, f/2.8-4, gérer les sources de lumière mixtes (néons + naturelle).", focal: [24, 70] },
  { cat: "corporate", sub: "atelier", name: "Plan large de l'environnement", direction: "Montrer le poste de travail ou l'atelier dans son ensemble, personne active en second plan.", technique: "16-24mm, f/5.6-8 pour la profondeur de champ, trépied si lumière faible.", focal: [16, 24] },
  { cat: "corporate", sub: "atelier", name: "Détail outil / matière", direction: "Gros plan sur un outil, un matériau ou un produit fini, en lien avec le métier représenté.", technique: "50-100mm macro si possible, f/4, lumière dirigée pour révéler la texture.", focal: [50, 100] },

  // --- CORPORATE / Groupe équipe
  { cat: "corporate", sub: "equipe", name: "Groupe debout dynamique", direction: "Disposer en quinconce (pas alignés), demander un léger mouvement (bras croisés variés, une personne qui rit) pour casser la rigidité.", technique: "24-35mm, f/5.6-8, flash de débouchage si besoin, plusieurs déclenchements pour éviter les yeux fermés.", focal: [24, 35] },
  { cat: "corporate", sub: "equipe", name: "Équipe en réunion / brainstorm", direction: "Capter un moment d'échange réel autour d'une table, éviter les regards caméra forcés.", technique: "35-50mm, f/2.8, discrétion, lumière ambiante privilégiée.", focal: [35, 50] },
  { cat: "corporate", sub: "equipe", name: "Marche groupée couloir/extérieur", direction: "Faire avancer le groupe vers l'objectif en discutant, capter dynamisme et cohésion.", technique: "35mm, f/4, rafale, suivi AF continu.", focal: [35, 35] },

  // --- CORPORATE / Networking
  { cat: "corporate", sub: "networking", name: "Poignée de main", direction: "Se placer légèrement de côté au moment du contact, viser les deux visages et la poignée de main nette.", technique: "50-70mm, f/4, rafale courte au moment du contact.", focal: [50, 70] },
  { cat: "corporate", sub: "networking", name: "Échange de cartes / discussion debout", direction: "Rester discret en retrait, privilégier les instants d'écoute active (hochement de tête, sourire).", technique: "70-200mm, f/2.8-4, discrétion maximale.", focal: [70, 200] },
  { cat: "corporate", sub: "networking", name: "Prise de parole / intervention", direction: "Se placer face ou légèrement de côté par rapport à l'intervenant, anticiper les gestes marquants.", technique: "70-200mm, f/2.8, vitesse 1/250e mini, ISO élevé si salle sombre.", focal: [70, 200] }
];

// Objectifs courants proposés dans "Mon matériel" (Victor peut aussi ajouter les siens).
const LENS_PRESETS = [
  { id: "1635", label: "16-35mm f/2.8", minMM: 16, maxMM: 35 },
  { id: "2470", label: "24-70mm f/2.8", minMM: 24, maxMM: 70 },
  { id: "70200", label: "70-200mm f/2.8", minMM: 70, maxMM: 200 },
  { id: "35fixe", label: "35mm f/1.4 ou f/1.8", minMM: 35, maxMM: 35 },
  { id: "50fixe", label: "50mm f/1.2 ou f/1.8", minMM: 50, maxMM: 50 },
  { id: "85fixe", label: "85mm f/1.2 ou f/1.8", minMM: 85, maxMM: 85 },
  { id: "macro100", label: "100mm macro", minMM: 100, maxMM: 100 }
];
