// Road Fighter - Fase 2 (Polish)
// Core Loop + Gasolina + Enemigos + Aceite + Velocidad Progresiva

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
//const gasEl = document.getElementById('gas');
const gameOverEl = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');
const restartBtn = document.getElementById('restart-btn');

// Cargar sprites
const sprites = {
    player: new Image(),
    obstacleCarBlue: new Image(),
    obstacleCarGrey: new Image(),
    obstacleCone: new Image(),
    obstacleBarrier: new Image(),
    pickupGasoline: new Image(),
    enemyCarBlue: new Image(),
    enemyCarWhite: new Image(),
    oilSlick: new Image()
};

Object.values(sprites).forEach(img => img.crossOrigin = 'anonymous');

let spritesLoaded = 0;
const totalSprites = Object.keys(sprites).length;

function onSpriteLoad() {
    spritesLoaded++;
    console.log('Sprite loaded:', spritesLoaded, '/', totalSprites);
}

sprites.player.onload = onSpriteLoad;
sprites.player.src = 'assets/sprites/player_car.png?v=10';
sprites.obstacleCarBlue.onload = onSpriteLoad;
sprites.obstacleCarBlue.src = 'assets/sprites/obstacle_car_blue.png?v=10';
sprites.obstacleCarGrey.onload = onSpriteLoad;
sprites.obstacleCarGrey.src = 'assets/sprites/obstacle_car_grey.png?v=10';
sprites.obstacleCone.onload = onSpriteLoad;
sprites.obstacleCone.src = 'assets/sprites/obstacle_cone.png?v=10';
sprites.obstacleBarrier.onload = onSpriteLoad;
sprites.obstacleBarrier.src = 'assets/sprites/obstacle_barrier.png?v=10';
sprites.pickupGasoline.onload = onSpriteLoad;
sprites.pickupGasoline.src = 'assets/sprites/pickup_gasoline.png?v=10';
sprites.enemyCarBlue.onload = onSpriteLoad;
sprites.enemyCarBlue.src = 'assets/sprites/enemy_car_blue.png?v=10';
sprites.enemyCarWhite.onload = onSpriteLoad;
sprites.enemyCarWhite.src = 'assets/sprites/enemy_car_white.png?v=10';
sprites.oilSlick.onload = onSpriteLoad;
sprites.oilSlick.src = 'assets/sprites/oil_slick.png?v=10';

// Ajustar canvas
function resizeCanvas() {
    const container = document.getElementById('game-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Constantes
const ROAD_WIDTH = 0.7;
const LANE_COUNT = 3;
const PLAYER_WIDTH = 80;
const PLAYER_HEIGHT = 80;
const OBSTACLE_WIDTH = 80;
const OBSTACLE_HEIGHT = 80;
const PICKUP_SIZE = 48;
const ENEMY_WIDTH = 80;
const ENEMY_HEIGHT = 80;
const OIL_WIDTH = 96;
const OIL_HEIGHT = 96;
const BASE_SCROLL_SPEED = 250;
const MAX_GAS = 100;

// Estado del juego
let gameState = {
    running: false,
    score: 0,
    gas: MAX_GAS,
    scrollOffset: 0,
    lastObstacleTime: 0,
    lastEnemyTime: 0,
    lastPickupTime: 0,
    lastOilTime: 0,
    obstacleInterval: 1500,
    enemyInterval: 3000,
    pickupInterval: 8000,
    oilInterval: 10000,
    scrollSpeed: BASE_SCROLL_SPEED,
    gameOverReason: ''
};

// Jugador
let player = {
    x: 0,
    y: 0,
    targetX: 0,
    lane: 1,
    slipping: false,
    slipTimer: 0
};

// Entidades
let obstacles = [];
let enemies = [];
let pickups = [];
let oilSlicks = [];
let particles = [];
let roadMarkings = [];

// Controles
let keys = { left: false, right: false };

// Inicializar
function init() {
    console.log('Init game Phase 2...');
    gameState.running = true;
    gameState.score = 0;
    gameState.gas = MAX_GAS;
    gameState.scrollOffset = 0;
    gameState.lastObstacleTime = Date.now();
    gameState.lastEnemyTime = Date.now();
    gameState.lastPickupTime = Date.now();
    gameState.lastOilTime = Date.now();
    gameState.obstacleInterval = 1500;
    gameState.enemyInterval = 3000;
    gameState.pickupInterval = 8000;
    gameState.oilInterval = 10000;
    gameState.scrollSpeed = BASE_SCROLL_SPEED;
    gameState.gameOverReason = '';
    
    const roadWidth = canvas.width * ROAD_WIDTH;
    const laneWidth = roadWidth / LANE_COUNT;
    player.x = (canvas.width - roadWidth) / 2 + laneWidth * 1.5 - PLAYER_WIDTH / 2;
    player.y = canvas.height - PLAYER_HEIGHT - 50;
    player.targetX = player.x;
    player.lane = 1;
    player.slipping = false;
    player.slipTimer = 0;
    
    obstacles = [];
    enemies = [];
    pickups = [];
    oilSlicks = [];
    particles = [];
    roadMarkings = [];
    
    for (let i = 0; i < 15; i++) {
        roadMarkings.push({ y: i * 80 });
    }
    
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speed: 100 + Math.random() * 200,
            size: 2 + Math.random() * 3
        });
    }
    
    lastTime = null;
    gameOverEl.classList.add('hidden');
    updateUI();
    console.log('Starting game loop...');
    requestAnimationFrame(gameLoop);
}

