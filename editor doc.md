# Documentation de l'Éditeur de Cartes OASIS.JS

## 1. Introduction

### Présentation générale
L'éditeur de cartes OASIS.JS est un outil conçu pour faciliter la création et l'édition de niveaux pour le moteur de jeu OASIS.JS. Cet éditeur basé sur le web permet aux concepteurs de niveau de concevoir des environnements de jeu complexes sans nécessiter de connaissances en programmation.

### Objectifs et cas d'utilisation
L'éditeur a été développé pour:
- Permettre la création visuelle de cartes de jeu
- Faciliter le placement et la configuration des sprites (personnages, ennemis, objets)
- Configurer des systèmes de téléportation entre différentes zones
- Exporter les cartes dans un format compatible avec le moteur OASIS.JS

L'éditeur est particulièrement utile pour:
- Les concepteurs de niveaux travaillant sur des jeux de type RPG dungeon crawler
- Les développeurs souhaitant prototyper rapidement des environnements de jeu
- Les enseignants et étudiants explorant la conception de jeux 2.5D

### Terminologie et concepts de base
- **Carte (Map)**: L'environnement de jeu composé d'une grille de tuiles
- **Tuile (Tile)**: Un élément individuel de la carte (mur, sol, porte, etc.)
- **Sprite**: Un élément interactif ou décoratif placé sur la carte (PNJ, ennemi, objet)
- **Téléporteur**: Un système permettant au joueur de se déplacer entre différentes zones
- **Point A/B**: Points d'entrée et de sortie d'un téléporteur

## 2. Interface utilisateur

### Vue d'ensemble
L'interface de l'éditeur est divisée en plusieurs zones fonctionnelles:
1. Une zone centrale affichant la carte en cours d'édition
2. Une palette latérale présentant les outils disponibles selon le mode d'édition
3. Une zone de propriétés et d'export à droite

L'éditeur propose trois modes principaux (Carte, Sprites, Téléporteurs) qui peuvent être sélectionnés via les boutons appropriés.

### Panneaux et zones de travail

#### Zone d'édition principale
La zone centrale affiche soit la carte principale (pour placer les murs et éléments de terrain), soit la carte des sprites (pour placer les personnages et objets). La grille représente l'environnement du jeu vu du dessus.

- Chaque cellule représente une tuile (zone carrée dans le jeu)
- Les valeurs numériques indiquent le type de tuile
- Les marqueurs colorés indiquent les points de téléportation

#### Palette de tuiles
Visible en mode d'édition de carte, cette palette contient les différents types de tuiles qui peuvent être placés:
- Sol (0): Zone traversable
- Murs (1-9): Différents types de murs et obstacles
Cliquez sur un type de tuile pour le sélectionner, puis cliquez sur la carte pour le placer.

#### Palette de sprites
Accessible en basculant vers le mode Sprite, cette palette permet de sélectionner et placer différents types d'entités:
- Ennemis
- PNJ (personnages non-joueurs)
- Objets décoratifs
- Portes et sorties de niveau

Elle propose deux modes de fonctionnement:
- **Mode Placement**: Pour ajouter de nouveaux sprites
- **Mode Sélection**: Pour sélectionner et modifier des sprites existants

#### Palette de téléporteurs
Cette palette spécialisée permet de configurer les systèmes de téléportation:
- Création et sélection de téléporteurs
- Placement des points d'entrée (A) et de sortie (B)
- Configuration des propriétés de transition

#### Panneau de propriétés
Situé à droite, ce panneau permet de configurer:
- Les propriétés générales de la carte
- La position initiale du joueur
- Les paramètres d'environnement (textures, hauteur de plafond)
- Les propriétés des sprites sélectionnés

#### Zone d'exportation
Cette zone permet:
- D'exporter la carte actuelle au format du moteur
- D'exporter l'ensemble des cartes
- De télécharger/importer des collections
- D'afficher le résultat de l'exportation

### Modes d'édition

#### Mode Carte
Le mode principal pour la création de l'architecture du niveau:
- Placement des murs, portes et obstacles
- Définition des zones traversables

