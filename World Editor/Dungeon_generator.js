
// Configuration de base
let GRID_SIZE = 32;
const CELL_SIZE = 20;
const WALL = 1;
const FLOOR = 0;

// Présets de taille de carte
const SIZE_PRESETS = {
    small: { gridSize: 24 },
    medium: { gridSize: 32 },
    large: { gridSize: 48 },
    huge: { gridSize: 64 }
};

// Présets de taille de salles (indépendant de la taille de carte)
const ROOM_SIZE_PRESETS = {
    1: { name: "Très petite", min: 2, max: 4 },
    2: { name: "Petite", min: 3, max: 6 },
    3: { name: "Moyenne", min: 4, max: 8 },
    4: { name: "Grande", min: 6, max: 12 },
    5: { name: "Très grande", min: 8, max: 16 }
};

// Types de cellules pour l'affichage
const CELL_TYPES = {
    WALL: 0,
    MAIN_ROOM: 1,
    SECONDARY_ROOM: 2,
    CORRIDOR: 3,
    MAZE: 4,
    SECRET: 5,
    START: 6,
    END: 7,
    DEAD_END: 8
};

// Modes de génération avec leurs paramètres
const DUNGEON_MODES = {
    fortress: {
        name: "Forteresse",
        description: "Salles rectangulaires, corridors droits, architecture ordonnée",
        roomShape: "rectangular",
        corridorStyle: "straight",
        roomSizeVariance: 0.3,
        mazeComplexity: 0.2,
        symmetry: 0.7
    },
    cave: {
        name: "Caverne",
        description: "Formes organiques, passages sinueux, aspect naturel",
        roomShape: "organic",
        corridorStyle: "winding",
        roomSizeVariance: 0.8,
        mazeComplexity: 0.8,
        symmetry: 0.1
    },
    temple: {
        name: "Temple",
        description: "Symétrie, grandes salles centrales, architecture sacrée",
        roomShape: "rectangular",
        corridorStyle: "straight",
        roomSizeVariance: 0.5,
        mazeComplexity: 0.3,
        symmetry: 0.9
    },
    crypt: {
        name: "Crypte",
        description: "Petites salles interconnectées, nombreux culs-de-sac",
        roomShape: "rectangular",
        corridorStyle: "maze-like",
        roomSizeVariance: 0.2,
        mazeComplexity: 0.9,
        symmetry: 0.4
    },
    mixed: {
        name: "Mixte",
        description: "Combine différents styles architecturaux par zones",
        roomShape: "mixed",
        corridorStyle: "mixed",
        roomSizeVariance: 0.6,
        mazeComplexity: 0.5,
        symmetry: 0.5
    }
};

// Variables globales
let dungeon = [];
let cellTypes = [];
let rooms = [];
let corridors = [];
let startPos = null;
let endPos = null;
let deadEndsList = [];
let pathDistance = 0;
let alternativePaths = 0;

// Variables pour la génération en masse
let bulkDungeons = [];
let bulkGenerating = false;
let currentDungeonIndex = 0;

// Classes utilitaires
class Random {
    constructor(seed) {
        this.seed = seed || Date.now();
    }
    
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
    
    nextInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
    
    nextFloat(min, max) {
        return this.next() * (max - min) + min;
    }
    
    chance(probability) {
        return this.next() < probability;
    }
}

// Classe pour les salles
class Room {
    constructor(x, y, width, height, type = 'main') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type; // 'main', 'secondary', 'secret'
        this.centerX = Math.floor(x + width / 2);
        this.centerY = Math.floor(y + height / 2);
        this.connections = [];
        this.zone = null; // Pour le mode mixte
    }
    
    intersects(other, padding = 1) {
        return !(this.x + this.width + padding <= other.x || 
                other.x + other.width + padding <= this.x || 
                this.y + this.height + padding <= other.y || 
                other.y + other.height + padding <= this.y);
    }
    
    distanceTo(other) {
        return Math.abs(this.centerX - other.centerX) + Math.abs(this.centerY - other.centerY);
    }
}

// Classe pour gérer les zones (pour le mode mixte)
class Zone {
    constructor(x, y, width, height, mode) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.mode = mode;
        this.rooms = [];
    }
    
    contains(x, y) {
        return x >= this.x && x < this.x + this.width &&
               y >= this.y && y < this.y + this.height;
    }
}

// Initialise le donjon
function initializeDungeon() {
    dungeon = [];
    cellTypes = [];
    
    for (let y = 0; y < GRID_SIZE; y++) {
        dungeon[y] = [];
        cellTypes[y] = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            // Les bordures sont toujours des murs
            if (x === 0 || x === GRID_SIZE - 1 || y === 0 || y === GRID_SIZE - 1) {
                dungeon[y][x] = WALL;
                cellTypes[y][x] = CELL_TYPES.WALL;
            } else {
                dungeon[y][x] = WALL;
                cellTypes[y][x] = CELL_TYPES.WALL;
            }
        }
    }
}

// Génère les zones pour le mode mixte
function generateZones(rng) {
    const zones = [];
    const modes = ['fortress', 'cave', 'temple', 'crypt'];
    
    // Divise le donjon en 4 zones
    const halfSize = Math.floor(GRID_SIZE / 2);
    
    for (let i = 0; i < 4; i++) {
        const x = (i % 2) * halfSize;
        const y = Math.floor(i / 2) * halfSize;
        const mode = modes[rng.nextInt(0, modes.length - 1)];
        
        zones.push(new Zone(x, y, halfSize, halfSize, DUNGEON_MODES[mode]));
    }
    
    return zones;
}

// Génère une salle selon le mode
function generateRoom(x, y, width, height, mode, type = 'main') {
    const room = new Room(x, y, width, height, type);
    
    if (mode.roomShape === 'organic') {
        // Pour les cavernes, on pourrait modifier la forme
        // Pour l'instant, on garde rectangulaire mais on pourrait ajouter du bruit
    }
    
    return room;
}