// Actualizar jugador
function updatePlayer(dt) {
    if (player.slipping) {
        player.slipTimer -= dt;
        if (player.slipTimer <= 0) {
            player.slipping = false;
        }
        // Durante slip, mover aleatoriamente
        player.x += (Math.random() - 0.5) * 10;
        return;
    }
    
    const roadWidth = canvas.width * ROAD_WIDTH;
    const laneWidth = roadWidth / LANE_COUNT;
    const roadLeft = (canvas.width - roadWidth) / 2;
    
    if (keys.left && player.lane > 0) {
        player.lane--;
        keys.left = false;
    }
    if (keys.right && player.lane < LANE_COUNT - 1) {
        player.lane++;
        keys.right = false;
    }
    
    player.targetX = roadLeft + laneWidth * player.lane + (laneWidth - PLAYER_WIDTH) / 2;
    player.x += (player.targetX - player.x) * 0.2;
    player.x = Math.max(roadLeft, Math.min(roadLeft + roadWidth - PLAYER_WIDTH, player.x));
}

// Generar obstáculo estático
function spawnObstacle() {
    const roadWidth = canvas.width * ROAD_WIDTH;
    const laneWidth = roadWidth / LANE_COUNT;
    const roadLeft = (canvas.width - roadWidth) / 2;
    
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const x = roadLeft + laneWidth * lane + (laneWidth - OBSTACLE_WIDTH) / 2;
    
    const types = ['car', 'cone', 'barrier'];
    const type = types[Math.floor(Math.random() * types.length)];
    let carColor = null;
    if (type === 'car') carColor = Math.random() < 0.5 ? 'blue' : 'grey';
    
    obstacles.push({
        x: x,
        y: -OBSTACLE_HEIGHT,
        type: type,
        carColor: carColor,
        width: OBSTACLE_WIDTH,
        height: OBSTACLE_HEIGHT
    });
}

// Generar enemigo móvil
function spawnEnemy() {
    const roadWidth = canvas.width * ROAD_WIDTH;
    const laneWidth = roadWidth / LANE_COUNT;
    const roadLeft = (canvas.width - roadWidth) / 2;
    
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const x = roadLeft + laneWidth * lane + (laneWidth - ENEMY_WIDTH) / 2;
    
    enemies.push({
        x: x,
        y: -ENEMY_HEIGHT,
        lane: lane,
        targetLane: lane,
        speed: 50 + Math.random() * 50,
        color: Math.random() < 0.5 ? 'blue' : 'white',
        width: ENEMY_WIDTH,
        height: ENEMY_HEIGHT,
        changeTimer: 0
    });
}