#### Mode Sprite
Dédié au placement des entités interactives et décoratives:
- Ennemis et PNJ
- Objets et décorations
- Points d'intérêt

#### Mode Téléporteurs
Spécialisé dans la création et configuration des systèmes de téléportation:
- Création de paires de points de téléportation
- Configuration des transitions entre zones

## 3. Édition de carte

### Création d'une nouvelle carte
Pour créer une nouvelle carte:
1. Cliquez sur le bouton "Nouvelle carte" dans la section de gestion des cartes
2. Un nouvel ID sera automatiquement attribué à cette carte
3. La carte sera initialisée avec des murs sur les bords et un espace vide au centre

### Placement des murs et éléments de terrain
1. Assurez-vous d'être en mode Carte (la zone Map est visible)
2. Sélectionnez un type de tuile dans la palette de gauche
3. Cliquez sur la grille pour placer la tuile sélectionnée
4. Pour effacer, sélectionnez le type 0 (sol) et cliquez sur la tuile à remplacer

La grille affiche les tuiles avec des couleurs différentes selon leur type pour faciliter la visualisation.

### Types de tuiles disponibles et leur signification

| ID | Type | Description | Apparence dans le jeu |
|----|------|-------------|----------------------|
| 0 | Sol | Zone traversable | Surface plane |
| 1 | Mur de pierre | Obstacle standard | Mur en pierre grise |
| 2 | Mur orné | Obstacle décoratif | Mur avec ornements |
| 3 | Roche | Obstacle naturel | Surface rocheuse |
| 4 | Porte de temple | Entrée spéciale | Grande porte ornée |
| 5 | Forêt | Obstacle naturel | Arbres et végétation |
| 6 | Maison | Structure | Mur de maison |
| 7 | Fenêtre maison | Élément décoratif | Fenêtre sur mur |
| 8 | Porte maison | Entrée | Porte de maison |
| 9 | Porte prison | Entrée spéciale | Porte avec barreaux |

### Conseils pour la conception de niveaux efficaces
- **Équilibre de l'espace**: Alternez entre espaces ouverts et couloirs étroits
- **Points de repère**: Créez des zones distinctives pour aider à l'orientation
- **Contrôle du rythme**: Variez la densité des ennemis et des obstacles
- **Optimisation**: Évitez les zones trop grandes sans intérêt gameplay
- **Cohérence**: Utilisez les types de murs de manière logique (ex: type 6-8 pour les maisons)

## 4. Gestion des sprites

### Types de sprites et leur rôle dans le jeu
Les sprites sont les éléments interactifs ou décoratifs qui peuplent votre carte.

#### Ennemis (Type "A")
- Créatures hostiles qui attaqueront le joueur
- Possèdent des statistiques comme les points de vie et les dégâts
- Peuvent être vaincus par le joueur

#### PNJ (Types 0, 2)
- Personnages non-joueurs avec qui le joueur peut dialoguer
- Peuvent fournir des informations, des quêtes ou du contexte narratif
- Configurables avec des dialogues personnalisés

#### Marchands (Type 3)
- PNJ spéciaux qui peuvent vendre des objets au joueur
- Possèdent un inventaire configurable
- Peuvent également avoir des dialogues personnalisés

#### Objets/Décorations (Type 1, 4 à 17)
- Éléments non-interactifs ou à interaction limitée
- Servent à enrichir visuellement l'environnement
- Incluent des éléments comme des arbres, rochers, coffres, etc.

#### Portes spéciales (Types "DOOR", "EXIT")
- **DOOR**: Transitions entre intérieur/extérieur
- **EXIT**: Points de sortie vers une autre carte

### Placement et édition des sprites
1. Basculez en mode Sprite en cliquant sur le bouton "Sprite Map / World Map"
2. Assurez-vous que le mode "Placement" est actif (bouton surligné)
3. Sélectionnez un type de sprite dans la palette de gauche
4. Choisissez une texture dans le menu déroulant
5. Cliquez sur la carte pour placer le sprite