// Place les salles principales
function placeMainRooms(rng, mode, density, zones = null) {
    const mainRooms = [];
    
    // Récupère la taille de salles choisie par l'utilisateur
    const roomSizePreset = ROOM_SIZE_PRESETS[parseInt(document.getElementById('roomSizePreset').value)];
    let minSize = roomSizePreset.min;
    let maxSize = roomSizePreset.max;
    
    // Ajuste légèrement selon le mode (mais garde la base choisie par l'utilisateur)
    switch (mode.name) {
        case 'Crypte':
            // Les cryptes ont des salles un peu plus petites
            minSize = Math.max(2, minSize - 1);
            maxSize = Math.max(3, maxSize - 2);
            break;
        case 'Temple':
            // Les temples ont des salles un peu plus grandes
            minSize = Math.min(minSize + 1, maxSize);
            maxSize = Math.min(maxSize + 2, GRID_SIZE - 4);
            break;
    }
    
    // S'assure que les salles ne sont pas trop grandes pour la carte
    maxSize = Math.min(maxSize, Math.floor(GRID_SIZE / 3));
    
    // Calcule le nombre de salles selon la densité et la taille de la carte
    const gridRatio = (GRID_SIZE * GRID_SIZE) / (32 * 32);
    const baseRoomCount = Math.floor((4 + Math.sqrt(gridRatio) * 3) * (density / 50));
    
    // Place les salles principales
    let attempts = 0;
    const maxAttempts = 1000 * gridRatio;
    
    while (mainRooms.length < baseRoomCount && attempts < maxAttempts) {
        attempts++;
        
        const width = rng.nextInt(minSize, maxSize);
        const height = rng.nextInt(minSize, maxSize);
        const x = rng.nextInt(2, GRID_SIZE - width - 2);
        const y = rng.nextInt(2, GRID_SIZE - height - 2);
        
        const newRoom = generateRoom(x, y, width, height, mode, 'main');
        
        // Vérifie les intersections avec un padding proportionnel
        const padding = GRID_SIZE <= 32 ? 2 : 3;
        let valid = true;
        for (let room of mainRooms) {
            if (newRoom.intersects(room, padding)) {
                valid = false;
                break;
            }
        }
        
        if (valid) {
            // Si mode mixte, assigne la zone
            if (zones) {
                for (let zone of zones) {
                    if (zone.contains(newRoom.centerX, newRoom.centerY)) {
                        newRoom.zone = zone;
                        zone.rooms.push(newRoom);
                        break;
                    }
                }
            }
            
            mainRooms.push(newRoom);
            carveRoom(newRoom);
        }
    }
    
    return mainRooms;
}

// Place les salles secondaires
function placeSecondaryRooms(rng, mode, mainRooms) {
    const secondaryRooms = [];
    const secondaryCount = Math.floor(mainRooms.length * 0.5);
    
    // Les salles secondaires sont toujours plus petites que les principales
    const roomSizePreset = ROOM_SIZE_PRESETS[parseInt(document.getElementById('roomSizePreset').value)];
    const minSize = Math.max(2, Math.floor(roomSizePreset.min * 0.75));
    const maxSize = Math.max(3, Math.floor(roomSizePreset.max * 0.5));
    
    let attempts = 0;
    const maxAttempts = 500 * (GRID_SIZE / 32);
    
    while (secondaryRooms.length < secondaryCount && attempts < maxAttempts) {
        attempts++;
        
        const width = rng.nextInt(minSize, maxSize);
        const height = rng.nextInt(minSize, maxSize);
        const x = rng.nextInt(2, GRID_SIZE - width - 2);
        const y = rng.nextInt(2, GRID_SIZE - height - 2);
        
        const newRoom = generateRoom(x, y, width, height, mode, 'secondary');
        
        // Vérifie les intersections
        let valid = true;
        for (let room of [...mainRooms, ...secondaryRooms]) {
            if (newRoom.intersects(room, 1)) {
                valid = false;
                break;
            }
        }
        
        if (valid) {
            secondaryRooms.push(newRoom);
            carveRoom(newRoom);
        }
    }
    
    return secondaryRooms;
}

// Creuse une salle dans le donjon
function carveRoom(room) {
    for (let y = room.y; y < room.y + room.height; y++) {
        for (let x = room.x; x < room.x + room.width; x++) {
            if (x > 0 && x < GRID_SIZE - 1 && y > 0 && y < GRID_SIZE - 1) {
                dungeon[y][x] = FLOOR;
                cellTypes[y][x] = room.type === 'main' ? CELL_TYPES.MAIN_ROOM : 
                                 room.type === 'secondary' ? CELL_TYPES.SECONDARY_ROOM :
                                 CELL_TYPES.SECRET;  
            }
        }
    }
}

// Connecte les salles avec des corridors
function connectRooms(rooms, rng, mode) {
    if (rooms.length < 2) return;
    
    // Crée un arbre couvrant minimum avec l'algorithme de Kruskal
    const edges = [];
    
    // Génère toutes les arêtes possibles
    for (let i = 0; i < rooms.length; i++) {
        for (let j = i + 1; j < rooms.length; j++) {
            edges.push({
                from: i,
                to: j,
                distance: rooms[i].distanceTo(rooms[j])
            });
        }
    }
    
    // Trie par distance
    edges.sort((a, b) => a.distance - b.distance);
    
    // Union-Find pour Kruskal
    const parent = Array(rooms.length).fill().map((_, i) => i);
    
    function find(x) {
        if (parent[x] !== x) parent[x] = find(parent[x]);
        return parent[x];
    }
    
    function union(x, y) {
        parent[find(x)] = find(y);
    }
    
    // Connecte les salles
    const connections = [];
    for (let edge of edges) {
        if (find(edge.from) !== find(edge.to)) {
            union(edge.from, edge.to);
            connections.push(edge);
            
            // Creuse le corridor
            const room1 = rooms[edge.from];
            const room2 = rooms[edge.to];
            
            if (mode.corridorStyle === 'straight') {
                carveCorridorStraight(room1.centerX, room1.centerY, room2.centerX, room2.centerY, rng);
            } else if (mode.corridorStyle === 'winding') {
                carveCorridorWinding(room1.centerX, room1.centerY, room2.centerX, room2.centerY, rng);
            } else {
                // Par défaut, corridor en L
                carveCorridorL(room1.centerX, room1.centerY, room2.centerX, room2.centerY, rng);
            }
            
            room1.connections.push(edge.to);
            room2.connections.push(edge.from);
        }
    }
    
    // Ajoute des connexions supplémentaires pour créer des boucles
    const extraConnections = Math.floor(rooms.length * 0.3);
    for (let i = 0; i < extraConnections && edges.length > 0; i++) {
        const edge = edges[rng.nextInt(0, edges.length - 1)];
        const room1 = rooms[edge.from];
        const room2 = rooms[edge.to];
        
        if (!room1.connections.includes(edge.to)) {
            carveCorridorL(room1.centerX, room1.centerY, room2.centerX, room2.centerY, rng);
            room1.connections.push(edge.to);
            room2.connections.push(edge.from);
        }
    }
}