// Generar pickup de gasolina
function spawnPickup() {
    const roadWidth = canvas.width * ROAD_WIDTH;
    const laneWidth = roadWidth / LANE_COUNT;
    const roadLeft = (canvas.width - roadWidth) / 2;
    
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const x = roadLeft + laneWidth * lane + (laneWidth - PICKUP_SIZE) / 2;
    
    pickups.push({
        x: x,
        y: -PICKUP_SIZE,
        width: PICKUP_SIZE,
        height: PICKUP_SIZE
    });
}

// Generar zona de aceite
function spawnOilSlick() {
    const roadWidth = canvas.width * ROAD_WIDTH;
    const laneWidth = roadWidth / LANE_COUNT;
    const roadLeft = (canvas.width - roadWidth) / 2;
    
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const x = roadLeft + laneWidth * lane + (laneWidth - OIL_WIDTH) / 2;
    
    oilSlicks.push({
        x: x,
        y: -OIL_HEIGHT,
        width: OIL_WIDTH,
        height: OIL_HEIGHT
    });
}

// Actualizar entidades
function updateEntities(dt) {
    const scrollDelta = gameState.scrollSpeed * dt;
    gameState.scrollOffset += scrollDelta;
    gameState.score += Math.floor(scrollDelta / 5);
    
    // Gasolina baja constantemente
    gameState.gas -= dt * 3; // 3% por segundo
    if (gameState.gas <= 0) {
        gameState.gameOverReason = 'Sin gasolina';
        gameOver();
        return;
    }
    
    // Mover obstáculos
    obstacles.forEach(o => o.y += scrollDelta);
    obstacles = obstacles.filter(o => o.y < canvas.height + 100);
    
    // Mover enemigos (más lentas que el scroll = vienen hacia el jugador)
    const roadWidth = canvas.width * ROAD_WIDTH;
    const laneWidth = roadWidth / LANE_COUNT;
    const roadLeft = (canvas.width - roadWidth) / 2;
    
    enemies.forEach(e => {
        e.y += scrollDelta - e.speed * dt;
        // IA: cambiar de carril ocasionalmente
        e.changeTimer -= dt;
        if (e.changeTimer <= 0 && Math.random() < 0.3) {
            const newLane = Math.max(0, Math.min(LANE_COUNT - 1, e.lane + (Math.random() < 0.5 ? -1 : 1)));
            e.targetLane = newLane;
            e.changeTimer = 1 + Math.random() * 2;
        }
        // Interpolación suave entre carriles
        const targetX = roadLeft + laneWidth * e.targetLane + (laneWidth - ENEMY_WIDTH) / 2;
        e.x += (targetX - e.x) * 0.05;
        e.lane = e.targetLane;
    });
    enemies = enemies.filter(e => e.y < canvas.height + 100);
    
    // Mover pickups
    pickups.forEach(p => p.y += scrollDelta);
    pickups = pickups.filter(p => p.y < canvas.height + 100);
    
    // Mover aceite
    oilSlicks.forEach(o => o.y += scrollDelta);
    oilSlicks = oilSlicks.filter(o => o.y < canvas.height + 100);
    
    // Generar entidades
    const now = Date.now();
    
    if (now - gameState.lastObstacleTime > gameState.obstacleInterval) {
        spawnObstacle();
        gameState.lastObstacleTime = now;
    }
    
    if (now - gameState.lastEnemyTime > gameState.enemyInterval) {
        spawnEnemy();
        gameState.lastEnemyTime = now;
    }
    
    if (now - gameState.lastPickupTime > gameState.pickupInterval) {
        spawnPickup();
        gameState.lastPickupTime = now;
    }
    
    if (now - gameState.lastOilTime > gameState.oilInterval) {
        spawnOilSlick();
        gameState.lastOilTime = now;
    }
    
    // Aumentar dificultad
    if (gameState.score > 500) {
        gameState.obstacleInterval = 1200;
        gameState.enemyInterval = 2500;
        gameState.scrollSpeed = 300;
    }
    if (gameState.score > 1000) {
        gameState.obstacleInterval = 900;
        gameState.enemyInterval = 2000;
        gameState.scrollSpeed = 350;
    }
    if (gameState.score > 2000) {
        gameState.obstacleInterval = 700;
        gameState.enemyInterval = 1500;
        gameState.scrollSpeed = 420;
    }
}

