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

// Enable transparent images
Object.values(sprites).forEach(img => img.crossOrigin = 'anonymous');

let spritesLoaded = 0;
const totalSprites = Object.keys(sprites).length;

function onSpriteLoad() {
    spritesLoaded++;
    console.log('Sprite loaded:', spritesLoaded, '/', totalSprites);
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
const ROAD_WIDTH = 0.7;
const LANE_COUNT = 3;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 80;
const OBSTACLE_WIDTH = 45;
const OBSTACLE_HEIGHT = 70;
const BASE_SCROLL_SPEED = 300;

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
    lane: 1
};

// Obstáculos
let obstacles = [];

// Partículas para efecto de velocidad
let particles = [];

// Controles
let keys = {
    left: false,
    right: false
};

// Road markings
let roadMarkings = [];

// Inicializar juego
function init() {
    console.log('Init game...');
    gameState.running = true;
    gameState.score = 0;
    gameState.scrollOffset = 0;
    gameState.lastObstacleTime = Date.now();
    gameState.obstacleInterval = 1500;
    gameState.scrollSpeed = BASE_SCROLL_SPEED;
    
    const roadWidth = canvas.width * ROAD_WIDTH;
    const laneWidth = roadWidth / LANE_COUNT;
    player.x = (canvas.width - roadWidth) / 2 + laneWidth * 1.5 - PLAYER_WIDTH / 2;
    player.y = canvas.height - PLAYER_HEIGHT - 50;
    player.targetX = player.x;
    player.lane = 1;
    
    obstacles = [];
    particles = [];
    roadMarkings = [];
    
    // Generar líneas de carretera iniciales
    for (let i = 0; i < 15; i++) {
        roadMarkings.push({ y: i * 80 });
    }
    
    // Generar partículas iniciales
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
    updateScore();
    console.log('Starting game loop...');
    requestAnimationFrame(gameLoop);
}

// Actualizar posición del jugador
function updatePlayer(dt) {
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
    
    // Mover obstáculos
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
        
        // Aumentar dificultad
        if (gameState.score > 500) {
            gameState.obstacleInterval = 1200;
            gameState.scrollSpeed = 350;
        }
        if (gameState.score > 1000) {
            gameState.obstacleInterval = 900;
            gameState.scrollSpeed = 400;
        }
        if (gameState.score > 2000) {
            gameState.obstacleInterval = 700;
            gameState.scrollSpeed = 500;
        }
    }
}

// Actualizar partículas (efecto de velocidad)
function updateParticles(dt) {
    particles.forEach(p => {
        p.y += (p.speed + gameState.scrollSpeed) * dt;
        if (p.y > canvas.height) {
            p.y = -10;
            p.x = Math.random() * canvas.width;
        }
    });
}

// Colisiones AABB
function checkCollisions() {
    const px = player.x + 5;
    const py = player.y + 5;
    const pw = PLAYER_WIDTH - 10;
    const ph = PLAYER_HEIGHT - 10;
    
    for (let obs of obstacles) {
        const ox = obs.x + 3;
        const oy = obs.y + 3;
        const ow = obs.width - 6;
        const oh = obs.height - 6;
        
        if (px < ox + ow && px + pw > ox && py < oy + oh && py + ph > oy) {
            return true;
        }
    }
    return false;
}

// Dibujar carretera
function drawRoad() {
    const roadWidth = canvas.width * ROAD_WIDTH;
    const roadLeft = (canvas.width - roadWidth) / 2;
    
    // Césped
    ctx.fillStyle = '#2d5a27';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Asfalto
    ctx.fillStyle = '#3d3d3d';
    ctx.fillRect(roadLeft, 0, roadWidth, canvas.height);
    
    // Bordes de la carretera
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(roadLeft - 6, 0, 6, canvas.height);
    ctx.fillRect(roadLeft + roadWidth, 0, 6, canvas.height);
    
    // Líneas de carriles discontinuas
    ctx.fillStyle = '#ffffff';
    const laneWidth = roadWidth / LANE_COUNT;
    
    for (let i = 1; i < LANE_COUNT; i++) {
        const x = roadLeft + laneWidth * i - 2;
        roadMarkings.forEach(marking => {
            let y = (marking.y + gameState.scrollOffset * 1.5) % (canvas.height + 60);
            ctx.fillRect(x, y - 30, 4, 25);
        });
    }
    
    // Efecto de velocidad - líneas en los bordes
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
        // Fallback
        ctx.fillStyle = '#ff3333';
        ctx.fillRect(x, y, PLAYER_WIDTH, PLAYER_HEIGHT);
        ctx.fillStyle = '#cc0000';
        ctx.fillRect(x + 5, y + 15, PLAYER_WIDTH - 10, PLAYER_HEIGHT - 30);
    }
}

// Dibujar obstáculos
function drawObstacles() {
    obstacles.forEach(obs => {
        let sprite = null;
        
        switch (obs.type) {
            case 'car':
                sprite = (Math.floor(obs.y / 50) % 2 === 0) ? sprites.obstacleCarBlue : sprites.obstacleCarGrey;
                break;
            case 'cone':
                sprite = sprites.obstacleCone;
                break;
            case 'barrier':
                sprite = sprites.obstacleBarrier;
                break;
        }
        
        if (sprite && sprite.complete && sprite.naturalHeight > 0) {
            ctx.drawImage(sprite, obs.x, obs.y, obs.width, obs.height);
        } else {
            // Fallback
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
    console.log('Score:', gameState.score);
    scoreEl.textContent = `SCORE: ${gameState.score}m`;
}

function gameOver() {
    gameState.running = false;
    finalScoreEl.textContent = `Score: ${gameState.score}m`;
    gameOverEl.classList.remove('hidden');
}

// Bucle principal
let lastTime = null;
function gameLoop(timestamp) {
    if (!gameState.running) return;
    
    // Primer frame
    if (lastTime === null) {
        lastTime = timestamp;
        requestAnimationFrame(gameLoop);
        return;
    }
    
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;
    
    // Limpiar
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar carretera
    drawRoad();
    
    // Actualizar
    updatePlayer(dt);
    updateObstacles(dt);
    updateParticles(dt);
    
    // Dibujar
    drawParticles();
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