Pour sélectionner et modifier un sprite existant:
1. Activez le mode "Sélection"
2. Cliquez sur un sprite existant pour le sélectionner
3. Les détails apparaissent dans le panneau latéral
4. Cliquez sur "Éditer propriétés" pour configurer le sprite

### Configuration des propriétés avancées

#### Dialogues des PNJ
Pour les sprites de type PNJ (0, 2):
1. Sélectionnez le PNJ et cliquez sur "Éditer propriétés"
2. Dans la section "Dialogues du PNJ", ajoutez des entrées de dialogue
3. Pour chaque dialogue, configurez:
   - Visage: L'avatar qui apparaîtra (Joueur, Garde, Voleur, Marchand)
   - Nom: Le nom du personnage qui parle
   - Texte: Le contenu du dialogue
4. Vous pouvez ajouter plusieurs lignes pour créer une conversation
5. Cliquez sur "Sauvegarder" pour appliquer les changements

#### Caractéristiques des ennemis
Pour les sprites de type Ennemi ("A"):
1. Sélectionnez l'ennemi et cliquez sur "Éditer propriétés"
2. Configurez:
   - Points de vie: Combien de dégâts l'ennemi peut encaisser
   - Dégâts: Combien de dégâts l'ennemi inflige par attaque
3. Cliquez sur "Sauvegarder" pour appliquer les changements

#### Inventaire des marchands
Pour les sprites de type Marchand (3):
1. Sélectionnez le marchand et cliquez sur "Éditer propriétés"
2. Dans la section "Objets en vente", ajoutez des objets
3. Pour chaque objet, sélectionnez son type dans la liste déroulante
4. Vous pouvez ajouter autant d'objets que nécessaire
5. Cliquez sur "Sauvegarder" pour appliquer les changements

## 5. Système de téléportation

### Création et configuration des téléporteurs
Le système de téléportation permet de créer des transitions entre différentes zones de votre carte ou entre différentes cartes.

Pour accéder à l'éditeur de téléporteurs:
1. Cliquez sur le bouton "Éditeur de téléporteurs"
2. La palette de téléporteurs s'affiche à gauche

Pour créer un nouveau téléporteur:
1. Cliquez sur "Nouveau téléporteur"
2. Un téléporteur avec un ID unique est créé

### Définition des points d'entrée (A) et sortie (B)
Pour placer les points A et B:
1. Sélectionnez un téléporteur dans la liste déroulante
2. Cliquez sur "Placer point A" ou "Placer point B"
3. Cliquez sur la carte pour définir l'emplacement du point
4. Le point sera marqué sur la carte (vert pour A, bleu pour B)

Les points A et B forment une paire: quand le joueur se tient sur A et fait face à la direction configurée, il sera téléporté à B.

### Propriétés des téléporteurs

#### Direction commune
La direction représente l'orientation que le joueur doit avoir pour activer le téléporteur:
- Nord: Le joueur doit regarder vers le haut
- Est: Le joueur doit regarder vers la droite
- Sud: Le joueur doit regarder vers le bas
- Ouest: Le joueur doit regarder vers la gauche

#### Propriétés spécifiques aux points A et B
Chaque point (A et B) possède ses propres propriétés qui définissent l'environnement après la téléportation:

**Onglet Point A (propriétés à destination du point B):**
- Rendu du plafond: Active/désactive l'affichage du plafond
- Texture sol: Définit la texture du sol
- Texture plafond: Définit la texture du plafond
- Hauteur plafond: Définit la hauteur du plafond (1-5)
- Message: Texte affiché lors de la transition

**Onglet Point B (propriétés à destination du point A):**
- Mêmes options, mais appliquées lors de la téléportation de B vers A

Cette configuration asymétrique permet de créer des transitions distinctes dans chaque sens (par exemple, entrer dans un bâtiment vs en sortir).

#### Messages de transition
Les messages configurés s'afficheront brièvement lorsque le joueur active le téléporteur. Ils peuvent être utilisés pour:
- Indiquer un changement de zone ("Entrée du donjon", "Sortie de la forêt")
- Donner du contexte narratif
- Fournir des indices