// Creuse un corridor en L
function carveCorridorL(x1, y1, x2, y2, rng) {
    if (rng.next() < 0.5) {
        // Horizontal puis vertical
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
            if (x > 0 && x < GRID_SIZE - 1 && y1 > 0 && y1 < GRID_SIZE - 1) {
                dungeon[y1][x] = FLOOR;
                if (cellTypes[y1][x] === CELL_TYPES.WALL) {
                    cellTypes[y1][x] = CELL_TYPES.CORRIDOR;
                }
            }
        }
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
            if (x2 > 0 && x2 < GRID_SIZE - 1 && y > 0 && y < GRID_SIZE - 1) {
                dungeon[y][x2] = FLOOR;
                if (cellTypes[y][x2] === CELL_TYPES.WALL) {
                    cellTypes[y][x2] = CELL_TYPES.CORRIDOR;
                }
            }
        }
    } else {
        // Vertical puis horizontal
        for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
            if (x1 > 0 && x1 < GRID_SIZE - 1 && y > 0 && y < GRID_SIZE - 1) {
                dungeon[y][x1] = FLOOR;
                if (cellTypes[y][x1] === CELL_TYPES.WALL) {
                    cellTypes[y][x1] = CELL_TYPES.CORRIDOR;
                }
            }
        }
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
            if (x > 0 && x < GRID_SIZE - 1 && y2 > 0 && y2 < GRID_SIZE - 1) {
                dungeon[y2][x] = FLOOR;
                if (cellTypes[y2][x] === CELL_TYPES.WALL) {
                    cellTypes[y2][x] = CELL_TYPES.CORRIDOR;
                }
            }
        }
    }
}

// Creuse un corridor droit
function carveCorridorStraight(x1, y1, x2, y2, rng) {
    // Utilise l'algorithme de Bresenham pour une ligne droite
    let dx = Math.abs(x2 - x1);
    let dy = Math.abs(y2 - y1);
    let sx = x1 < x2 ? 1 : -1;
    let sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    
    while (true) {
        if (x1 > 0 && x1 < GRID_SIZE - 1 && y1 > 0 && y1 < GRID_SIZE - 1) {
            dungeon[y1][x1] = FLOOR;
            if (cellTypes[y1][x1] === CELL_TYPES.WALL) {
                cellTypes[y1][x1] = CELL_TYPES.CORRIDOR;
            }
        }
        
        if (x1 === x2 && y1 === y2) break;
        
        let e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }
    }
}

// Creuse un corridor sinueux
function carveCorridorWinding(x1, y1, x2, y2, rng) {
    // Pour l'instant, utilise le corridor en L avec plus de variations
    // TODO: Implémenter un vrai algorithme de corridor sinueux
    carveCorridorL(x1, y1, x2, y2, rng);
}

// Génère des labyrinthes dans les espaces vides
function generateMazes(rng, complexity) {
    // Trouve les régions vides pour les labyrinthes
    const regions = findEmptyRegions();
    
    for (let region of regions) {
        // Ne génère des labyrinthes que dans les régions assez grandes
        if (region.length > 10) {
            generateMazeInRegion(region, rng, complexity);
        }
    }
}

// Trouve les régions vides (espacées des salles)
function findEmptyRegions() {
    const regions = [];
    const visited = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false));
    
    // On cherche des cellules sur des coordonnées impaires pour le labyrinthe
    for (let y = 3; y < GRID_SIZE - 3; y += 2) {
        for (let x = 3; x < GRID_SIZE - 3; x += 2) {
            if (dungeon[y][x] === WALL && !visited[y][x] && canPlaceMaze(x, y)) {
                const region = floodFillRegion(x, y, visited);
                if (region.length > 5) {
                    regions.push(region);
                }
            }
        }
    }
    
    return regions;
}

// Vérifie si on peut placer un labyrinthe à cette position
function canPlaceMaze(x, y) {
    // Vérifie qu'on est à au moins 2 cases d'une salle (pour l'espacement)
    for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
                const cellType = cellTypes[ny][nx];
                if (cellType === CELL_TYPES.MAIN_ROOM || 
                    cellType === CELL_TYPES.SECONDARY_ROOM ||
                    cellType === CELL_TYPES.SECRET) {
                    return false;
                }
            }
        }
    }
    return true;
}

// Flood fill pour trouver une région
function floodFillRegion(startX, startY, visited) {
    const region = [];
    const queue = [{x: startX, y: startY}];
    visited[startY][startX] = true;
    
    while (queue.length > 0) {
        const {x, y} = queue.shift();
        
        // Vérifie que cette cellule peut faire partie du labyrinthe
        if (canPlaceMaze(x, y)) {
            region.push({x, y});
            
            // Explore les voisins (distance de 2 pour le pattern du labyrinthe)
            const directions = [{x: 0, y: -2}, {x: 2, y: 0}, {x: 0, y: 2}, {x: -2, y: 0}];
            for (let dir of directions) {
                const nx = x + dir.x;
                const ny = y + dir.y;
                
                if (nx > 2 && nx < GRID_SIZE - 2 && ny > 2 && ny < GRID_SIZE - 2 &&
                    !visited[ny][nx] && dungeon[ny][nx] === WALL) {
                    visited[ny][nx] = true;
                    queue.push({x: nx, y: ny});
                }
            }
        }
    }
    
    return region;
}

