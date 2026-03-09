// Road Fighter - Fase 1 (Core Loop MVP)
// Canvas + scroll infinito + jugador + obstáculos + colisiones + score

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const gameOverEl = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// Cargar sprites
const sprites = {
    player: new Image(),
    obstacleCarBlue: new Image(),
    obstacleCarGrey: new Image(),
    obstacleCone: new Image(),
    obstacleBarrier: new Image()
};

let spritesLoaded = 0;
const totalSprites = Object.keys(sprites).length;

function onSpriteLoad() {
    spritesLoaded++;
    if (spritesLoaded === totalSprites) {
        console.log('Sprites loaded:', totalSprites);
    }
}

sprites.player.onload = onSpriteLoad;
sprites.player.src = 'assets/sprites/player_car.png';
sprites.obstacleCarBlue.onload = onSpriteLoad;
sprites.obstacleCarBlue.src = 'assets/sprites/obstacle_car_blue.png';
sprites.obstacleCarGrey.onload = onSpriteLoad;
sprites.obstacleCarGrey.src = 'assets/sprites/obstacle_car_grey.png';
sprites.obstacleCone.onload = onSpriteLoad;
sprites.obstacleCone.src = 'assets/sprites/obstacle_cone.png';
sprites.obstacleBarrier.onload = onSpriteLoad;
sprites.obstacleBarrier.src = 'assets/sprites/obstacle_barrier.png';