// Actualizar partículas
function updateParticles(dt) {
    particles.forEach(p => {
        p.y += (p.speed + gameState.scrollSpeed) * dt;
        if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
        }
    });
}

// Colisiones
function checkCollisions() {
    // Hitbox más pequeña (60% del sprite) para evitar espacio vacío
    const px = player.x + PLAYER_WIDTH * 0.2;
    const py = player.y + PLAYER_HEIGHT * 0.2;
    const pw = PLAYER_WIDTH * 0.6;
    const ph = PLAYER_HEIGHT * 0.6;
    
    // Obstáculos
    for (let obs of obstacles) {
        const ox = obs.x + obs.width * 0.2;
        const oy = obs.y + obs.height * 0.2;
        const ow = obs.width * 0.6;
        const oh = obs.height * 0.6;
        if (px < ox + ow && px + pw > ox && py < oy + oh && py + ph > oy) {
            return 'obstacle';
        }
    }
    
    // Enemigos
    for (let e of enemies) {
        const ex = e.x + e.width * 0.2;
        const ey = e.y + e.height * 0.2;
        const ew = e.width * 0.6;
        const eh = e.height * 0.6;
        if (px < ex + ew && px + pw > ex && py < ey + eh && py + ph > ey) {
            return 'enemy';
        }
    }
    
    // Pickups de gasolina
    for (let i = pickups.length - 1; i >= 0; i--) {
        const p = pickups[i];
        if (px < p.x + p.width * 0.6 && px + pw > p.x + p.width * 0.4 &&
            py < p.y + p.height * 0.6 && py + ph > p.y + p.height * 0.4) {
            gameState.gas = Math.min(MAX_GAS, gameState.gas + 25);
            pickups.splice(i, 1);
        }
    }
    
    // Aceite
    for (let o of oilSlicks) {
        if (px < o.x + o.width * 0.6 && px + pw > o.x + o.width * 0.4 &&
            py < o.y + o.height * 0.6 && py + ph > o.y + o.height * 0.4) {
            if (!player.slipping) {
                player.slipping = true;
                player.slipTimer = 0.5;
            }
        }
    }
    
    return null;
}

// Dibujar carretera
function drawRoad() {
    const roadWidth = canvas.width * ROAD_WIDTH;
    const roadLeft = (canvas.width - roadWidth) / 2;
    
    ctx.fillStyle = '#2d5a27';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#3d3d3d';
    ctx.fillRect(roadLeft, 0, roadWidth, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(roadLeft - 6, 0, 6, canvas.height);
    ctx.fillRect(roadLeft + roadWidth, 0, 6, canvas.height);
    
    const laneWidth = roadWidth / LANE_COUNT;
    
    for (let i = 1; i < LANE_COUNT; i++) {
        const x = roadLeft + laneWidth * i - 2;
        roadMarkings.forEach(m => {
            let y = (m.y + gameState.scrollOffset * 1.5) % (canvas.height + 60);
            ctx.fillRect(x, y - 30, 4, 25);
        });
    }
    
    // Efecto de velocidad
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 8; i++) {
        let y = ((i * 80) + gameState.scrollOffset * 2) % (canvas.height + 80) - 40;
        ctx.fillRect(roadLeft - 20, y, 15, 4);
        ctx.fillRect(roadLeft + roadWidth + 5, y, 15, 4);
    }
}

// Dibujar partículas
function drawParticles() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Dibujar sprites helper
function drawSprite(sprite, x, y, w, h, fallbackColor) {
    if (sprite && sprite.complete && sprite.naturalHeight > 0) {
        ctx.drawImage(sprite, x, y, w, h);
    } else {
        ctx.fillStyle = fallbackColor;
        ctx.fillRect(x, y, w, h);
    }
}