// Génère un labyrinthe dans une région
function generateMazeInRegion(region, rng, complexity) {
    // Filtre pour ne garder que les cellules sur des coordonnées impaires
    const filteredRegion = region.filter(cell => cell.x % 2 === 1 && cell.y % 2 === 1);
    
    if (filteredRegion.length < 3) return;
    
    // Crée un set pour accès rapide
    const regionSet = new Set(filteredRegion.map(c => `${c.x},${c.y}`));
    
    // Génère le labyrinthe avec Recursive Backtracking
    const stack = [];
    const visited = new Set();
    
    // Choisit un point de départ aléatoire
    const start = filteredRegion[rng.nextInt(0, filteredRegion.length - 1)];
    visited.add(`${start.x},${start.y}`);
    stack.push(start);
    
    // Place le point de départ
    dungeon[start.y][start.x] = FLOOR;
    cellTypes[start.y][start.x] = CELL_TYPES.MAZE;
    
    // Définit les directions une fois pour toute la fonction
    const directions = [
        {dx: 0, dy: -2, wallX: 0, wallY: -1},
        {dx: 2, dy: 0, wallX: 1, wallY: 0},
        {dx: 0, dy: 2, wallX: 0, wallY: 1},
        {dx: -2, dy: 0, wallX: -1, wallY: 0}
    ];
    
    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        
        // Trouve les voisins non visités
        const neighbors = [];
        
        for (let dir of directions) {
            const nx = current.x + dir.dx;
            const ny = current.y + dir.dy;
            
            if (regionSet.has(`${nx},${ny}`) && !visited.has(`${nx},${ny}`)) {
                // Vérifie que le mur entre les deux cellules peut être creusé
                const wallX = current.x + dir.wallX;
                const wallY = current.y + dir.wallY;
                
                if (wallX > 0 && wallX < GRID_SIZE - 1 && wallY > 0 && wallY < GRID_SIZE - 1 &&
                    dungeon[wallY][wallX] === WALL) {
                    neighbors.push({x: nx, y: ny, wallX, wallY});
                }
            }
        }
        
        if (neighbors.length > 0) {
            // Choisit un voisin aléatoire
            const next = neighbors[rng.nextInt(0, neighbors.length - 1)];
            
            // Creuse le passage
            dungeon[next.wallY][next.wallX] = FLOOR;
            cellTypes[next.wallY][next.wallX] = CELL_TYPES.MAZE;
            
            dungeon[next.y][next.x] = FLOOR;
            cellTypes[next.y][next.x] = CELL_TYPES.MAZE;
            
            visited.add(`${next.x},${next.y}`);
            stack.push(next);
        } else {
            stack.pop();
        }
    }
    
    // Ajoute des boucles selon la complexité
    if (complexity < 1) {
        const loopsToAdd = Math.floor(visited.size * (1 - complexity) * 0.2);
        
        for (let i = 0; i < loopsToAdd; i++) {
            const cells = Array.from(visited).map(key => {
                const [x, y] = key.split(',').map(Number);
                return {x, y};
            });
            
            if (cells.length === 0) break;
            
            const cell = cells[rng.nextInt(0, cells.length - 1)];
            
            // Essaie de créer une boucle
            for (let dir of directions) {
                const nx = cell.x + dir.dx;
                const ny = cell.y + dir.dy;
                const wallX = cell.x + dir.wallX;
                const wallY = cell.y + dir.wallY;
                
                if (regionSet.has(`${nx},${ny}`) && visited.has(`${nx},${ny}`) &&
                    wallX > 0 && wallX < GRID_SIZE - 1 && wallY > 0 && wallY < GRID_SIZE - 1 &&
                    dungeon[wallY][wallX] === WALL) {
                    
                    // Crée la boucle
                    dungeon[wallY][wallX] = FLOOR;
                    cellTypes[wallY][wallX] = CELL_TYPES.MAZE;
                    break;
                }
            }
        }
    }
}

// Crée une grille pour le labyrinthe
function createMazeGrid(region) {
    // Trouve les limites de la région
    let minX = GRID_SIZE, maxX = 0, minY = GRID_SIZE, maxY = 0;
    for (let cell of region) {
        minX = Math.min(minX, cell.x);
        maxX = Math.max(maxX, cell.x);
        minY = Math.min(minY, cell.y);
        maxY = Math.max(maxY, cell.y);
    }
    
    // Crée un set pour accès rapide
    const regionSet = new Set(region.map(c => `${c.x},${c.y}`));
    
    // Crée la grille pour le labyrinthe (seulement les positions impaires)
    const mazeGrid = [];
    for (let y = minY; y <= maxY; y += 2) {
        for (let x = minX; x <= maxX; x += 2) {
            if (regionSet.has(`${x},${y}`)) {
                mazeGrid.push({x, y, visited: false, walls: {n: true, s: true, e: true, w: true}});
            }
        }
    }
    
    return mazeGrid;
}

// Génère le labyrinthe avec Recursive Backtracking
function generateMazeRecursive(mazeGrid, rng) {
    if (mazeGrid.length === 0) return;
    
    // Crée une map pour accès rapide
    const gridMap = new Map();
    for (let cell of mazeGrid) {
        gridMap.set(`${cell.x},${cell.y}`, cell);
    }
    
    // Commence avec une cellule aléatoire
    const stack = [];
    const start = mazeGrid[rng.nextInt(0, mazeGrid.length - 1)];
    start.visited = true;
    stack.push(start);
    
    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        
        // Trouve les voisins non visités
        const neighbors = [];
        const directions = [
            {dx: 0, dy: -2, wall: 'n', opposite: 's'},
            {dx: 2, dy: 0, wall: 'e', opposite: 'w'},
            {dx: 0, dy: 2, wall: 's', opposite: 'n'},
            {dx: -2, dy: 0, wall: 'w', opposite: 'e'}
        ];
        
        for (let dir of directions) {
            const nx = current.x + dir.dx;
            const ny = current.y + dir.dy;
            const neighbor = gridMap.get(`${nx},${ny}`);
            
            if (neighbor && !neighbor.visited) {
                neighbors.push({cell: neighbor, dir: dir});
            }
        }
        
        if (neighbors.length > 0) {
            // Choisit un voisin aléatoire
            const {cell: next, dir} = neighbors[rng.nextInt(0, neighbors.length - 1)];
            
            // Supprime le mur entre les cellules
            current.walls[dir.wall] = false;
            next.walls[dir.opposite] = false;
            
            next.visited = true;
            stack.push(next);
        } else {
            stack.pop();
        }
    }
}

// Réduit la complexité du labyrinthe
function reduceMazeComplexity(mazeGrid, complexity) {
    // Supprime aléatoirement des murs pour créer des boucles
    const wallsToRemove = Math.floor(mazeGrid.length * (1 - complexity) * 0.5);
    
    for (let i = 0; i < wallsToRemove; i++) {
        const cell = mazeGrid[Math.floor(Math.random() * mazeGrid.length)];
        const walls = Object.keys(cell.walls).filter(w => cell.walls[w]);
        
        if (walls.length > 0) {
            const wallToRemove = walls[Math.floor(Math.random() * walls.length)];
            cell.walls[wallToRemove] = false;
        }
    }
}

// Applique le labyrinthe au donjon
function applyMazeToDungeon(mazeGrid) {
    // Crée d'abord une map pour accès rapide
    const gridMap = new Map();
    for (let cell of mazeGrid) {
        gridMap.set(`${cell.x},${cell.y}`, cell);
    }
    
    for (let cell of mazeGrid) {
        // Place la cellule
        dungeon[cell.y][cell.x] = FLOOR;
        cellTypes[cell.y][cell.x] = CELL_TYPES.MAZE;
        
        // Place les passages entre les cellules
        if (!cell.walls.n && cell.y > 1) {
            dungeon[cell.y - 1][cell.x] = FLOOR;
            cellTypes[cell.y - 1][cell.x] = CELL_TYPES.MAZE;
        }
        if (!cell.walls.s && cell.y < GRID_SIZE - 2) {
            dungeon[cell.y + 1][cell.x] = FLOOR;
            cellTypes[cell.y + 1][cell.x] = CELL_TYPES.MAZE;
        }
        if (!cell.walls.e && cell.x < GRID_SIZE - 2) {
            dungeon[cell.y][cell.x + 1] = FLOOR;
            cellTypes[cell.y][cell.x + 1] = CELL_TYPES.MAZE;
        }
        if (!cell.walls.w && cell.x > 1) {
            dungeon[cell.y][cell.x - 1] = FLOOR;
            cellTypes[cell.y][cell.x - 1] = CELL_TYPES.MAZE;
        }
    }
}