## 6. Propriétés de carte

### Position initiale du joueur
La position de départ du joueur dans la carte peut être configurée dans le panneau de droite:
- Position X: Coordonnée horizontale (0-23)
- Position Y: Coordonnée verticale (0-23)
- Orientation: Direction initiale (Nord, Est, Sud, Ouest)

### Paramètres d'environnement

#### Plafonds
Les paramètres de plafond affectent l'apparence générale de l'environnement:
- Rendu du plafond: Active/désactive l'affichage du plafond
  - Si désactivé, une skybox (ciel) sera visible au-dessus du joueur
  - Si activé, un plafond texturé sera rendu
- Hauteur du plafond: Définit la hauteur (1-5)
  - Influence la sensation d'espace
  - Affecte le rendu des murs (qui s'étendent jusqu'au plafond)
- Texture du plafond: Choix parmi 3 textures prédéfinies

#### Textures de sol
La texture du sol définit l'apparence du terrain traversable:
- Texture 1: Surface de base
- Texture 2: Alternative
- Texture 3: Alternative
- Texture 4: Alternative

Le choix des textures devrait être cohérent avec le thème de la zone (donjon, extérieur, etc.).

## 7. Gestion des cartes

### Sauvegarde et chargement des cartes
L'éditeur sauvegarde automatiquement vos cartes dans le stockage local du navigateur. Vous pouvez également:
- Sauvegarder manuellement la carte actuelle avec "Sauvegarder carte"
- Charger une carte existante en la sélectionnant dans la liste déroulante

### Organisation des cartes multiples
L'éditeur permet de gérer plusieurs cartes via la section "Gestion des cartes":
- Créer une nouvelle carte (génère automatiquement un nouvel ID)
- Supprimer une carte existante
- Naviguer entre différentes cartes

Chaque carte est identifiée par un ID unique, qui sera utilisé par le moteur du jeu pour charger le bon niveau.

### Exportation vers le format du moteur
Pour utiliser vos cartes dans le moteur OASIS.JS:
1. Sélectionnez la carte à exporter
2. Cliquez sur "Exporter la carte" pour exporter uniquement cette carte
3. Ou cliquez sur "Exporter toutes les cartes" pour exporter la collection complète
4. Le code JSON apparaît dans la zone de texte en bas
5. Copiez ce code et intégrez-le dans votre projet OASIS.JS

Le format d'exportation est optimisé pour être directement utilisable par le moteur du jeu.

### Sauvegarde et importation de collections
Pour sauvegarder vos cartes en dehors du navigateur:
1. Cliquez sur "Télécharger collection" pour sauvegarder toutes vos cartes dans un fichier JSON
2. Ce fichier peut être stocké en sécurité ou partagé avec d'autres concepteurs

Pour restaurer une collection précédemment sauvegardée:
1. Cliquez sur "Importer collection"
2. Sélectionnez le fichier JSON contenant la collection
3. Confirmez l'importation (cela remplacera votre collection actuelle)

## 8. Conseils avancés

### Techniques de conception de niveaux
- **Progression guidée**: Dirigez subtilement le joueur vers les objectifs
- **Récompense de l'exploration**: Placez des trésors ou PNJ intéressants dans des zones cachées
- **Boucles de gameplay**: Créez des zones qui permettent de revenir facilement au point de départ
- **Points de respiration**: Alternez entre zones de combat et zones sécurisées
- **Narration environnementale**: Utilisez la disposition et les décorations pour raconter une histoire

### Gestion efficace des ressources
- **Optimisation des sprites**: Évitez de surcharger une zone avec trop de sprites
- **Réutilisation intelligente**: Utilisez les mêmes types de tuiles de manière créative
- **Segmentation**: Divisez les grandes cartes en zones plus petites reliées par des téléporteurs

### Optimisation des performances
- **Taille de carte raisonnable**: Maintenez une taille de 24x24 pour des performances optimales
- **Densité maîtrisée**: Évitez une densité excessive de sprites dans une même zone
- **Téléporteurs stratégiques**: Utilisez les téléporteurs pour diviser les grandes zones