// Ajustar canvas al contenedor
function resizeCanvas() {
    const container = document.getElementById('game-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Constantes del juego
const ROAD_WIDTH = 0.7; // 70% del ancho del canvas
const LANE_COUNT = 3;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 80;
const OBSTACLE_WIDTH = 45;
const OBSTACLE_HEIGHT = 70;
const PLAYER_SPEED = 8;
const BASE_SCROLL_SPEED = 200;

// Estado del juego
let gameState = {
    running: false,
    score: 0,
    scrollOffset: 0,
    lastObstacleTime: 0,
    obstacleInterval: 1500,
    scrollSpeed: BASE_SCROLL_SPEED
};

// Jugador
let player = {
    x: 0,
    y: 0,
    targetX: 0,
    lane: 1 // 0, 1, 2 (centro)
};

// Obstáculos
let obstacles = [];

// Controles
let keys = {
    left: false,
    right: false
};

// Road markings (líneas de la carretera)
let roadMarkings = [];

// Inicializar juego
function init() {
    gameState.running = true;
    gameState.score = 0;
    gameState.scrollOffset = 0;
    gameState.lastObstacleTime = 0;
    gameState.obstacleInterval = 1500;
    gameState.scrollSpeed = BASE_SCROLL_SPEED;
    
    const roadWidth = canvas.width * ROAD_WIDTH;
    const laneWidth = roadWidth / LANE_COUNT;
    player.x = (canvas.width - roadWidth) / 2 + laneWidth * 1.5 - PLAYER_WIDTH / 2;
    player.y = canvas.height - PLAYER_HEIGHT - 50;
    player.targetX = player.x;
    player.lane = 1;
    
    obstacles = [];
    roadMarkings = [];
    
    // Generar líneas de carretera iniciales
    for (let i = 0; i < 10; i++) {
        roadMarkings.push({
            y: i * 100,
            type: 'center'
        });
    }
    
    gameOverEl.classList.add('hidden');
    updateScore();
    requestAnimationFrame(gameLoop);
}

// Actualizar posición del jugador
function updatePlayer(dt) {
    const roadWidth = canvas.width * ROAD_WIDTH;
    const laneWidth = roadWidth / LANE_COUNT;
    const roadLeft = (canvas.width - roadWidth) / 2;
    
    // Movimiento suave entre carriles
    if (keys.left && player.lane > 0) {
        player.lane--;
        keys.left = false;
    }
    if (keys.right && player.lane < LANE_COUNT - 1) {
        player.lane++;
        keys.right = false;
    }
    
    // Calcular posición objetivo del carril
    player.targetX = roadLeft + laneWidth * player.lane + (laneWidth - PLAYER_WIDTH) / 2;
    
    // Interpolación suave
    player.x += (player.targetX - player.x) * 0.15;
    
    // Límites de la carretera
    player.x = Math.max(roadLeft, Math.min(roadLeft + roadWidth - PLAYER_WIDTH, player.x));
}

// Generar obstáculos
function spawnObstacle() {
    const roadWidth = canvas.width * ROAD_WIDTH;
    const laneWidth = roadWidth / LANE_COUNT;
    const roadLeft = (canvas.width - roadWidth) / 2;
    
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const x = roadLeft + laneWidth * lane + (laneWidth - OBSTACLE_WIDTH) / 2;
    
    const types = ['car', 'cone', 'barrier'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    obstacles.push({
        x: x,
        y: -OBSTACLE_HEIGHT,
        type: type,
        width: OBSTACLE_WIDTH,
        height: OBSTACLE_HEIGHT
    });
}

// Actualizar obstáculos
function updateObstacles(dt) {
    const scrollDelta = gameState.scrollSpeed * dt;
    gameState.scrollOffset += scrollDelta;
    gameState.score += Math.floor(scrollDelta / 10);
    
    // Mover obstáculos hacia abajo
    obstacles.forEach(obs => {
        obs.y += scrollDelta;
    });
    
    // Eliminar obstáculos fuera de pantalla
    obstacles = obstacles.filter(obs => obs.y < canvas.height + 100);
    
    // Generar nuevos obstáculos
    const now = Date.now();
    if (now - gameState.lastObstacleTime > gameState.obstacleInterval) {
        spawnObstacle();
        gameState.lastObstacleTime = now;
        
        // Aumentar dificultad progresivamente
        if (gameState.score > 500) {
            gameState.obstacleInterval = 1200;
            gameState.scrollSpeed = 250;
        }
        if (gameState.score > 1000) {
            gameState.obstacleInterval = 900;
            gameState.scrollSpeed = 300;
        }
        if (gameState.score > 2000) {
            gameState.obstacleInterval = 700;
            gameState.scrollSpeed = 380;
        }
    }
}

// Colisiones AABB
function checkCollisions() {
    const px = player.x + 5; // Hitbox más pequeña que el sprite
    const py = player.y + 5;
    const pw = PLAYER_WIDTH - 10;
    const ph = PLAYER_HEIGHT - 10;
    
    for (let obs of obstacles) {
        const ox = obs.x + 3;
        const oy = obs.y + 3;
        const ow = obs.width - 6;
        const oh = obs.height - 6;
        
        if (px < ox + ow &&
            px + pw > ox &&
            py < oy + oh &&
            py + ph > oy) {
            return true;
        }
    }
    return false;
}

// Dibujar carretera
function drawRoad() {
    const roadWidth = canvas.width * ROAD_WIDTH;
    const roadLeft = (canvas.width - roadWidth) / 2;
    
    // Asfalto
    ctx.fillStyle = '#3d3d3d';
    ctx.fillRect(roadLeft, 0, roadWidth, canvas.height);
    
    // Bordes
    ctx.fillStyle = '#ff0044';
    ctx.fillRect(roadLeft - 8, 0, 8, canvas.height);
    ctx.fillRect(roadLeft + roadWidth, 0, 8, canvas.height);
    
    // Líneas de carriles
    ctx.fillStyle = '#ffffff';
    const laneWidth = roadWidth / LANE_COUNT;
    
    for (let i = 1; i < LANE_COUNT; i++) {
        const x = roadLeft + laneWidth * i - 2;
        
        // Líneas discontinuas con scroll
        roadMarkings.forEach(marking => {
            let y = (marking.y + gameState.scrollOffset) % (canvas.height + 100);
            ctx.fillRect(x, y - 50, 4, 30);
        });
    }
}

// Dibujar jugador
function drawPlayer() {
    const x = player.x;
    const y = player.y;
    
    // Sombra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x + 5, y + 5, PLAYER_WIDTH, PLAYER_HEIGHT);
    
    // Dibujar sprite si está cargado
    if (sprites.player.complete && sprites.player.naturalHeight > 0) {
        ctx.drawImage(sprites.player, x, y, PLAYER_WIDTH, PLAYER_HEIGHT);
    } else {
        // Fallback: rectángulo
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(x, y, PLAYER_WIDTH, PLAYER_HEIGHT);
        ctx.fillStyle = '#cc0000';
        ctx.fillRect(x + 5, y + 15, PLAYER_WIDTH - 10, PLAYER_HEIGHT - 30);
        ctx.fillStyle = '#88ccff';
        ctx.fillRect(x + 7, y + 20, PLAYER_WIDTH - 14, 12);
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(x + 3, y + 3, 8, 5);
        ctx.fillRect(x + PLAYER_WIDTH - 11, y + 3, 8, 5);
    }
}

// Dibujar obstáculos
function drawObstacles() {
    obstacles.forEach(obs => {
        let sprite = null;
        
        switch (obs.type) {
            case 'car':
                // Alternar entre azul y gris
                sprite = (obs.x % 2 === 0) ? sprites.obstacleCarBlue : sprites.obstacleCarGrey;
                break;
            case 'cone':
                sprite = sprites.obstacleCone;
                break;
            case 'barrier':
                sprite = sprites.obstacleBarrier;
                break;
        }
        
        // Dibujar sprite si está cargado
        if (sprite && sprite.complete && sprite.naturalHeight > 0) {
            ctx.drawImage(sprite, obs.x, obs.y, obs.width, obs.height);
        } else {
            // Fallback: rectángulos
            switch (obs.type) {
                case 'car':
                    ctx.fillStyle = '#3366ff';
                    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
                    break;
                case 'cone':
                    ctx.fillStyle = '#ff6600';
                    ctx.beginPath();
                    ctx.moveTo(obs.x + obs.width / 2, obs.y);
                    ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
                    ctx.lineTo(obs.x, obs.y + obs.height);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 'barrier':
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
                    ctx.fillStyle = '#ff0000';
                    for (let i = 0; i < 4; i++) {
                        ctx.fillRect(obs.x, obs.y + i * 15 + 5, obs.width, 10);
                    }
                    break;
            }
        }
    });
}

function updateScore() {
    scoreEl.textContent = `SCORE: ${gameState.score}m`;
}

// Game over
function gameOver() {
    gameState.running = false;
    finalScoreEl.textContent = `Score: ${gameState.score}m`;
    gameOverEl.classList.remove('hidden');
}

// Bucle principal
let lastTime = 0;
function gameLoop(timestamp) {
    if (!gameState.running) return;
    
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;
    
    // Limpiar
    ctx.fillStyle = '#2d5a27'; // Césped
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar carretera
    drawRoad();
    
    // Actualizar
    updatePlayer(dt);
    updateObstacles(dt);
    
    // Dibujar
    drawObstacles();
    drawPlayer();
    
    // Colisiones
    if (checkCollisions()) {
        gameOver();
        return;
    }
    
    updateScore();
    requestAnimationFrame(gameLoop);
}

// Event listeners - Teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = true;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = true;
    }
    if (e.key === ' ' && !gameState.running) {
        init();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keys.left = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keys.right = false;
    }
});

// Touch controls
const touchLeft = document.getElementById('touch-left');
const touchRight = document.getElementById('touch-right');

touchLeft.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.left = true;
});
touchLeft.addEventListener('touchend', () => keys.left = false);

touchRight.addEventListener('touchstart', (e) => {
    e.preventDefault();
    keys.right = true;
});
touchRight.addEventListener('touchend', () => keys.right = false);

// Restart button
restartBtn.addEventListener('click', init);

// Iniciar juego
init();