// Dibujar jugador
function drawPlayer() {
    const x = player.x;
    const y = player.y;
    
    // Efecto slip
    if (player.slipping) {
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.translate(x + PLAYER_WIDTH/2, y + PLAYER_HEIGHT/2);
        ctx.rotate(Math.sin(Date.now() / 50) * 0.3);
        ctx.translate(-(x + PLAYER_WIDTH/2), -(y + PLAYER_HEIGHT/2));
    }
    
    drawSprite(sprites.player, x, y, PLAYER_WIDTH, PLAYER_HEIGHT, '#ff3333');
    
    if (player.slipping) ctx.restore();
}

// Dibujar obstáculos
function drawObstacles() {
    obstacles.forEach(obs => {
        let sprite = null;
        switch (obs.type) {
            case 'car':
                sprite = (obs.carColor === 'blue') ? sprites.obstacleCarBlue : sprites.obstacleCarGrey;
                break;
            case 'cone': sprite = sprites.obstacleCone; break;
            case 'barrier': sprite = sprites.obstacleBarrier; break;
        }
        drawSprite(sprite, obs.x, obs.y, obs.width, obs.height, '#888');
    });
}

// Dibujar enemigos
function drawEnemies() {
    enemies.forEach(e => {
        const sprite = (e.color === 'blue') ? sprites.enemyCarBlue : sprites.enemyCarWhite;
        drawSprite(sprite, e.x, e.y, e.width, e.height, '#888');
    });
}

// Dibujar pickups
function drawPickups() {
    pickups.forEach(p => {
        drawSprite(sprites.pickupGasoline, p.x, p.y, p.width, p.height, '#ffaa00');
    });
}

// Dibujar aceite
function drawOilSlicks() {
    oilSlicks.forEach(o => {
        drawSprite(sprites.oilSlick, o.x, o.y, o.width, o.height, '#333');
    });
}

// UI
function updateUI() {
    if (!gameState.running) return;
    try {
        scoreEl.textContent = `SCORE: ${gameState.score}m`;
        
        // Update gas segments
        const segments = document.querySelectorAll('.gas-segment');
        const gasPercent = Math.max(0, gameState.gas);
        const activeSegments = Math.ceil(gasPercent / 20);
        
        segments.forEach((seg, i) => {
            seg.classList.remove('active', 'low');
            if (i < activeSegments) {
                if (gasPercent <= 20) {
                    seg.classList.add('low');
                } else {
                    seg.classList.add('active');
                }
            }
        });
    } catch(e) {
        console.error('UI update error:', e);
    }
}

function gameOver() {
    gameState.running = false;
    let reason = gameState.gameOverReason || 'Chocaste';
    finalScoreEl.textContent = `${reason} - Score: ${gameState.score}m`;
    gameOverEl.classList.remove('hidden');
}

// Bucle principal
let lastTime = null;
function gameLoop(timestamp) {
    if (!gameState.running) return;
    
    try {
        if (lastTime === null) {
            lastTime = timestamp;
            requestAnimationFrame(gameLoop);
            return;
        }
        
        const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
        lastTime = timestamp;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawRoad();
        
        updatePlayer(dt);
        updateEntities(dt);
        updateParticles(dt);
        
        drawParticles();
        drawOilSlicks();
        drawPickups();
        drawObstacles();
        drawEnemies();
        drawPlayer();
        
        const collision = checkCollisions();
        if (collision) {
            gameOver();
            return;
        }
        
        updateUI();
    } catch(e) {
        console.error('Game loop error:', e);
    }
    
    if (gameState.running) {
        requestAnimationFrame(gameLoop);
    }
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
    if (e.key === ' ' && !gameState.running) init();
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
});

// Touch controls
const touchLeft = document.getElementById('touch-left');
const touchRight = document.getElementById('touch-right');

touchLeft?.addEventListener('touchstart', (e) => { e.preventDefault(); keys.left = true; });
touchLeft?.addEventListener('touchend', () => keys.left = false);
touchRight?.addEventListener('touchstart', (e) => { e.preventDefault(); keys.right = true; });
touchRight?.addEventListener('touchend', () => keys.right = false);

restartBtn.addEventListener('click', init);

init();