## 9. Dépannage

### Problèmes courants et solutions

#### Les sprites ne s'affichent pas correctement
- Vérifiez que le sprite n'est pas placé sur une case marquée comme mur ('x')
- Assurez-vous que le type et la texture sont correctement sélectionnés
- Essayez de sélectionner et modifier à nouveau les propriétés du sprite

#### Les téléporteurs ne fonctionnent pas
- Vérifiez que les points A et B sont correctement placés
- Confirmez que la direction est appropriée
- Assurez-vous que les propriétés sont correctement configurées

#### Les données ne sont pas sauvegardées
- Vérifiez l'espace disponible dans le stockage local de votre navigateur
- Exportez régulièrement votre collection via "Télécharger collection"
- Utilisez différents navigateurs si nécessaire

#### L'exportation produit un format incorrect
- Vérifiez que toutes les propriétés nécessaires sont renseignées
- Assurez-vous qu'il n'y a pas d'erreur de syntaxe dans les dialogues ou noms

### Limites connues
- Maximum de 24x24 tuiles par carte
- Limite du stockage local du navigateur pour le nombre de cartes
- Pas de support pour les cartes de forme irrégulière
- Nombre limité de types de tuiles et textures prédéfinis

## 10. Annexes

### Liste des types de tuiles avec visuels

| ID | Nom | Couleur dans l'éditeur | Utilisation recommandée |
|----|-----|------------------------|-------------------------|
| 0 | Sol | Blanc | Zones traversables |
| 1 | Mur de pierre | Gris clair | Murs standard, donjons |
| 2 | Mur orné | Gris | Bâtiments importants, temples |
| 3 | Roche | Marron | Environnements naturels, grottes |
| 4 | Porte de temple | Orange | Entrées de bâtiments importants |
| 5 | Forêt | Vert foncé | Zones extérieures, obstacles naturels |
| 6 | Maison | Marron-rouge | Murs de structures résidentielles |
| 7 | Fenêtre maison | Bleu clair | Détails décoratifs sur bâtiments |
| 8 | Porte maison | Marron foncé | Entrées de maisons |
| 9 | Porte prison | Gris foncé | Donjons, prisons, zones sécurisées |

### Liste des types de sprites avec propriétés

| Type | Description | Propriétés configurables |
|------|-------------|--------------------------|
| "A" | Ennemi | Nom, HP, Dégâts, Texture |
| 0 | PNJ (dialogue) | Nom, Dialogues, Texture |
| 1 | Décoration | Texture |
| 2 | PNJ (spécial) | Nom, Dialogues, Texture |
| 3 | Marchand | Nom, Dialogues, Inventaire, Texture |
| 4 | Quête (donneur) | Nom, Texture |
| 5 | Quête (fin) | Nom, Texture |
| "DOOR" | Porte intérieur/extérieur | Texture |
| "EXIT" | Sortie de niveau | Texture |

### Format des fichiers d'exportation
Le format d'exportation est un tableau JSON contenant des objets de carte. Chaque objet de carte contient:

```json
{
  "mapID": 1,                           // ID unique de la carte
  "map": [[0,1,2,...], [...], ...],     // Tableau 2D de tuiles
  "sprites": [                          // Liste des sprites
    [1, 5, 10, "A", 8, null, "Enemy", [], null, 2, 1],  // Format: [ID, X, Y, Type, Texture, ...]
    [2, 8, 15, 3, 3, "faceMerchant", "Trader", [...], [1, 2, 3], null, null]
  ],
  "eventA": [                           // Points de téléportation A
    [5, 10, 1.57, true, 1, 2, 3, "Message"]  // Format: [X, Y, Rotation, HasCeiling, ...]
  ],
  "eventB": [                           // Points de téléportation B
    [15, 20, 3.14, false, 2, 1, 3, "Message"] // Format: [X, Y, Rotation, HasCeiling, ...]
  ],
  "playerStart": {                      // Position initiale du joueur
    "X": 12,
    "Y": 12,
    "Orientation": 1.57,                // En radians
    "ceilingRender": false,
    "ceilingHeight": 2,
    "ceilingTexture": 1,
    "floorTexture": 3
  }
}
```

