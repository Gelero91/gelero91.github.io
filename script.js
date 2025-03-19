  // Constantes d'orientation
  const nord = Math.PI / 2;        // 90 degrés
  const ouest = Math.PI;           // 180 degrés
  const sud = (3 * Math.PI) / 2;   // 270 degrés
  const est = 0;                   // 0 degrés
  
  // Variables globales
  let teleporters = [];
  let placementMode = null;
  let selectedTeleporter = null;
  
  var isMapSelected = true; // Par défaut, la carte est sélectionnée

  // Structure pour stocker plusieurs cartes
  var mapCollection = {
    maps: {},
    currentMapId: 1
  };
  
  function deselectTileType() {
    selectedTile = -1;
    updateCoordinates('-', '-'); // Réinitialise les coordonnées
  }

  function updateCoordinates(x, y) {
    var coordinatesText = document.getElementById('coordinatesText');
    coordinatesText.textContent = 'x: ' + x + ', y: ' + y;
  }

  function toggleMapView() {
    var mapContainer = document.querySelector('.map');
    var spriteMapContainer = document.querySelector('.sprite-map');
    // Copier les valeurs de la carte principale vers la carte des sprites
    copyToSpriteMap();

    if (mapContainer.style.display === '' || mapContainer.style.display === 'flex') {
        mapContainer.style.display = 'none';
        spriteMapContainer.style.display = 'flex';
        document.querySelector('.spritePalette').style.display = 'flex';
        document.querySelector('.mapPalette').style.display = 'none';
        document.querySelector('.teleportPalette').style.display = 'none';
        isMapSelected = false; // La sprite map est maintenant sélectionnée
    } else {
        mapContainer.style.display = 'flex';
        spriteMapContainer.style.display = 'none';
        document.querySelector('.spritePalette').style.display = 'none';
        document.querySelector('.mapPalette').style.display = 'flex';
        document.querySelector('.teleportPalette').style.display = 'none';
        isMapSelected = true; // La carte principale est maintenant sélectionnée
    }
  }
  
  var worldMap = [[
    3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 5, 5, 5, 1, 9, 1, 5, 5, 5, 5, 5, 5,
  ],
  [
    3, 0, 0, 0, 3, 3, 3, 1, 1, 1, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5,
  ],
  [
    3, 0, 0, 0, 3, 3, 3, 1, 5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5,
  ],
  [
    3, 0, 0, 0, 0, 0, 3, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5,
  ],
  [
    3, 0, 0, 0, 3, 0, 3, 6, 6, 7, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5,
  ],
  [
    3, 0, 0, 0, 3, 0, 3, 6, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5,
  ],
  [
    3, 3, 3, 3, 3, 0, 3, 6, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5,
  ],
  [
    3, 3, 3, 0, 0, 0, 3, 6, 6, 0, 6, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5,
  ],
  [
    3, 0, 0, 0, 0, 0, 3, 6, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5,
  ],
  [
    3, 0, 3, 3, 3, 3, 3, 6, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5,
  ],
  [
    3, 0, 0, 0, 0, 3, 3, 6, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5,
  ],
  [
    3, 3, 0, 0, 0, 3, 3, 6, 6, 7, 6, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5,
  ],
  [3, 3, 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [3, 3, 3, 4, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [
    1, 1, 1, 0, 1, 1, 1, 1, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5,
  ],
  [
    1, 1, 0, 0, 0, 1, 1, 1, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5,
  ],
  [1, 1, 0, 0, 0, 0, 0, 1, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5],
  [1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3],
  [1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
  [1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 3, 3, 1],
  [2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 2, 4, 2, 1, 0, 0, 1, 1, 1],
  [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]];
  
  var worldSpriteMap = generateWorldMap(24, 24, 0, 0);
  
  // Structure pour stocker les données avancées des sprites
  var spriteProperties = {};
  var selectedSpritePos = null;
  var spriteSelectionMode = false; // Mode de sélection de sprite actif ou non

  // Définir toggleTeleportEditor() en dehors de la fonction d'écouteur d'événement
  var isTeleportPaletteVisible = false; // Ajouter une variable pour suivre l'état de la palette de téléporteur

  function toggleTeleportPalette() {
    var teleportPalette = document.querySelector('.teleportPalette');
    var mapPalette = document.querySelector('.mapPalette');
    var spritePalette = document.querySelector('.spritePalette');
  
    if (isTeleportPaletteVisible) {
      // Masquer la palette de téléporteur
      teleportPalette.style.display = 'none';
      // Afficher la palette de carte si on est en mode carte
      if (isMapSelected) {
        mapPalette.style.display = 'flex';
        spritePalette.style.display = 'none';
      } else {
        mapPalette.style.display = 'none';
        spritePalette.style.display = 'flex';
      }
      isTeleportPaletteVisible = false;
    } else {
      // Masquer les autres palettes
      mapPalette.style.display = 'none';
      spritePalette.style.display = 'none';
      // Afficher la palette de téléporteur
      teleportPalette.style.display = 'flex';
      isTeleportPaletteVisible = true;
    }
  }
  
  // Ajouter un écouteur d'événements au bouton de la palette de téléporteur
  var teleportEditorBtn = document.querySelector('#teleportEditor');
  teleportEditorBtn.addEventListener('click', toggleTeleportPalette);

  // Créer un nouveau téléporteur
  function createTeleporter() {
    const newTeleporter = {
      id: teleporters.length + 1,
      pointA: { 
        x: -1, 
        y: -1,
        hasCeiling: false,
        floorTexture: 1,
        ceilingTexture: 1,
        ceilingHeight: 1,
        message: "Moving out..."
      },
      pointB: { 
        x: -1, 
        y: -1,
        hasCeiling: false,
        floorTexture: 1,
        ceilingTexture: 1,
        ceilingHeight: 1,
        message: "Moving in..."
      },
      direction: "nord" // La direction reste commune (orientation)
    };
    
    teleporters.push(newTeleporter);
    selectedTeleporter = newTeleporter;
    updateTeleporterSelect();
    return newTeleporter;
  }

  // Mettre à jour la liste déroulante des téléporteurs
  function updateTeleporterSelect() {
    const teleportSelect = document.getElementById("teleport-select");
    teleportSelect.innerHTML = '<option value="">Sélectionner un téléporteur...</option>';
    
    teleporters.forEach((teleporter, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = `Téléporteur ${teleporter.id}`;
      teleportSelect.appendChild(option);
    });
  }

  // Gérer les clics sur la carte pour placer les points
  function handleMapClick(x, y) {
    if (!placementMode || selectedTeleporter === null) return;
    
    if (placementMode === 'pointA') {
      selectedTeleporter.pointA.x = x;
      selectedTeleporter.pointA.y = y;
    } else if (placementMode === 'pointB') {
      selectedTeleporter.pointB.x = x;
      selectedTeleporter.pointB.y = y;
    }
    
    // Désactiver le mode placement après un clic
    placementMode = null;
    updatePlacementButtons();
    // Mettre à jour l'affichage visuel sur la carte
    updateTeleporterDisplay();
  }

  // Mettre à jour l'apparence des boutons de placement
  function updatePlacementButtons() {
    document.getElementById('place-point-a').classList.toggle('active', placementMode === 'pointA');
    document.getElementById('place-point-b').classList.toggle('active', placementMode === 'pointB');
  }

  // Afficher les téléporteurs sur la carte
  function updateTeleporterDisplay() {
    // Réinitialiser l'affichage
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
      tile.classList.remove('teleport-a', 'teleport-b');
    });
    
    // Marquer les points sur la carte
    teleporters.forEach(teleporter => {
      if (teleporter.pointA.x >= 0 && teleporter.pointA.y >= 0) {
        const tileA = document.querySelector(`.map .tile[data-x="${teleporter.pointA.x}"][data-y="${teleporter.pointA.y}"]`);
        if (tileA) {
          tileA.classList.add('teleport-a');
          tileA.textContent = "A" + teleporter.id;
        }
      }
      
      if (teleporter.pointB.x >= 0 && teleporter.pointB.y >= 0) {
        const tileB = document.querySelector(`.map .tile[data-x="${teleporter.pointB.x}"][data-y="${teleporter.pointB.y}"]`);
        if (tileB) {
          tileB.classList.add('teleport-b');
          tileB.textContent = "B" + teleporter.id;
        }
      }
    });
  }

  // Supprimer un téléporteur
  function deleteTeleporter() {
    const index = document.getElementById('teleport-select').value;
    if (index !== "" && teleporters[index]) {
      teleporters.splice(index, 1);
      updateTeleporterSelect();
      updateTeleporterDisplay();
      selectedTeleporter = null;
    }
  }

  // Convertir notre structure vers le format attendu par le moteur
  function getEventData() {
    // Format pour compatibilité avec le moteur
    const mapEventA = teleporters.map(t => {
      const rotationValue = getRotationValue(t.direction);
      return [
        parseInt(t.pointA.x), parseInt(t.pointA.y), 
        rotationValue, t.pointA.hasCeiling, 
        t.pointA.ceilingTexture || 1,
        t.pointA.ceilingHeight || 1,  
        t.pointA.floorTexture || 1,
        t.pointA.message || "Moving out..."
      ];
    });
    
    const mapEventB = teleporters.map(t => {
      const rotationValue = getRotationValue(t.direction);
      return [
        parseInt(t.pointB.x), parseInt(t.pointB.y),
        rotationValue, t.pointB.hasCeiling,
        t.pointB.ceilingTexture || 1,
        t.pointB.ceilingHeight || 1,
        t.pointB.floorTexture || 1,
        t.pointB.message || "Moving in..."
      ];
    });
    
    return { eventA: mapEventA, eventB: mapEventB };
  }

  // Convertir la direction en valeur de rotation
  function getRotationValue(direction) {
    switch(direction) {
      case "nord": return nord;
      case "est": return est;
      case "sud": return sud;
      case "ouest": return ouest;
      default: return nord;
    }
  }

  // Convertir la direction en radians
  function getOrientationInRadians(direction) {
    switch(direction) {
      case "nord": return Math.PI / 2;  // 90 degrés
      case "est": return 0;             // 0 degrés
      case "sud": return 3 * Math.PI / 2; // 270 degrés
      case "ouest": return Math.PI;     // 180 degrés
      default: return Math.PI / 2;      // Nord par défaut
    }
  }

  // Configurer les contrôles des téléporteurs
  function setupTeleporterControls() {
    // Initialiser quelques téléporteurs par défaut
    if (teleporters.length === 0) {
      for (let i = 0; i < 2; i++) {
        createTeleporter();
      }
    }
    
    // Bouton de création
    document.getElementById("create-teleport-btn").addEventListener("click", createTeleporter);
    
    // Bouton de suppression
    document.getElementById("delete-teleport-btn").addEventListener("click", deleteTeleporter);
    
    // Boutons de placement
    document.getElementById("place-point-a").addEventListener("click", () => {
      placementMode = placementMode === 'pointA' ? null : 'pointA';
      updatePlacementButtons();
    });
    
    document.getElementById("place-point-b").addEventListener("click", () => {
      placementMode = placementMode === 'pointB' ? null : 'pointB';
      updatePlacementButtons();
    });
    
    // Sélection d'un téléporteur existant
    document.getElementById("teleport-select").addEventListener("change", (e) => {
      const index = parseInt(e.target.value);
      selectedTeleporter = index !== "" ? teleporters[index] : null;
      
      // Mettre à jour les contrôles avec les valeurs du téléporteur sélectionné
      if (selectedTeleporter) {
        updateTeleportPropertiesDisplay();
      }
    });
    
    // Écouter les changements de propriétés
    document.getElementById("teleport-rotation").addEventListener("change", (e) => {
      if (selectedTeleporter) selectedTeleporter.direction = e.target.value;
    });
    
    // Point A
    document.getElementById("teleport-a-rendu-plafond").addEventListener("change", (e) => {
      if (selectedTeleporter) selectedTeleporter.pointA.hasCeiling = e.target.checked;
    });
    
    document.getElementById("teleport-a-texture-sol").addEventListener("change", (e) => {
      if (selectedTeleporter) selectedTeleporter.pointA.floorTexture = parseInt(e.target.value);
    });
    
    document.getElementById("teleport-a-texture-plafond").addEventListener("change", (e) => {
      if (selectedTeleporter) selectedTeleporter.pointA.ceilingTexture = parseInt(e.target.value);
    });
    
    document.getElementById("teleport-a-hauteur-plafond").addEventListener("change", (e) => {
      if (selectedTeleporter) selectedTeleporter.pointA.ceilingHeight = parseInt(e.target.value);
    });
    
    document.getElementById("teleport-a-message").addEventListener("change", (e) => {
      if (selectedTeleporter) selectedTeleporter.pointA.message = e.target.value;
    });
    
    // Point B
    document.getElementById("teleport-b-rendu-plafond").addEventListener("change", (e) => {
      if (selectedTeleporter) selectedTeleporter.pointB.hasCeiling = e.target.checked;
    });
    
    document.getElementById("teleport-b-texture-sol").addEventListener("change", (e) => {
      if (selectedTeleporter) selectedTeleporter.pointB.floorTexture = parseInt(e.target.value);
    });
    
    document.getElementById("teleport-b-texture-plafond").addEventListener("change", (e) => {
      if (selectedTeleporter) selectedTeleporter.pointB.ceilingTexture = parseInt(e.target.value);
    });
    
    document.getElementById("teleport-b-hauteur-plafond").addEventListener("change", (e) => {
      if (selectedTeleporter) selectedTeleporter.pointB.ceilingHeight = parseInt(e.target.value);
    });
    
    document.getElementById("teleport-b-message").addEventListener("change", (e) => {
      if (selectedTeleporter) selectedTeleporter.pointB.message = e.target.value;
    });
    
    // Initialiser la gestion des onglets
    setupTeleportTabs();
  }

  // Fonction pour mettre à jour l'affichage des propriétés
  function updateTeleportPropertiesDisplay() {
    if (!selectedTeleporter) return;
    
    // Propriétés communes
    document.getElementById("teleport-rotation").value = selectedTeleporter.direction;
    
    // Propriétés du point A
    document.getElementById("teleport-a-rendu-plafond").checked = selectedTeleporter.pointA.hasCeiling;
    document.getElementById("teleport-a-texture-sol").value = selectedTeleporter.pointA.floorTexture;
    document.getElementById("teleport-a-texture-plafond").value = selectedTeleporter.pointA.ceilingTexture;
    document.getElementById("teleport-a-hauteur-plafond").value = selectedTeleporter.pointA.ceilingHeight;
    document.getElementById("teleport-a-message").value = selectedTeleporter.pointA.message;
    
    // Propriétés du point B
    document.getElementById("teleport-b-rendu-plafond").checked = selectedTeleporter.pointB.hasCeiling;
    document.getElementById("teleport-b-texture-sol").value = selectedTeleporter.pointB.floorTexture;
    document.getElementById("teleport-b-texture-plafond").value = selectedTeleporter.pointB.ceilingTexture;
    document.getElementById("teleport-b-hauteur-plafond").value = selectedTeleporter.pointB.ceilingHeight;
    document.getElementById("teleport-b-message").value = selectedTeleporter.pointB.message;
  }

  // Gestion des onglets des points A et B
  function setupTeleportTabs() {
    const tabA = document.getElementById("point-a-tab");
    const tabB = document.getElementById("point-b-tab");
    const contentA = document.getElementById("point-a-properties");
    const contentB = document.getElementById("point-b-properties");
    
    tabA.addEventListener("click", function() {
      tabA.classList.add("active");
      tabB.classList.remove("active");
      contentA.style.display = "block";
      contentB.style.display = "none";
    });
    
    tabB.addEventListener("click", function() {
      tabB.classList.add("active");
      tabA.classList.remove("active");
      contentB.style.display = "block";
      contentA.style.display = "none";
    });
  }

  var selectedTile = 0;
  var mapContainer = document.querySelector('.map');
  // création carte sprite
  var spriteMapContainer = document.querySelector('.sprite-map');
  var sprites = [];

  function copyToSpriteMap() {
    for (let i = 0; i < worldMap.length; i++) {
      for (let j = 0; j < worldMap[i].length; j++) {
        if (worldMap[i][j] !== 0) {
          worldSpriteMap[i][j] = 'x';
        }
      }
    }
    updateSpriteMap();
  }

  // Sauvegarder l'état actuel de la carte dans la collection
  function saveCurrentMap() {
    const mapId = parseInt(document.getElementById('map-id').value);
    
    // Créer un objet pour stocker l'état complet de la carte
    const mapData = {
      id: mapId,
      worldMap: JSON.parse(JSON.stringify(worldMap)), // Créer une copie profonde
      worldSpriteMap: JSON.parse(JSON.stringify(worldSpriteMap)),
      spriteProperties: JSON.parse(JSON.stringify(spriteProperties)),
      teleporters: JSON.parse(JSON.stringify(teleporters)),
      playerStart: {
        x: parseInt(document.getElementById('player-start-x').value),
        y: parseInt(document.getElementById('player-start-y').value),
        orientation: document.getElementById('player-orientation').value
      },
      environment: {
        ceilingRender: document.getElementById('ceiling-render').checked,
        ceilingHeight: parseInt(document.getElementById('ceiling-height').value),
        ceilingTexture: parseInt(document.getElementById('ceiling-texture').value),
        floorTexture: parseInt(document.getElementById('floor-texture').value)
      }
    };
    
    // Sauvegarder dans la collection
    mapCollection.maps[mapId] = mapData;
    mapCollection.currentMapId = mapId;
    
    // Sauvegarder la collection dans localStorage
    localStorage.setItem('oasisMapCollection', JSON.stringify(mapCollection));
    
    updateMapSelector();
    console.log(`Carte #${mapId} sauvegardée`);
  }

  // Charger une carte depuis la collection
  function loadMap(mapId) {
    // Sauvegarder d'abord la carte actuelle
    saveCurrentMap();
    
    // Vérifier si la carte existe
    if (!mapCollection.maps[mapId]) {
      console.log(`Carte #${mapId} non trouvée`);
      return;
    }
    
    const mapData = mapCollection.maps[mapId];
    
    // Restaurer les données de la carte
    worldMap = mapData.worldMap;
    worldSpriteMap = mapData.worldSpriteMap;
    spriteProperties = mapData.spriteProperties;
    teleporters = mapData.teleporters;
    
    // Mettre à jour les contrôles avec les valeurs chargées
    document.getElementById('map-id').value = mapData.id;
    document.getElementById('player-start-x').value = mapData.playerStart.x;
    document.getElementById('player-start-y').value = mapData.playerStart.y;
    document.getElementById('player-orientation').value = mapData.playerStart.orientation;
    
    document.getElementById('ceiling-render').checked = mapData.environment.ceilingRender;
    document.getElementById('ceiling-height').value = mapData.environment.ceilingHeight;
    document.getElementById('ceiling-texture').value = mapData.environment.ceilingTexture;
    document.getElementById('floor-texture').value = mapData.environment.floorTexture;
    
    // Réinitialiser la sélection de sprite
    selectedSpritePos = null;
    document.getElementById('selected-sprite-info').style.display = 'none';
    
    // Mettre à jour l'affichage
    updateMap();
    updateSpriteMap();
    updateTeleporterDisplay();
    
    mapCollection.currentMapId = mapId;
    console.log(`Carte #${mapId} chargée`);
  }

  // Créer une nouvelle carte avec un ID spécifique
// Créer une nouvelle carte avec un ID spécifique
// Créer une nouvelle carte avec un ID auto-incrémenté
function createNewMap() {
  // Sauvegarder d'abord la carte actuelle
  saveCurrentMap();
  
  // Trouver le plus grand ID de carte existant et l'incrémenter
  const mapIds = Object.keys(mapCollection.maps).map(id => parseInt(id));
  const newMapId = mapIds.length > 0 ? Math.max(...mapIds) + 1 : 1;
  
  // Initialiser une nouvelle carte vide
  worldMap = generateWorldMap(24, 24, 1, 0);
  worldSpriteMap = generateWorldMap(24, 24, 0, 0);
  spriteProperties = {};
  teleporters = [];
  
  // Mettre à jour les contrôles
  document.getElementById('map-id').value = newMapId;
  document.getElementById('player-start-x').value = 12;
  document.getElementById('player-start-y').value = 12;
  document.getElementById('player-orientation').value = 'nord';
  
  document.getElementById('ceiling-render').checked = false;
  document.getElementById('ceiling-height').value = 2;
  document.getElementById('ceiling-texture').value = 1;
  document.getElementById('floor-texture').value = 3;
  
  // Mettre à jour l'affichage
  updateMap();
  updateSpriteMap();
  
  // Sauvegarder la nouvelle carte
  mapCollection.currentMapId = newMapId;
  saveCurrentMap();
  
  // Mettre à jour le sélecteur
  updateMapSelector();
  
  console.log(`Nouvelle carte #${newMapId} créée`);
}

  // Supprimer une carte
  function deleteMap(mapId) {
    if (!mapCollection.maps[mapId]) {
      console.log(`Carte #${mapId} non trouvée`);
      return;
    }
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement la carte #${mapId}?`)) {
      return;
    }
    
    // Supprimer la carte
    delete mapCollection.maps[mapId];
    
    // Sauvegarder la collection mise à jour
    localStorage.setItem('oasisMapCollection', JSON.stringify(mapCollection));
    
    // Si la carte supprimée était la carte actuelle, charger une autre carte
    if (mapCollection.currentMapId === mapId) {
      // Trouver le premier ID de carte disponible
      const availableMapIds = Object.keys(mapCollection.maps);
      if (availableMapIds.length > 0) {
        loadMap(parseInt(availableMapIds[0]));
      } else {
        // Aucune carte disponible, en créer une nouvelle
        createNewMap(1);
      }
    }
    
    updateMapSelector();
    console.log(`Carte #${mapId} supprimée`);
  }

  // Mettre à jour le sélecteur de cartes
  function updateMapSelector() {
    const mapSelector = document.getElementById('map-selector');
    if (!mapSelector) return;
    
    // Vider le sélecteur
    mapSelector.innerHTML = '';
    
    // Ajouter les cartes disponibles
    const mapIds = Object.keys(mapCollection.maps).map(id => parseInt(id)).sort((a, b) => a - b);
    
    for (const mapId of mapIds) {
      const option = document.createElement('option');
      option.value = mapId;
      option.textContent = `Carte #${mapId}`;
      option.selected = mapId === mapCollection.currentMapId;
      mapSelector.appendChild(option);
    }
  }

  // Exporter toutes les cartes
  function exportAllMaps() {
    const mapIds = Object.keys(mapCollection.maps).map(id => parseInt(id)).sort((a, b) => a - b);
    
    if (mapIds.length === 0) {
      alert("Aucune carte à exporter");
      return;
    }
    
    // Sauvegarder d'abord la carte actuelle
    saveCurrentMap();
    
    // Créer un tableau pour stocker toutes les cartes au format du moteur
    const exportedMaps = [];
    
    for (const mapId of mapIds) {
      // Charger temporairement la carte pour l'exportation
      const mapData = mapCollection.maps[mapId];
      
      // Exporter la carte au format du moteur
      const mapObject = {
        mapID: mapData.id,
        map: mapData.worldMap,
        sprites: generateSpriteData(mapData.worldSpriteMap, mapData.spriteProperties),
        eventA: generateEventData(mapData.teleporters).eventA,
        eventB: generateEventData(mapData.teleporters).eventB,
        playerStart: {
          X: mapData.playerStart.x,
          Y: mapData.playerStart.y,
          Orientation: getOrientationInRadians(mapData.playerStart.orientation),
          ceilingRender: mapData.environment.ceilingRender,
          ceilingHeight: mapData.environment.ceilingHeight,
          ceilingTexture: mapData.environment.ceilingTexture,
          floorTexture: mapData.environment.floorTexture
        }
      };
      
      exportedMaps.push(mapObject);
    }
    
    // Formater l'exportation
    let formattedExport = "[\n";
    
    exportedMaps.forEach((mapObject, index) => {
      formattedExport += "  {\n";
      formattedExport += `    mapID: ${mapObject.mapID},\n`;
      formattedExport += "    map: " + JSON.stringify(mapObject.map).replace(/"/g, '') + ",\n";
      formattedExport += "    sprites: " + JSON.stringify(mapObject.sprites).replace(/\["/g, '["').replace(/"\]/g, '"]') + ",\n";
      formattedExport += "    eventA: " + JSON.stringify(mapObject.eventA) + ",\n";
      formattedExport += "    eventB: " + JSON.stringify(mapObject.eventB) + ",\n";
      formattedExport += "    playerStart: {\n";
      formattedExport += `      X: ${mapObject.playerStart.X},\n`;
      formattedExport += `      Y: ${mapObject.playerStart.Y},\n`;
      formattedExport += `      Orientation: ${mapObject.playerStart.Orientation},\n`;
      formattedExport += `      ceilingRender: ${mapObject.playerStart.ceilingRender},\n`;
      formattedExport += `      ceilingHeight: ${mapObject.playerStart.ceilingHeight},\n`;
      formattedExport += `      ceilingTexture: ${mapObject.playerStart.ceilingTexture},\n`;
      formattedExport += `      floorTexture: ${mapObject.playerStart.floorTexture}\n`;
      formattedExport += "    }\n";
      formattedExport += "  }";
      
      // Ajouter une virgule si ce n'est pas le dernier élément
      if (index < exportedMaps.length - 1) {
        formattedExport += ",\n";
      } else {
        formattedExport += "\n";
      }
    });
    
    formattedExport += "]";
    
    document.getElementById('exportResult').value = formattedExport;
    console.log(`${exportedMaps.length} cartes exportées`);
  }

  // Fonction utilitaire pour générer les données de sprites
  function generateSpriteData(worldSpriteMap, spriteProps) {
    const spriteData = [];
    
    // Code existant pour générer les données de sprites adapté à la structure de mapData
    for (let y = 0; y < worldSpriteMap.length; y++) {
      for (let x = 0; x < worldSpriteMap[y].length; x++) {
        const spriteType = worldSpriteMap[y][x];
        
        // Cas spécial pour les portes sur murs
        if (spriteType === 'DOOR-x') {
          const propKey = `${x},${y}`;
          const props = spriteProps[propKey] || { type: 'DOOR', texture: 4 };
          
          // Format: [ID, X, Y, Type, Texture]
          let spriteEntry = [spriteData.length + 1, x, y, 'DOOR', parseInt(props.texture) || 4];
          
          spriteData.push(spriteEntry);
        }
        // Cas normal pour les autres sprites
        else if (spriteType !== 0 && spriteType !== 'x') {
          const propKey = `${x},${y}`;
          const props = spriteProps[propKey] || { type: spriteType, texture: spriteType };
          
          // Format de base: [ID, X, Y, Type, Texture]
          let spriteEntry = [spriteData.length + 1, x, y, spriteType, parseInt(props.texture) || spriteType];
          
          // Ajouter les propriétés spécifiques au type
          if (spriteType === 'A') {
            // Pour les ennemis: ajouter visage, nom, dialogs vides, obj vides, HP, DMG
            spriteEntry.push(null, props.name || `Enemy ${x},${y}`, [], [], props.hp || 2, props.damage || 1);
          } else if (spriteType === 0 || spriteType === 2) {
            // Pour les PNJ: ajouter visage, nom, dialogues
            const dialogs = props.dialogs || [];
            const formattedDialogs = dialogs.map(d => [d.face, d.name, d.text]);
            spriteEntry.push(props.face || "facePlayer", props.name || `NPC ${x},${y}`, formattedDialogs);
          } else if (spriteType === 3) {
            // Pour les marchands: ajouter visage, nom, dialogues, objets vendus
            const dialogs = props.dialogs || [];
            const formattedDialogs = dialogs.map(d => [d.face, d.name, d.text]);
            spriteEntry.push(props.face || "faceMerchant", props.name || `Merchant ${x},${y}`, formattedDialogs, props.items || []);
          }
          
          spriteData.push(spriteEntry);
        }
      }
    }
    
    return spriteData;
  }

  // Fonction utilitaire pour générer les données d'événements
  function generateEventData(teleporterData) {
    // Format pour compatibilité avec le moteur
    const mapEventA = teleporterData.map(t => {
      const rotationValue = getRotationValue(t.direction);
      return [
        parseInt(t.pointA.x), parseInt(t.pointA.y), 
        rotationValue, t.pointA.hasCeiling, 
        t.pointA.ceilingTexture || 1,
        t.pointA.ceilingHeight || 1,  
        t.pointA.floorTexture || 1,
        t.pointA.message || "Moving out..."
      ];
    });
    
    const mapEventB = teleporterData.map(t => {
      const rotationValue = getRotationValue(t.direction);
      return [
        parseInt(t.pointB.x), parseInt(t.pointB.y),
        rotationValue, t.pointB.hasCeiling,
        t.pointB.ceilingTexture || 1,
        t.pointB.ceilingHeight || 1,
        t.pointB.floorTexture || 1,
        t.pointB.message || "Moving in..."
      ];
    });
    
    return { eventA: mapEventA, eventB: mapEventB };
  }

  // Crée la carte principale
  function createMap() {
    for (var i = 0; i < worldMap.length; i++) {
      for (var j = 0; j < worldMap[i].length; j++) {
        var tile = document.createElement('div');
        tile.classList.add('tile');
        tile.setAttribute('data-x', j);
        tile.setAttribute('data-y', i);
        tile.addEventListener('click', function() {
          var x = parseInt(this.getAttribute('data-x'));
          var y = parseInt(this.getAttribute('data-y'));
          
          // Si en mode placement de téléporteur
          if (placementMode && selectedTeleporter) {
            handleMapClick(x, y);
            return;
          }
          
          // Code existant pour le placement de tuiles
          if (selectedTile !== -1) {
            setTile(x, y, selectedTile);
            updateCoordinates(x, y);
          }
        });
        mapContainer.appendChild(tile);
      }
    }
  }
  
  // Crée la deuxième carte pour les sprites
  function createSpriteMap() {
    for (var i = 0; i < worldMap.length; i++) {
      for (var j = 0; j < worldMap[i].length; j++) {
        var tile = document.createElement('div');
        tile.classList.add('tile');
        tile.setAttribute('data-x', j);
        tile.setAttribute('data-y', i);
        tile.addEventListener('click', function() {
          var x = parseInt(this.getAttribute('data-x'));
          var y = parseInt(this.getAttribute('data-y'));
          
          // Mode sélection de sprite
          if (spriteSelectionMode) {
            // On peut sélectionner une porte sur un mur aussi
            if (worldSpriteMap[y][x] !== 0 && (worldSpriteMap[y][x] !== 'x' || worldSpriteMap[y][x] === 'DOOR-x')) {
              // Sélectionner le sprite existant
              if (selectedSpritePos) {
                // Désélectionner l'ancien sprite
                const oldTile = document.querySelector(`.sprite-map .tile[data-x="${selectedSpritePos.x}"][data-y="${selectedSpritePos.y}"]`);
                if (oldTile) {
                  oldTile.classList.remove('selected-sprite');
                }
              }
              
              selectedSpritePos = { x, y };
              this.classList.add('selected-sprite');
              
              // Si c'est une porte sur un mur, utiliser la clé de propriété adaptée
              if (worldSpriteMap[y][x] === 'DOOR-x') {
                showSpriteDetails(x, y, 'DOOR');
              } else {
                showSpriteDetails(x, y);
              }
              updateCoordinates(x, y);
            }
          } 
          // Mode placement de sprite
          else if (selectedTile !== -1) {
            // Cas spécial pour placer une porte sur un mur
            if (selectedTile === 'DOOR' && worldSpriteMap[y][x] === 'x') {
              setTile(x, y, selectedTile);
              updateCoordinates(x, y);
              
              const propKey = `${x},${y}`;
              if (!spriteProperties[propKey]) {
                spriteProperties[propKey] = {
                  type: 'DOOR',
                  texture: document.getElementById('sprite-texture-select').value,
                  name: `Porte ${x},${y}`
                };
              }
              
              // Sélectionner cette porte
              selectedSpritePos = { x, y };
              showSpriteDetails(x, y, 'DOOR');
              updateSpriteMap();
            }
            // Placement normal pour les autres types
            else if (worldSpriteMap[y][x] !== 'x') {
              // Placer un sprite
              setTile(x, y, selectedTile);
              updateCoordinates(x, y);
              
              // Si on place un nouveau sprite, pré-initialiser sa texture
              if (worldSpriteMap[y][x] !== 0 && worldSpriteMap[y][x] !== 'x') {
                const spriteTexture = document.getElementById('sprite-texture-select').value;
                const propKey = `${x},${y}`;
                
                if (!spriteProperties[propKey]) {
                  spriteProperties[propKey] = {
                    type: worldSpriteMap[y][x],
                    texture: spriteTexture,
                    name: `Sprite ${x},${y}`
                  };
                  
                  // Initialiser les propriétés spécifiques selon le type
                  if (worldSpriteMap[y][x] === 'A') {
                    spriteProperties[propKey].hp = 2;
                    spriteProperties[propKey].damage = 1;
                  } else if (worldSpriteMap[y][x] === 0 || worldSpriteMap[y][x] === 2) {
                    spriteProperties[propKey].dialogs = [];
                  } else if (worldSpriteMap[y][x] === 3) {
                    spriteProperties[propKey].items = [];
                  }
                  
                  // Sélectionner automatiquement ce sprite
                  selectedSpritePos = { x, y };
                  showSpriteDetails(x, y);
                  updateSpriteMap();
                }
              }
            }
          }
        });
        spriteMapContainer.appendChild(tile);
      }
    }
  }

  // Met à jour l'affichage de la carte principale avec les valeurs de worldMap
  function updateMap() {
    var tiles = mapContainer.querySelectorAll('.tile');
    for (var i = 0; i < tiles.length; i++) {
      var x = parseInt(tiles[i].getAttribute('data-x'));
      var y = parseInt(tiles[i].getAttribute('data-y'));
      var tileValue = worldMap[y][x];
      tiles[i].innerText = tileValue;
      tiles[i].style.backgroundColor = getTileColor(tileValue);
    }
    // Mettre à jour également l'affichage des téléporteurs
    updateTeleporterDisplay();
  }

  // Obtient la couleur de fond en fonction de la valeur de la tuile
  function getTileColor(tileValue) {
    switch (tileValue) {
      case 0:
        return '#fff'; // white
      case 1:
        return '#aaa'; // light gray (mur de pierre)
      case 2:
        return '#888'; // gray (mur orné)
      case 3:
        return '#a52a2a'; // brown (roche)
      case 4:
        return '#ff9900'; // orange (porte de temple)
      case 5:
        return '#006600'; // green (forêt)
      case 6:
        return '#cc6633'; // brown red (maison)
      case 7:
        return '#99ccff'; // light blue (fenêtre)
      case 8:
        return '#663300'; // dark brown (porte maison)
      case 9:
        return '#777'; // dark gray (porte prison)
      default:
        return '#fff';
    }
  }

  // Définit la valeur d'une tuile dans la carte appropriée
// Définit la valeur d'une tuile dans la carte appropriée
function setTile(x, y, value) {
  if (isMapSelected) {
    worldMap[y][x] = value;
    updateMap();
  } else {
    // Cas spécial: effacer un sprite
    if (value === 'erase') {
      // Si c'est une case avec un sprite (mais pas un mur)
      if (worldSpriteMap[y][x] !== 0 && worldSpriteMap[y][x] !== 'x') {
        // Supprimer les propriétés du sprite si elles existent
        const propKey = `${x},${y}`;
        if (spriteProperties[propKey]) {
          delete spriteProperties[propKey];
        }
        // Effacer le sprite (remplacer par 0)
        worldSpriteMap[y][x] = 0;
        
        // Si un sprite était sélectionné à cette position, le désélectionner
        if (selectedSpritePos && selectedSpritePos.x === x && selectedSpritePos.y === y) {
          selectedSpritePos = null;
          document.getElementById('selected-sprite-info').style.display = 'none';
        }
      }
      updateSpriteMap();
      return;
    }
    
    // Cas spécial: placer une porte (DOOR) sur un mur existant
    if (value === 'DOOR' && worldSpriteMap[y][x] === 'x') {
      // Marquer comme étant une porte sur un mur, sans enlever le mur
      worldSpriteMap[y][x] = 'DOOR-x';
      
      // Ajouter aux propriétés du sprite
      const propKey = `${x},${y}`;
      if (!spriteProperties[propKey]) {
        spriteProperties[propKey] = {
          type: 'DOOR',
          texture: document.getElementById('sprite-texture-select').value,
          name: `Porte ${x},${y}`
        };
      }
    }
    // Si ce n'est pas une case occupée par un mur, ou si c'est déjà une porte-mur
    else if (worldSpriteMap[y][x] !== 'x' || worldSpriteMap[y][x] === 'DOOR-x') {
      worldSpriteMap[y][x] = value;
    }
    updateSpriteMap();
  }
}
  
  // Sélectionne le type de tuile à placer
  function selectTileType(tileType) {
    selectedTile = tileType;
  }

  // Exporte la carte complète au format du moteur
  function exportMapData() {
    // Sauvegarder d'abord la carte actuelle
    saveCurrentMap();
    
    // Exporter uniquement la carte actuelle
    const mapId = mapCollection.currentMapId;
    const mapData = mapCollection.maps[mapId];
    
    if (!mapData) {
      console.error(`Carte #${mapId} non trouvée`);
      return;
    }
    
    // Créer l'objet de carte complet
    const mapObject = {
      mapID: mapId,
      map: mapData.worldMap,
      sprites: generateSpriteData(mapData.worldSpriteMap, mapData.spriteProperties),
      eventA: generateEventData(mapData.teleporters).eventA,
      eventB: generateEventData(mapData.teleporters).eventB,
      playerStart: {
        X: mapData.playerStart.x,
        Y: mapData.playerStart.y,
        Orientation: getOrientationInRadians(mapData.playerStart.orientation),
        ceilingRender: mapData.environment.ceilingRender,
        ceilingHeight: mapData.environment.ceilingHeight,
        ceilingTexture: mapData.environment.ceilingTexture,
        floorTexture: mapData.environment.floorTexture
      }
    };
    
    // Format spécial pour l'export: sans les guillemets des noms de propriétés
    let formattedExport = "[\n  {\n";
    formattedExport += `    mapID: ${mapObject.mapID},\n`;
    formattedExport += "    map: " + JSON.stringify(mapObject.map).replace(/"/g, '') + ",\n";
    formattedExport += "    sprites: " + JSON.stringify(mapObject.sprites).replace(/\["/g, '["').replace(/"\]/g, '"]') + ",\n";
    formattedExport += "    eventA: " + JSON.stringify(mapObject.eventA) + ",\n";
    formattedExport += "    eventB: " + JSON.stringify(mapObject.eventB) + ",\n";
    formattedExport += "    playerStart: {\n";
    formattedExport += `      X: ${mapObject.playerStart.X},\n`;
    formattedExport += `      Y: ${mapObject.playerStart.Y},\n`;
    formattedExport += `      Orientation: ${mapObject.playerStart.Orientation},\n`;
    formattedExport += `      ceilingRender: ${mapObject.playerStart.ceilingRender},\n`;
    formattedExport += `      ceilingHeight: ${mapObject.playerStart.ceilingHeight},\n`;
    formattedExport += `      ceilingTexture: ${mapObject.playerStart.ceilingTexture},\n`;
    formattedExport += `      floorTexture: ${mapObject.playerStart.floorTexture}\n`;
    formattedExport += "    }\n";
    formattedExport += "  }\n]";
    
    document.getElementById('exportResult').value = formattedExport;
  }

  // Génère une carte vide avec bordures
  function generateWorldMap(rows, cols, borderValue, innerValue) {
    var map = [];
    for (var i = 0; i < rows; i++) {
      var row = [];
      for (var j = 0; j < cols; j++) {
        if (i === 0 || i === rows - 1 || j === 0 || j === cols - 1) {
          row.push(borderValue);
        } else {
          row.push(innerValue);
        }
      }
      map.push(row);
    }
    return map;
  }

  // Réinitialise la carte
  function resetMap() {
    worldMap = generateWorldMap(24, 24, 1, 0);
    worldSpriteMap = generateWorldMap(24, 24, 0, 0);
    updateMap();
    updateSpriteMap();
  }

  // Met à jour l'affichage de la carte de sprites
  function updateSpriteMap() {
    for (let i = 0; i < worldSpriteMap.length; i++) {
      for (let j = 0; j < worldSpriteMap[i].length; j++) {
        let tile = document.querySelector(`.sprite-map .tile[data-x="${j}"][data-y="${i}"]`);
        
        // Supprimer la classe de sélection
        tile.classList.remove('selected-sprite');
        
        // Si ce sprite est actuellement sélectionné, ajouter la classe de sélection
        if (selectedSpritePos && selectedSpritePos.x === j && selectedSpritePos.y === i) {
          tile.classList.add('selected-sprite');
        }
        
        if (worldSpriteMap[i][j] === 'x') {
          tile.style.backgroundColor = "#000";
          tile.style.color = "#fff";
          tile.textContent = "x";
          tile.style.border = "1px solid #ccc";
        }
        else if (worldSpriteMap[i][j] === 'DOOR-x') {
          // Cas spécial: porte sur un mur
          tile.style.backgroundColor = "#663300"; // Couleur de porte
          tile.style.color = "#fff";
          tile.textContent = "D";
          
          // Marquer visuellement qu'il s'agit d'une superposition
          tile.style.border = "2px dashed #FF9800";
          
          // Bordure verte si le sprite a des propriétés définies
          const propKey = `${j},${i}`;
          if (spriteProperties[propKey]) {
            tile.style.border = "2px solid #4CAF50";
          }
        }
        else {
          tile.style.backgroundColor = getTileColor(worldSpriteMap[i][j]);
          tile.textContent = worldSpriteMap[i][j];
          
          // Ajouter une bordure pour les sprites qui ont des propriétés définies
          const propKey = `${j},${i}`;
          if (spriteProperties[propKey]) {
            tile.style.border = "2px solid #4CAF50";
          } else {
            tile.style.border = "1px solid #ccc";
          }
        }
      }
    }
  }

  // Affiche les détails d'un sprite sélectionné
  function showSpriteDetails(x, y, forceType = null) {
    const propKey = `${x},${y}`;
    let props = spriteProperties[propKey];
    const actualType = forceType || worldSpriteMap[y][x];
    
    // Si le sprite n'a pas de propriétés, créer des valeurs par défaut
    if (!props) {
      const selectedTexture = document.getElementById('sprite-texture-select').value;
      
      spriteProperties[propKey] = {
        type: actualType,
        texture: selectedTexture,
        name: actualType === 'DOOR' ? `Porte ${x},${y}` : `Sprite ${x},${y}`
      };
      
      props = spriteProperties[propKey];
      
      if (actualType === 'A') {
        props.hp = 2;
        props.damage = 1;
      } else if (actualType === 0 || actualType === 2) {
        props.dialogs = [];
      } else if (actualType === 3) {
        props.items = [];
      }
    }
    
    // Mettre à jour l'affichage des infos
    const spriteInfo = document.getElementById('sprite-details');
    const selectedSpriteInfo = document.getElementById('selected-sprite-info');
    
    let infoHTML = `
      <p><strong>Position:</strong> X=${x}, Y=${y}</p>
      <p><strong>Type:</strong> ${actualType}${worldSpriteMap[y][x] === 'DOOR-x' ? ' (sur mur)' : ''}</p>
      <p><strong>Nom:</strong> ${props.name || 'Sans nom'}</p>
      <p><strong>Texture:</strong> ${props.texture || 'Non définie'}</p>
    `;
    
    // Ajouter des infos spécifiques selon le type
    if (actualType === 'A') {
      infoHTML += `
        <p><strong>Points de vie:</strong> ${props.hp || 2}</p>
        <p><strong>Dégâts:</strong> ${props.damage || 1}</p>
      `;
    } else if (actualType === 0 || actualType === 2) {
      const dialogs = props.dialogs || [];
      infoHTML += `<p><strong>Dialogues:</strong> ${dialogs.length} dialogue(s)</p>`;
    } else if (actualType === 3) {
      const items = props.items || [];
      infoHTML += `<p><strong>Objets vendus:</strong> ${items.length} objet(s)</p>`;
    }
    
    infoHTML += `<button onclick="openSpritePropertiesModal(${x}, ${y}, '${forceType || ''}')" style="margin-top: 10px; width: 100%;">Éditer propriétés</button>`;
    
    spriteInfo.innerHTML = infoHTML;
    selectedSpriteInfo.style.display = 'block';
  }
  
  // Ouvre la fenêtre modale des propriétés du sprite
  function openSpritePropertiesModal(x, y, forceType = '') {
    const propKey = `${x},${y}`;
    // Utiliser le type forcé si fourni (pour les portes sur murs), sinon utiliser le type de la carte
    const spriteType = forceType || worldSpriteMap[y][x];
    
    // Initialiser les valeurs dans le formulaire
    const props = spriteProperties[propKey] || {
      type: spriteType,
      texture: document.getElementById('sprite-texture-select').value,
      name: spriteType === 'DOOR' ? `Porte ${x},${y}` : `Sprite ${x},${y}`
    };
    
    // Remplir les champs communs
    document.getElementById('sprite-name').value = props.name || '';
    
    // Afficher les sections pertinentes selon le type de sprite
    document.getElementById('enemy-props').style.display = spriteType === 'A' ? 'block' : 'none';
    document.getElementById('npc-props').style.display = (spriteType === 0 || spriteType === 2) ? 'block' : 'none';
    document.getElementById('shop-props').style.display = spriteType === 3 ? 'block' : 'none';
    
    // Remplir les champs spécifiques
    if (spriteType === 'A') {
      document.getElementById('enemy-hp').value = props.hp || 2;
      document.getElementById('enemy-damage').value = props.damage || 1;
    } else if (spriteType === 0 || spriteType === 2) {
      const dialogContainer = document.getElementById('dialog-container');
      dialogContainer.innerHTML = '';
      
      // Créer les entrées de dialogue
      const dialogs = props.dialogs || [];
      dialogs.forEach((dialog, index) => {
        addDialogEntry(dialogContainer, dialog, index);
      });
    } else if (spriteType === 3) {
      const itemsContainer = document.getElementById('shop-items-container');
      itemsContainer.innerHTML = '';
      
      // Créer les entrées d'objets
      const items = props.items || [];
      items.forEach((itemId, index) => {
        addShopItemEntry(itemsContainer, itemId, index);
      });
    }
    
    // Stocker les coordonnées du sprite en cours d'édition
    const modal = document.getElementById('sprite-properties-modal');
    modal.setAttribute('data-sprite-x', x);
    modal.setAttribute('data-sprite-y', y);
    if (forceType) {
      modal.setAttribute('data-force-type', forceType);
    } else {
      modal.removeAttribute('data-force-type');
    }
    
    // Afficher la fenêtre modale
    modal.style.display = 'flex';
  }
  
  // Ajoute une entrée de dialogue dans le conteneur
  function addDialogEntry(container, dialog = {}, index) {
    const entry = document.createElement('div');
    entry.className = 'dialog-entry';
    entry.innerHTML = `
      <button class="delete-btn" onclick="removeDialog(${index})">×</button>
      <div class="form-group">
        <label>Visage</label>
        <select class="dialog-face">
          <option value="facePlayer"${dialog.face === 'facePlayer' ? ' selected' : ''}>Joueur</option>
          <option value="faceGuard"${dialog.face === 'faceGuard' ? ' selected' : ''}>Garde</option>
          <option value="faceThief"${dialog.face === 'faceThief' ? ' selected' : ''}>Voleur</option>
          <option value="faceMerchant"${dialog.face === 'faceMerchant' ? ' selected' : ''}>Marchand"${dialog.face === 'faceMerchant' ? ' selected' : ''}>Marchand</option>
          </select>
      </div>
      <div class="form-group">
        <label>Nom du personnage</label>
        <input type="text" class="dialog-name" value="${dialog.name || ''}">
      </div>
      <div class="form-group">
        <label>Texte du dialogue</label>
        <textarea class="dialog-text" rows="3">${dialog.text || ''}</textarea>
      </div>
    `;
    container.appendChild(entry);
  }
  
  // Supprime une entrée de dialogue
  function removeDialog(index) {
    const container = document.getElementById('dialog-container');
    container.removeChild(container.children[index]);
  }
  
  // Ajoute une entrée d'objet dans la boutique
  function addShopItemEntry(container, itemId = 1, index) {
    const entry = document.createElement('div');
    entry.className = 'item-entry';
    entry.innerHTML = `
      <select class="shop-item">
        <option value="1"${itemId === 1 ? ' selected' : ''}>Épée courte</option>
        <option value="2"${itemId === 2 ? ' selected' : ''}>Cape</option>
        <option value="3"${itemId === 3 ? ' selected' : ''}>Épée magique</option>
        <option value="4"${itemId === 4 ? ' selected' : ''}>Robe</option>
        <option value="5"${itemId === 5 ? ' selected' : ''}>Bâton</option>
      </select>
      <button class="delete-btn" onclick="removeShopItem(${index})">×</button>
    `;
    container.appendChild(entry);
  }
  
  // Supprime une entrée d'objet
  function removeShopItem(index) {
    const container = document.getElementById('shop-items-container');
    container.removeChild(container.children[index]);
  }
  
  // Sauvegarde les propriétés du sprite
  function saveSpriteProperties() {
    const modal = document.getElementById('sprite-properties-modal');
    const x = parseInt(modal.getAttribute('data-sprite-x'));
    const y = parseInt(modal.getAttribute('data-sprite-y'));
    const forceType = modal.getAttribute('data-force-type') || null;
    const propKey = `${x},${y}`;
    const spriteType = forceType || worldSpriteMap[y][x];
    
    // Récupérer les valeurs communes
    const name = document.getElementById('sprite-name').value;
    
    // Créer l'objet de propriétés
    spriteProperties[propKey] = {
      type: spriteType,
      texture: document.getElementById('sprite-texture-select').value,
      name: name
    };
    
    // Récupérer les valeurs spécifiques au type
    if (spriteType === 'A') {
      spriteProperties[propKey].hp = parseInt(document.getElementById('enemy-hp').value);
      spriteProperties[propKey].damage = parseInt(document.getElementById('enemy-damage').value);
    } else if (spriteType === 0 || spriteType === 2) {
      // Récupérer les dialogues
      const dialogEntries = document.querySelectorAll('.dialog-entry');
      const dialogs = [];
      
      dialogEntries.forEach(entry => {
        dialogs.push({
          face: entry.querySelector('.dialog-face').value,
          name: entry.querySelector('.dialog-name').value,
          text: entry.querySelector('.dialog-text').value
        });
      });
      
      spriteProperties[propKey].dialogs = dialogs;
    } else if (spriteType === 3) {
      // Récupérer les objets
      const itemEntries = document.querySelectorAll('.item-entry');
      const items = [];
      
      itemEntries.forEach(entry => {
        items.push(parseInt(entry.querySelector('.shop-item').value));
      });
      
      spriteProperties[propKey].items = items;
    }
    
    // Fermer la fenêtre modale
    modal.style.display = 'none';
    
    // Mettre à jour l'affichage
    showSpriteDetails(x, y, forceType);
    updateSpriteMap();
  }

  // Initialiser la gestion des événements pour la fenêtre modale des propriétés de sprite
  function setupSpritePropertiesControls() {
    // Configuration des modes de placement/sélection
    const placementModeBtn = document.getElementById('sprite-placement-mode');
    const selectionModeBtn = document.getElementById('sprite-selection-mode');
    
    placementModeBtn.addEventListener('click', function() {
      spriteSelectionMode = false;
      placementModeBtn.classList.add('active');
      selectionModeBtn.classList.remove('active');
    });
    
    selectionModeBtn.addEventListener('click', function() {
      spriteSelectionMode = true;
      selectionModeBtn.classList.add('active');
      placementModeBtn.classList.remove('active');
    });
    
    // Ajouter un dialogue
    document.getElementById('add-dialog-btn').addEventListener('click', function() {
      const container = document.getElementById('dialog-container');
      addDialogEntry(container);
    });
    
    // Ajouter un objet à la boutique
    document.getElementById('add-shop-item-btn').addEventListener('click', function() {
      const container = document.getElementById('shop-items-container');
      addShopItemEntry(container);
    });
    
    // Sauvegarder les propriétés
    document.getElementById('save-sprite-props-btn').addEventListener('click', saveSpriteProperties);
    
    // Annuler
    document.getElementById('cancel-sprite-props-btn').addEventListener('click', function() {
      document.getElementById('sprite-properties-modal').style.display = 'none';
    });
    
    // Ouvrir la fenêtre modale
    document.getElementById('edit-sprite-props-btn').addEventListener('click', function() {
      if (selectedSpritePos) {
        openSpritePropertiesModal(selectedSpritePos.x, selectedSpritePos.y);
      } else {
        alert("Veuillez d'abord sélectionner un sprite sur la carte.");
      }
    });
  }

  // Initialisation
  function initMapCollection() {
    // Charger la collection depuis localStorage
    const savedCollection = localStorage.getItem('oasisMapCollection');
    if (savedCollection) {
      try {
        mapCollection = JSON.parse(savedCollection);
        console.log(`Collection de cartes chargée: ${Object.keys(mapCollection.maps).length} cartes trouvées`);
      } catch (e) {
        console.error("Erreur lors du chargement de la collection de cartes:", e);
        mapCollection = { maps: {}, currentMapId: 1 };
      }
    }
    
    // Si aucune carte n'existe, en créer une par défaut
    if (Object.keys(mapCollection.maps).length === 0) {
      saveCurrentMap();
      console.log("Carte initiale créée avec ID 1");
    } else {
      // Charger la dernière carte active
      loadMap(mapCollection.currentMapId);
    }
    
    updateMapSelector();
  }

  // Télécharger la collection de cartes
function downloadMaps() {
  // Sauvegarder d'abord la carte actuelle
  saveCurrentMap();
  
  // Créer un blob avec les données de la collection
  const mapData = JSON.stringify(mapCollection, null, 2);
  const blob = new Blob([mapData], { type: 'application/json' });
  
  // Créer un URL pour le blob
  const url = URL.createObjectURL(blob);
  
  // Créer un lien de téléchargement
  const a = document.createElement('a');
  a.href = url;
  a.download = 'oasis-maps.json';
  
  // Ajouter le lien au document et cliquer dessus
  document.body.appendChild(a);
  a.click();
  
  // Nettoyer
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 0);
  
  console.log('Collection de cartes téléchargée');
}

// Importer une collection de cartes
function importMaps() {
  // Déclencher le clic sur l'input file
  document.getElementById('import-file').click();
}

// Initialiser l'écouteur d'événements pour l'importation de fichiers
function setupImportListener() {
  document.getElementById('import-file').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const importedCollection = JSON.parse(e.target.result);
        
        // Vérifier si la structure est valide
        if (!importedCollection.maps || !importedCollection.currentMapId) {
          alert("Format de fichier invalide. Impossible d'importer la collection.");
          return;
        }
        
        // Demander confirmation avant d'écraser la collection actuelle
        if (Object.keys(mapCollection.maps).length > 0) {
          if (!confirm("Cette action remplacera votre collection actuelle. Continuer?")) {
            return;
          }
        }
        
        // Sauvegarder la nouvelle collection
        mapCollection = importedCollection;
        localStorage.setItem('oasisMapCollection', JSON.stringify(mapCollection));
        
        // Charger la carte actuelle
        loadMap(mapCollection.currentMapId);
        
        // Mettre à jour le sélecteur
        updateMapSelector();
        
        console.log(`Collection importée: ${Object.keys(mapCollection.maps).length} cartes.`);
      } catch (error) {
        console.error("Erreur lors de l'importation:", error);
        alert("Erreur lors de l'importation du fichier.");
      }
    };
    reader.readAsText(file);
    
    // Réinitialiser l'input file pour permettre de sélectionner le même fichier deux fois
    event.target.value = '';
  });
}

  // Initialisation
  createMap();
  createSpriteMap();
  updateSpriteMap();
  updateMap();
  setupTeleporterControls();
  setupSpritePropertiesControls();
  setupImportListener(); // Initialiser l'écouteur pour l'importation
  initMapCollection(); // Initialiser la collection de cartes