// Trouve les culs-de-sac
function findDeadEnds() {
    const deadEnds = [];
    
    for (let y = 1; y < GRID_SIZE - 1; y++) {
        for (let x = 1; x < GRID_SIZE - 1; x++) {
            if (dungeon[y][x] === FLOOR) {
                let walls = 0;
                const directions = [{x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}];
                
                for (let dir of directions) {
                    if (dungeon[y + dir.y][x + dir.x] === WALL) {
                        walls++;
                    }
                }
                
                if (walls === 3) {
                    deadEnds.push({x, y});
                }
            }
        }
    }
    
    return deadEnds;
}

// Place le début et la fin
function placeStartAndEnd(rooms, rng) {
    if (rooms.length < 2) {
        // Fallback si pas assez de salles
        const floorCells = [];
        for (let y = 1; y < GRID_SIZE - 1; y++) {
            for (let x = 1; x < GRID_SIZE - 1; x++) {
                if (dungeon[y][x] === FLOOR) {
                    floorCells.push({x, y});
                }
            }
        }
        
        if (floorCells.length >= 2) {
            startPos = floorCells[0];
            endPos = floorCells[floorCells.length - 1];
        }
        return;
    }
    
    // Trouve les deux salles les plus éloignées
    let maxDistance = 0;
    let bestPair = {start: 0, end: 1};
    
    for (let i = 0; i < rooms.length; i++) {
        for (let j = i + 1; j < rooms.length; j++) {
            const dist = rooms[i].distanceTo(rooms[j]);
            if (dist > maxDistance) {
                maxDistance = dist;
                bestPair = {start: i, end: j};
            }
        }
    }
    
    startPos = {
        x: rooms[bestPair.start].centerX,
        y: rooms[bestPair.start].centerY
    };
    
    endPos = {
        x: rooms[bestPair.end].centerX,
        y: rooms[bestPair.end].centerY
    };
}

// Calcule la distance du chemin entre début et fin
function calculatePathDistance() {
    if (!startPos || !endPos) return 0;
    
    // Utilise A* pour trouver le chemin le plus court
    const path = findPath(startPos, endPos);
    return path ? path.length : 0;
}

// A* pathfinding
function findPath(start, end) {
    const openSet = [{...start, f: 0, g: 0, h: 0, parent: null}];
    const closedSet = new Set();
    
    while (openSet.length > 0) {
        // Trouve le nœud avec le plus petit f
        let current = openSet[0];
        let currentIndex = 0;
        
        for (let i = 1; i < openSet.length; i++) {
            if (openSet[i].f < current.f) {
                current = openSet[i];
                currentIndex = i;
            }
        }
        
        openSet.splice(currentIndex, 1);
        closedSet.add(`${current.x},${current.y}`);
        
        // Arrivé à destination
        if (current.x === end.x && current.y === end.y) {
            const path = [];
            let node = current;
            while (node) {
                path.push({x: node.x, y: node.y});
                node = node.parent;
            }
            return path.reverse();
        }
        
        // Explore les voisins
        const directions = [{x: 0, y: -1}, {x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}];
        for (let dir of directions) {
            const nx = current.x + dir.x;
            const ny = current.y + dir.y;
            
            if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE ||
                dungeon[ny][nx] === WALL || closedSet.has(`${nx},${ny}`)) {
                continue;
            }
            
            const g = current.g + 1;
            const h = Math.abs(nx - end.x) + Math.abs(ny - end.y);
            const f = g + h;
            
            // Vérifie si déjà dans openSet
            let inOpenSet = false;
            for (let node of openSet) {
                if (node.x === nx && node.y === ny) {
                    if (g < node.g) {
                        node.g = g;
                        node.f = f;
                        node.parent = current;
                    }
                    inOpenSet = true;
                    break;
                }
            }
            
            if (!inOpenSet) {
                openSet.push({x: nx, y: ny, f, g, h, parent: current});
            }
        }
    }
    
    return null;
}

// Analyse la qualité du donjon
function analyzeDungeonQuality() {
    const warnings = [];
    let score = 100;
    
    // Ajuste les critères selon la taille de la carte
    const sizeMultiplier = GRID_SIZE / 32;
    const minDistance = Math.floor(15 * sizeMultiplier);
    
    // Vérifie la distance entre début et fin
    if (pathDistance < minDistance) {
        warnings.push(`Distance S→E trop courte (< ${minDistance})`);
        score -= 20;
    }
    
    // Vérifie le ratio d'espaces libres
    let floorCount = 0;
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (dungeon[y][x] === FLOOR) floorCount++;
        }
    }
    const openRatio = (floorCount / (GRID_SIZE * GRID_SIZE)) * 100;
    
    if (openRatio < 25) {
        warnings.push("Trop dense (< 25% libre)");
        score -= 15;
    } else if (openRatio > 60) {
        warnings.push("Trop vide (> 60% libre)");
        score -= 15;
    }
    
    // Vérifie le nombre de culs-de-sac (ajusté selon la taille)
    const minDeadEnds = Math.floor(3 * sizeMultiplier);
    const maxDeadEnds = Math.floor(15 * sizeMultiplier);
    
    if (deadEndsList.length < minDeadEnds) {
        warnings.push(`Pas assez de culs-de-sac (< ${minDeadEnds})`);
        score -= 10;
    } else if (deadEndsList.length > maxDeadEnds) {
        warnings.push(`Trop de culs-de-sac (> ${maxDeadEnds})`);
        score -= 10;
    }
    
    // Vérifie les chemins alternatifs
    if (alternativePaths < 2) {
        warnings.push("Pas assez de chemins alternatifs");
        score -= 15;
    }
    
    return {score, warnings};
}

// Sauvegarde l'état actuel du donjon
function saveDungeonState() {
    return {
        dungeon: dungeon.map(row => [...row]),
        cellTypes: cellTypes.map(row => [...row]),
        rooms: rooms.map(r => ({...r})),
        startPos: startPos ? {...startPos} : null,
        endPos: endPos ? {...endPos} : null,
        deadEndsList: deadEndsList.map(d => ({...d})),
        pathDistance: pathDistance,
        alternativePaths: alternativePaths,
        quality: analyzeDungeonQuality(),
        seed: document.getElementById('seed').value || Math.random().toString(),
        mode: document.getElementById('dungeonMode').value,
        timestamp: Date.now()
    };
}