## 11. Tutoriels pratiques

### Création d'une carte simple

#### 1. Initialisation
1. Cliquez sur "Nouvelle carte"
2. Définissez la position de départ du joueur (X: 12, Y: 12, Orientation: Nord)
3. Configurez les paramètres d'environnement (ex: sol texture 3, sans plafond)

#### 2. Création de la structure de base
1. Assurez-vous d'être en mode Carte
2. Créez une zone centrale vide (type 0)
3. Entourez-la de murs (type 1)
4. Ajoutez une entrée/sortie (type 4 ou 8)

#### 3. Ajout des éléments décoratifs
1. Passez en mode Sprite
2. Placez des décorations (type 1) comme des rochers, arbres, etc.
3. Ajoutez quelques ennemis (type "A") à des positions stratégiques
4. Placez un PNJ (type 0 ou 2) près de l'entrée

#### 4. Finalisation
1. Vérifiez que tous les éléments sont correctement placés
2. Configurez les propriétés des sprites (dialogues, caractéristiques)
3. Exportez la carte et testez-la dans le moteur

### Mise en place d'un système de quête avec PNJ

#### 1. Création de la structure
1. Concevez une carte avec plusieurs zones interconnectées
2. Prévoyez des emplacements pour les PNJ clés

#### 2. Placement des PNJ
1. Placez un PNJ donneur de quête (type 2 ou 4)
2. Configurez ses dialogues pour introduire la quête
3. Placez un PNJ cible ou un objet de quête ailleurs sur la carte
4. Ajoutez un PNJ de récompense (type 5) pour marquer la fin de la quête

#### 3. Configuration des dialogues
1. Pour le PNJ donneur de quête:
   - Première ligne: Introduction du PNJ
   - Deuxième ligne: Explication de la quête
   - Troisième ligne: Indication sur où chercher
2. Pour le PNJ cible/objet:
   - Dialogue ou interaction confirmant la progression
3. Pour le PNJ de récompense:
   - Dialogue de félicitation
   - Mention de la récompense

### Conception d'un donjon avec téléporteurs

#### 1. Création de la structure du donjon
1. Concevez plusieurs salles connectées par des couloirs
2. Utilisez différents types de murs pour varier l'aspect visuel
3. Prévoyez des zones "secrètes" accessibles via téléporteurs

#### 2. Mise en place des téléporteurs
1. Créez un téléporteur pour l'entrée principale
   - Point A: à l'extérieur du donjon
   - Point B: à l'intérieur
   - Propriétés A→B: Activez le rendu du plafond, texture sombre
   - Propriétés B→A: Désactivez le plafond, texture claire
2. Créez des téléporteurs internes pour des raccourcis
3. Ajoutez un téléporteur pour une zone secrète

#### 3. Peuplement du donjon
1. Placez des ennemis progressivement plus difficiles
2. Ajoutez des décorations thématiques (torches, statues)
3. Placez quelques coffres au trésor ou objets d'intérêt

### Création d'une zone de combat équilibrée

#### 1. Conception de l'arène
1. Créez un espace ouvert entouré de murs
2. Ajoutez quelques obstacles pour créer du couvert
3. Prévoyez des entrées/sorties stratégiques

#### 2. Placement des ennemis
1. Placez 3-5 ennemis de base (faibles HP/dégâts)
2. Ajoutez 1-2 ennemis plus forts à des positions clés
3. Assurez-vous que les ennemis sont espacés pour éviter les combats immédiats

#### 3. Équilibrage
1. Configurez les statistiques des ennemis en fonction de la progression du joueur
2. Ajoutez un PNJ qui peut soigner le joueur ou un objet de santé
3. Créez un chemin de repli pour que le joueur puisse se retirer si nécessaire

#### 4. Test et ajustement
1. Exportez et testez la zone de combat
2. Ajustez le nombre et les statistiques des ennemis selon la difficulté souhaitée
3. Modifiez la disposition si certaines zones créent des goulots d'étranglement indésirables