// Restaure un état de donjon
function restoreDungeonState(state) {
    dungeon = state.dungeon.map(row => [...row]);
    cellTypes = state.cellTypes.map(row => [...row]);
    rooms = state.rooms.map(r => ({...r}));
    startPos = state.startPos ? {...state.startPos} : null;
    endPos = state.endPos ? {...state.endPos} : null;
    deadEndsList = state.deadEndsList.map(d => ({...d}));
    pathDistance = state.pathDistance;
    alternativePaths = state.alternativePaths;
    
    updateStats();
    drawDungeon();
}

// Génération en masse
async function generateBulk() {
    const count = parseInt(document.getElementById('bulkCount').value);
    const threshold = parseInt(document.getElementById('qualityThreshold').value);
    
    bulkDungeons = [];
    bulkGenerating = true;
    
    // Affiche la barre de progression
    document.getElementById('bulkProgress').style.display = 'block';
    document.getElementById('bulkResults').style.display = 'none';
    
    // Sauvegarde les paramètres actuels
    const originalSeed = document.getElementById('seed').value;
    const originalRoomSize = document.getElementById('roomSizePreset').value;
    const originalMode = document.getElementById('dungeonMode').value;
    const originalDensity = document.getElementById('roomDensity').value;
    const originalComplexity = document.getElementById('pathComplexity').value;
    
    const modes = Object.keys(DUNGEON_MODES);
    
    // Détermine les tailles de salles viables selon la taille de carte actuelle
    const currentMapSize = document.getElementById('mapSize').value;
    const gridSize = SIZE_PRESETS[currentMapSize].gridSize;
    let maxViableRoomSize = 5; // Par défaut, toutes les tailles
    
    // Ajuste la taille maximale des salles selon la taille de la carte
    if (gridSize <= 24) {
        maxViableRoomSize = 3; // Petite carte : salles très petites à moyennes
    } else if (gridSize <= 32) {
        maxViableRoomSize = 4; // Carte moyenne : jusqu'aux grandes salles
    }
    // Pour les grandes cartes (48+), toutes les tailles sont possibles
    
    for (let i = 0; i < count && bulkGenerating; i++) {
        // Génère avec des paramètres aléatoires SAUF la taille de carte
        document.getElementById('seed').value = Math.random().toString();
        document.getElementById('dungeonMode').value = modes[Math.floor(Math.random() * modes.length)];
        
        // Taille de salle limitée selon la taille de carte
        document.getElementById('roomSizePreset').value = 1 + Math.floor(Math.random() * maxViableRoomSize);
        
        document.getElementById('roomDensity').value = 30 + Math.floor(Math.random() * 40);
        document.getElementById('pathComplexity').value = Math.floor(Math.random() * 100);
        
        // Génère le donjon
        generateDungeon();
        
        // Sauvegarde si la qualité est suffisante
        const quality = analyzeDungeonQuality();
        if (quality.score >= threshold) {
            const state = saveDungeonState();
            state.id = i;
            state.selected = false;
            state.mapSize = currentMapSize;
            state.roomSizePreset = document.getElementById('roomSizePreset').value;
            bulkDungeons.push(state);
        }
        
        // Met à jour la progression
        const progress = ((i + 1) / count) * 100;
        document.getElementById('progressBar').style.width = progress + '%';
        document.getElementById('progressText').textContent = `${i + 1}/${count}`;
        document.getElementById('qualityStats').textContent = `${bulkDungeons.length} acceptés`;
        
        // Pause pour permettre à l'UI de se mettre à jour
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    // Restaure les paramètres originaux
    document.getElementById('seed').value = originalSeed;
    document.getElementById('roomSizePreset').value = originalRoomSize;
    document.getElementById('dungeonMode').value = originalMode;
    document.getElementById('roomDensity').value = originalDensity;
    document.getElementById('pathComplexity').value = originalComplexity;
    
    // Affiche les résultats
    displayBulkResults();
    bulkGenerating = false;
}

// Affiche les résultats de la génération en masse
function displayBulkResults() {
    document.getElementById('bulkProgress').style.display = 'none';
    document.getElementById('bulkResults').style.display = 'block';
    
    const total = parseInt(document.getElementById('bulkCount').value);
    const accepted = bulkDungeons.length;
    const rate = Math.round((accepted / total) * 100);
    
    document.getElementById('totalGenerated').textContent = total;
    document.getElementById('totalAccepted').textContent = accepted;
    document.getElementById('acceptRate').textContent = rate;
    
    // Trie par qualité par défaut
    sortBulkDungeons('quality');
    
    // Affiche le premier donjon
    if (bulkDungeons.length > 0) {
        currentDungeonIndex = 0;
        restoreDungeonState(bulkDungeons[0]);
    }
    
    // Affiche la liste et met à jour la navigation
    updateDungeonList();
    updateNavigationInfo();
}

// Trie les donjons générés
function sortBulkDungeons(criteria) {
    switch(criteria) {
        case 'quality':
            bulkDungeons.sort((a, b) => b.quality.score - a.quality.score);
            break;
        case 'distance':
            bulkDungeons.sort((a, b) => b.pathDistance - a.pathDistance);
            break;
        case 'openSpace':
            bulkDungeons.sort((a, b) => {
                const aOpen = a.dungeon.flat().filter(cell => cell === FLOOR).length;
                const bOpen = b.dungeon.flat().filter(cell => cell === FLOOR).length;
                return bOpen - aOpen;
            });
            break;
        case 'rooms':
            bulkDungeons.sort((a, b) => b.rooms.length - a.rooms.length);
            break;
    }
}

// Met à jour la liste des donjons
function updateDungeonList() {
    const listElement = document.getElementById('dungeonList');
    listElement.innerHTML = '';
    
    bulkDungeons.forEach((dungeonState, index) => {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 5px; margin: 2px 0; background: #333; cursor: pointer; font-size: 12px; display: flex; align-items: center;';
        
        // Surligne l'élément actuel
        if (index === currentDungeonIndex) {
            item.style.background = '#444';
            item.style.border = '1px solid #666';
        }
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = dungeonState.selected;
        checkbox.style.marginRight = '10px';
        checkbox.onclick = (e) => {
            e.stopPropagation();
            dungeonState.selected = checkbox.checked;
        };
        
        const info = document.createElement('span');
        info.style.flex = '1';
        info.innerHTML = `
            <strong>#${dungeonState.id}</strong> - 
            ${dungeonState.mode} - 
            Qualité: <span style="color: ${dungeonState.quality.score >= 80 ? '#4a4' : dungeonState.quality.score >= 60 ? '#fa0' : '#f44'}">${dungeonState.quality.score}</span> - 
            Distance: ${dungeonState.pathDistance} - 
            Salles: ${dungeonState.rooms.length}
        `;
        
        item.appendChild(checkbox);
        item.appendChild(info);
        
        item.onclick = () => {
            navigateToDungeon(index);
        };
        
        listElement.appendChild(item);
    });
}

// Navigation entre les donjons
function navigateToDungeon(index) {
    if (index >= 0 && index < bulkDungeons.length) {
        currentDungeonIndex = index;
        restoreDungeonState(bulkDungeons[index]);
        updateDungeonList();
        updateNavigationInfo();
        
        // Scroll pour montrer l'élément sélectionné
        const listElement = document.getElementById('dungeonList');
        const selectedItem = listElement.children[index];
        if (selectedItem) {
            selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

// Met à jour les infos de navigation
function updateNavigationInfo() {
    document.getElementById('currentDungeonNum').textContent = currentDungeonIndex + 1;
    document.getElementById('totalDungeonNum').textContent = bulkDungeons.length;
    
    // Active/désactive les boutons de navigation
    document.getElementById('prevDungeonBtn').disabled = currentDungeonIndex === 0;
    document.getElementById('nextDungeonBtn').disabled = currentDungeonIndex === bulkDungeons.length - 1;
}

// Bascule la sélection du donjon actuel
function toggleCurrentSelection() {
    if (bulkDungeons[currentDungeonIndex]) {
        bulkDungeons[currentDungeonIndex].selected = !bulkDungeons[currentDungeonIndex].selected;
        updateDungeonList();
    }
}

// Exporte les donjons sélectionnés
function exportSelectedDungeons() {
    const selected = bulkDungeons.filter(d => d.selected);
    
    if (selected.length === 0) {
        alert('Aucun donjon sélectionné');
        return;
    }
    
    const exportData = {
        version: '1.0',
        count: selected.length,
        dungeons: selected.map(state => ({
            grid: state.dungeon,
            metadata: {
                id: state.id,
                mode: state.mode,
                quality: state.quality,
                rooms: state.rooms,
                start: state.startPos,
                end: state.endPos,
                deadEnds: state.deadEndsList,
                pathDistance: state.pathDistance,
                seed: state.seed
            }
        }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dungeons_bulk_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Génère le donjon complet
function generateDungeon() {
    const seedValue = document.getElementById('seed').value;
    const rng = new Random(seedValue ? parseInt(seedValue) : null);
    
    // Met à jour la taille de la grille
    const sizePreset = SIZE_PRESETS[document.getElementById('mapSize').value];
    GRID_SIZE = sizePreset.gridSize;
    
    // Initialise
    initializeDungeon();
    rooms = [];
    corridors = [];
    deadEndsList = [];
    
    // Récupère les paramètres
    const mode = DUNGEON_MODES[document.getElementById('dungeonMode').value];
    const density = parseInt(document.getElementById('roomDensity').value);
    const complexity = parseInt(document.getElementById('pathComplexity').value) / 100;
    
    // Génère les zones si mode mixte
    let zones = null;
    if (mode.name === 'Mixte') {
        zones = generateZones(rng);
    }
    
    // Place les salles principales
    const mainRooms = placeMainRooms(rng, mode, density, zones);
    
    // Place les salles secondaires
    const secondaryRooms = placeSecondaryRooms(rng, mode, mainRooms);
    
    // Combine toutes les salles
    rooms = [...mainRooms, ...secondaryRooms];
    
    // Connecte les salles
    connectRooms(rooms, rng, mode);
    
    // Génère les labyrinthes si activé
    if (document.getElementById('generateMazes').checked) {
        generateMazes(rng, complexity);
    }
    
    // Place le début et la fin
    placeStartAndEnd(mainRooms, rng);
    
    // Trouve les culs-de-sac
    deadEndsList = findDeadEnds();
    
    // Calcule les statistiques
    pathDistance = calculatePathDistance();
    
    // TODO: Calculer les chemins alternatifs
    alternativePaths = Math.floor(rooms.length / 3);
    
    // Met à jour l'affichage
    updateStats();
    drawDungeon();
}

// Met à jour les statistiques
function updateStats() {
    const mainRoomCount = rooms.filter(r => r.type === 'main').length;
    const secondaryRoomCount = rooms.filter(r => r.type === 'secondary').length;
    
    document.getElementById('mainRooms').textContent = mainRoomCount;
    document.getElementById('secondaryRooms').textContent = secondaryRoomCount;
    
    // Calcule le pourcentage d'espaces libres
    let floorCount = 0;
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (dungeon[y][x] === FLOOR) floorCount++;
        }
    }
    const openRatio = Math.round((floorCount / (GRID_SIZE * GRID_SIZE)) * 100);
    document.getElementById('openSpaces').textContent = openRatio + '%';
    
    document.getElementById('deadEnds').textContent = deadEndsList.length;
    document.getElementById('pathDistance').textContent = pathDistance;
    document.getElementById('altPaths').textContent = alternativePaths;
}

// Dessine le donjon
function drawDungeon() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    // Ajuste la taille du canvas si nécessaire
    const canvasSize = GRID_SIZE * CELL_SIZE;
    if (canvas.width !== canvasSize) {
        canvas.width = canvasSize;
        canvas.height = canvasSize;
    }
    
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const showGrid = document.getElementById('showGrid').checked;
    const showRoomTypes = document.getElementById('showRoomTypes').checked;
    const markDeadEnds = document.getElementById('markDeadEnds').checked;
    
    // Dessine les cellules
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            let color = '#222';
            
            if (dungeon[y][x] === FLOOR) {
                if (showRoomTypes) {
                    switch (cellTypes[y][x]) {
                        case CELL_TYPES.MAIN_ROOM:
                            color = '#e8e8e8';
                            break;
                        case CELL_TYPES.SECONDARY_ROOM:
                            color = '#b8b8b8';
                            break;
                        case CELL_TYPES.CORRIDOR:
                            color = '#888';
                            break;
                        case CELL_TYPES.MAZE:
                            color = '#666';
                            break;
                        case CELL_TYPES.SECRET:
                            color = '#a4f';
                            break;
                    }
                } else {
                    color = '#ccc';
                }
            }
            
            ctx.fillStyle = color;
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - (showGrid ? 1 : 0), CELL_SIZE - (showGrid ? 1 : 0));
        }
    }
    
    // Dessine les culs-de-sac
    if (markDeadEnds) {
        ctx.fillStyle = '#fa0';
        for (let deadEnd of deadEndsList) {
            if ((!startPos || deadEnd.x !== startPos.x || deadEnd.y !== startPos.y) &&
                (!endPos || deadEnd.x !== endPos.x || deadEnd.y !== endPos.y)) {
                ctx.fillRect(deadEnd.x * CELL_SIZE + 2, deadEnd.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
            }
        }
    }
    
    // Dessine le début
    if (startPos) {
        ctx.fillStyle = '#4a4';
        ctx.fillRect(startPos.x * CELL_SIZE, startPos.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S', startPos.x * CELL_SIZE + CELL_SIZE/2, startPos.y * CELL_SIZE + CELL_SIZE/2);
    }
    
    // Dessine la fin
    if (endPos) {
        ctx.fillStyle = '#f44';
        ctx.fillRect(endPos.x * CELL_SIZE, endPos.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('E', endPos.x * CELL_SIZE + CELL_SIZE/2, endPos.y * CELL_SIZE + CELL_SIZE/2);
    }
}

// Exporte le donjon en JSON
function exportDungeon() {
    const data = {
        grid: dungeon,
        metadata: {
            gridSize: GRID_SIZE,
            mode: document.getElementById('dungeonMode').value,
            rooms: rooms.map(r => ({
                x: r.x,
                y: r.y,
                width: r.width,
                height: r.height,
                type: r.type
            })),
            start: startPos,
            end: endPos,
            deadEnds: deadEndsList,
            pathDistance: pathDistance,
            seed: document.getElementById('seed').value || 'random',
            quality: analyzeDungeonQuality()
        }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dungeon_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Event listeners
document.getElementById('generateBtn').addEventListener('click', generateDungeon);
document.getElementById('bulkGenerateBtn').addEventListener('click', function() {
    document.getElementById('bulkPanel').style.display = 
        document.getElementById('bulkPanel').style.display === 'none' ? 'block' : 'none';
});

document.getElementById('startBulkBtn').addEventListener('click', generateBulk);
document.getElementById('cancelBulkBtn').addEventListener('click', function() {
    bulkGenerating = false;
    document.getElementById('bulkProgress').style.display = 'none';
});

document.getElementById('bulkCount').addEventListener('input', function() {
    document.getElementById('bulkCountValue').textContent = this.value;
});

document.getElementById('qualityThreshold').addEventListener('input', function() {
    document.getElementById('qualityThresholdValue').textContent = this.value;
});

document.getElementById('sortBy').addEventListener('change', function() {
    sortBulkDungeons(this.value);
    updateDungeonList();
});

// Navigation buttons
document.getElementById('prevDungeonBtn').addEventListener('click', function() {
    if (currentDungeonIndex > 0) {
        navigateToDungeon(currentDungeonIndex - 1);
    }
});

document.getElementById('nextDungeonBtn').addEventListener('click', function() {
    if (currentDungeonIndex < bulkDungeons.length - 1) {
        navigateToDungeon(currentDungeonIndex + 1);
    }
});

document.getElementById('toggleSelectBtn').addEventListener('click', toggleCurrentSelection);

document.getElementById('viewCurrentBtn').addEventListener('click', function() {
    if (bulkDungeons[currentDungeonIndex]) {
        restoreDungeonState(bulkDungeons[currentDungeonIndex]);
    }
});

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    // Only handle keyboard navigation when bulk results are visible
    if (document.getElementById('bulkResults').style.display === 'block') {
        switch(e.key) {
            case 'ArrowLeft':
                if (currentDungeonIndex > 0) {
                    navigateToDungeon(currentDungeonIndex - 1);
                }
                e.preventDefault();
                break;
            case 'ArrowRight':
                if (currentDungeonIndex < bulkDungeons.length - 1) {
                    navigateToDungeon(currentDungeonIndex + 1);
                }
                e.preventDefault();
                break;
            case ' ': // Spacebar
                toggleCurrentSelection();
                e.preventDefault();
                break;
        }
    }
});

document.getElementById('selectAllBtn').addEventListener('click', function() {
    bulkDungeons.forEach(d => d.selected = true);
    updateDungeonList();
});

document.getElementById('selectNoneBtn').addEventListener('click', function() {
    bulkDungeons.forEach(d => d.selected = false);
    updateDungeonList();
});

document.getElementById('exportSelectedBtn').addEventListener('click', exportSelectedDungeons);

document.getElementById('analyzeBtn').addEventListener('click', function() {
    const {score, warnings} = analyzeDungeonQuality();
    
    const scoreElement = document.getElementById('qualityScore');
    scoreElement.textContent = `${score}/100`;
    scoreElement.style.color = score >= 80 ? '#4a4' : score >= 60 ? '#fa0' : '#f44';
    
    const warningsElement = document.getElementById('qualityWarnings');
    if (warnings.length > 0) {
        warningsElement.innerHTML = warnings.map(w => `<div class="warning">• ${w}</div>`).join('');
    } else {
        warningsElement.innerHTML = '<div style="color: #4a4;">✓ Aucun problème détecté</div>';
    }
});
document.getElementById('exportBtn').addEventListener('click', exportDungeon);

// Mode selector
document.getElementById('dungeonMode').addEventListener('change', function() {
    const mode = DUNGEON_MODES[this.value];
    document.getElementById('modeDescription').textContent = mode.description;
});

// Size selector
document.getElementById('mapSize').addEventListener('change', function() {
    generateDungeon(); // Regénère avec la nouvelle taille
});

// Room size slider
document.getElementById('roomSizePreset').addEventListener('input', function() {
    const preset = ROOM_SIZE_PRESETS[this.value];
    document.getElementById('roomSizeValue').textContent = preset.name;
    document.getElementById('roomSizeMin').textContent = preset.min;
    document.getElementById('roomSizeMax').textContent = preset.max;
});

// Sliders
document.getElementById('roomDensity').addEventListener('input', function() {
    document.getElementById('roomDensityValue').textContent = this.value + '%';
});

document.getElementById('pathComplexity').addEventListener('input', function() {
    document.getElementById('pathComplexityValue').textContent = this.value + '%';
});

// Checkboxes
document.getElementById('markDeadEnds').addEventListener('change', function() {
    document.getElementById('deadEndLegend').style.display = this.checked ? 'flex' : 'none';
    drawDungeon();
});

document.getElementById('placeSecrets').addEventListener('change', function() {
    document.getElementById('secretLegend').style.display = this.checked ? 'flex' : 'none';
});

document.getElementById('showGrid').addEventListener('change', drawDungeon);
document.getElementById('showRoomTypes').addEventListener('change', drawDungeon);

// Génère un donjon initial
generateDungeon();
    