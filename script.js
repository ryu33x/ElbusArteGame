const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const backgroundMusic = document.getElementById('backgroundMusic');

// Estado del juego
let gameState = 'start';
let currentLevel = 1;
let stationsVisited = 0;

// Variables del juego
let busX = 0;
let busY = 270;
let busVelocity = 0;
let busVerticalVelocity = 0;
let busSpeed = 50;
const gravity = 250;
const jumpStrength = -120;
const maxJumpTime = 0.3;
let jumpTime = 0;
let isJumping = false;
let keys = { left: false, right: false, up: false }; // Estado de las teclas
let trees = [];
let clouds = [];
let birdGroups = [];
let trafficSigns = [];
let roadBlocks = [];
let lastTime = null;
let stations = [
    { x: 650, swayOffset: 0, bounceOffset: 0, lightTimer: 0, visited: false, fact: "" },
    { x: 400, swayOffset: 0, bounceOffset: 0, lightTimer: 0, visited: false, fact: "" },
    { x: 150, swayOffset: 0, bounceOffset: 0, visited: false, fact: "" }
];
let currentFact = "";
let factTimer = 0;
let stoppedAtStation = false;

// Variables para el ciclo día/noche
let dayNightCycleTime = 15;
let cycleProgress = 0;

// Variables para partículas
let smokeParticles = [];
let welcomeParticles = [];
const particleSpawnRate = 30;
const particleLifespan = 0.5;
const particleVelocityX = 20;
const particleVelocityY = 10;
const particleSize = 4;
const particleFadeSpeed = 2;
const welcomeParticleSpawnRate = 5;
const welcomeParticleLifespan = 3;
const welcomeParticleVelocityY = -50;
const welcomeParticleSize = 3;
const welcomeParticleFadeSpeed = 0.5;

// Caché para valores constantes
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const trafficColors = ['rgba(255, 0, 0, ', 'rgba(255, 165, 0, ', 'rgba(0, 255, 0, '];
const PI = Math.PI;
const TWO_PI = PI * 2;
const GROUND_Y = 270;

// Lista de datos
const facts = [
    "El jaguar (Panthera onca) habita en la Amazonía colombiana y es un excelente nadador.",
    "La Cattleya trianae, orquídea nacional, florece en los bosques nublados de Colombia.",
    "El cóndor andino tiene una envergadura de alas de hasta 3 metros.",
    "El oso de anteojos es el único oso nativo de Sudamérica y vive en los Andes.",
    "La palma de cera del Quindío es el árbol nacional de Colombia y puede alcanzar los 60 metros de altura.",
    "El Parque Nacional Natural Tayrona alberga playas, selvas y ruinas arqueológicas.",
    "El río Magdalena es el más largo de Colombia, con 1,528 km de longitud.",
    "El Nevado del Ruiz es un volcán activo en la cordillera central de los Andes colombianos.",
    "Colombia es el segundo país más biodiverso del mundo, con más de 50,000 especies de plantas.",
    "El frailejón es una planta endémica de los páramos andinos y puede vivir hasta 100 años.",
    "El mono aullador rojo es conocido por su potente vocalización que se escucha a kilómetros de distancia.",
    "La Sierra Nevada de Santa Marta es la montaña costera más alta del mundo, con picos de hasta 5,775 metros.",
    "El Amazonas colombiano es hogar de delfines rosados, una especie única de delfín de agua dulce.",
    "El café colombiano es famoso mundialmente; la zona cafetera es Patrimonio de la Humanidad.",
    "El colibrí esmeralda es una de las más de 160 especies de colibríes que se encuentran en Colombia.",
    "La guacamaya azul y amarilla es un ave icónica de la Amazonía colombiana.",
    "El caimán del Orinoco es uno de los cocodrilos más grandes del mundo, alcanzando hasta 6 metros.",
    "El Valle de Cocora es famoso por sus palmas de cera, el árbol nacional de Colombia.",
    "El Parque Nacional Natural Los Nevados alberga tres de los volcanes más altos de Colombia.",
    "La flor de mayo (Cattleya trianae) es la flor nacional de Colombia.",
    "El tití cabeciblanco es un primate endémico de Colombia, en peligro crítico de extinción.",
    "El río Caño Cristales, conocido como el 'río de los cinco colores', es un espectáculo natural único.",
    "El Parque Nacional Natural Chiribiquete es el área protegida más grande de Colombia, con pinturas rupestres milenarias.",
    "La rana dorada venenosa es una de las especies más tóxicas del mundo y vive en la costa del Pacífico colombiano."
];

// Función para mezclar la lista de datos
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Generar árboles
const treePositions = [50, 250, 300, 500, 750];
trees = treePositions.map(x => ({
    x: x,
    height: Math.random() * 50 + 40,
    swayOffset: 0
}));

// Generar nubes
clouds = Array.from({ length: 3 }, (_, i) => ({
    x: i * 250 + 50,
    y: Math.random() * 60 + 20,
    baseY: Math.random() * 60 + 20,
    speed: Math.random() * 0.5 + 0.3,
    floatOffset: 0
}));

// Generar señales de tráfico
const signPositions = [100, 350, 600];
trafficSigns = signPositions.map((x, i) => ({
    x: x,
    lightOffset: Math.random() * 3,
    colorIndex: i % trafficColors.length,
    speed: 0
}));

// Generar obstáculos
function initializeRoadBlocks() {
    roadBlocks = [];
}

// Generar grupo de aves en forma de V
function createBirdGroup(isInitial = true) {
    const leaderX = isInitial ? 400 + (Math.random() * 400 - 200) : -50 - Math.random() * 200;
    const leaderY = Math.random() * 80 + 50;
    const baseSpeed = 1 + Math.random() * currentLevel;
    const rotation = Math.random() * 0.2 - 0.1;
    const cosAngle = Math.cos(PI / 4 + rotation);
    const sinAngle = Math.sin(PI / 4 + rotation);
    let birds = [{
        x: leaderX,
        y: leaderY,
        targetX: leaderX,
        targetY: leaderY,
        baseY: leaderY,
        offset: 0,
        wingAngle: 0,
        speed: baseSpeed,
        scale: 0.8 + (leaderY - 50) / 100,
        leader: true,
        rotation: rotation
    }];
    for (let i = 1; i <= 3; i++) {
        const offsetX = i * 20 * cosAngle;
        const offsetY = i * 20 * sinAngle;
        birds.push({
            x: leaderX - offsetX,
            y: leaderY + offsetY,
            targetX: leaderX - offsetX,
            targetY: leaderY + offsetY,
            baseY: leaderY,
            offset: 0,
            wingAngle: 0,
            speed: baseSpeed * (0.9 + Math.random() * 0.2),
            scale: 0.8 + (leaderY - 50) / 100,
            leader: false,
            rotation: rotation
        });
        birds.push({
            x: leaderX + offsetX,
            y: leaderY + offsetY,
            targetX: leaderX + offsetX,
            targetY: leaderY + offsetY,
            baseY: leaderY,
            offset: 0,
            wingAngle: 0,
            speed: baseSpeed * (0.9 + Math.random() * 0.2),
            scale: 0.8 + (leaderY - 50) / 100,
            leader: false,
            rotation: rotation
        });
    }
    return birds;
}

// Inicializar aves
function initializeBirds() {
    birdGroups = [];
    let numGroups = Math.min(2 + currentLevel, 5);
    if (currentLevel >= 5) numGroups = Math.min(3 + currentLevel, 6);
    const minDistance = 100;
    let positions = [];
    for (let i = 0; i < numGroups; i++) {
        let validPosition = false;
        let leaderX;
        let attempts = 0;
        while (!validPosition && attempts < 10) {
            leaderX = 400 + (Math.random() * 400 - 200);
            validPosition = positions.every(pos => Math.abs(pos - leaderX) > minDistance);
            attempts++;
        }
        if (validPosition) {
            positions.push(leaderX);
            birdGroups.push(createBirdGroup(true));
        }
    }
}
initializeBirds();

// Configurar controles de teclado
function setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                keys.left = true;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                keys.right = true;
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (currentLevel >= 3 && !isJumping) {
                    keys.up = true;
                    busVerticalVelocity = jumpStrength;
                    isJumping = true;
                    jumpTime = 0;
                }
                break;
        }
    });

    document.addEventListener('keyup', (e) => {
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                keys.left = false;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                keys.right = false;
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
                keys.up = false;
                break;
        }
    });
}

// Actualizar movimiento con teclas
function updateMovement(deltaTime) {
    const airControlFactor = isJumping ? 0.7 : 1;
    busVelocity = keys.right ? busSpeed * airControlFactor : 
                  keys.left ? -busSpeed * airControlFactor : 0;
    
    busX = Math.max(-80, Math.min(busX + busVelocity * deltaTime, canvasWidth - 80));

    if (currentLevel >= 3) {
        if (isJumping && keys.up && jumpTime < maxJumpTime) {
            busVerticalVelocity = jumpStrength;
            jumpTime += deltaTime;
        } else {
            busVerticalVelocity += gravity * deltaTime;
        }

        busY += busVerticalVelocity * deltaTime;

        if (busY >= GROUND_Y) {
            busY = GROUND_Y;
            busVerticalVelocity = 0;
            isJumping = false;
            jumpTime = 0;
        }
    }
}

// Pantalla de inicio con partículas
function drawStartScreen(timestamp) {
    const startScreenColors = getLevelColors(0.25);
    ctx.fillStyle = startScreenColors.sky;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    updateWelcomeParticles(0.016);
    drawWelcomeParticles();

    ctx.fillStyle = '#2E7D32';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ElBus_Arte', 400, 150);
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.fillText('Usa ←/A y →/D para mover el bus', 400, 220);
    ctx.fillText('En nivel 3+, usa ↑/W para saltar', 400, 250);
    ctx.fillText('Detente en las estaciones para aprender', 400, 280);
    const pulse = Math.sin(timestamp * 0.005) * 0.2 + 0.8;
    ctx.fillStyle = `rgba(76, 175, 80, ${pulse})`;
    ctx.fillRect(350, 320, 100, 40);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Iniciar', 400, 345);
    ctx.font = '14px Arial';
    ctx.fillText('(¡Sol, luna y cultura colombiana!)', 400, 380);
}

// Pantalla de créditos
function drawCreditsScreen() {
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#2E7D32';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ElBus_Arte', 400, 150);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('Produce Ryu33', 400, 220);
    ctx.font = '20px Arial';
    ctx.fillText('¡Gracias por jugar!', 400, 270);
    ctx.fillText('Haz clic para volver al inicio', 400, 320);
}

// Listener para iniciar el juego y la melodía, y manejar los créditos
canvas.addEventListener('click', (e) => {
    if (gameState === 'start') {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (x >= 350 && x <= 450 && y >= 320 && y <= 360) {
            gameState = 'playing';
            resetLevel();
            backgroundMusic.play().catch(() => {
                console.log('La reproducción automática fue bloqueada.');
            });
        }
    } else if (gameState === 'credits') {
        gameState = 'start';
        currentLevel = 1;
        resetLevel();
    }
});

// Interpolación de colores con easing
function lerpColor(color1, color2, factor) {
    const easeFactor = factor < 0.5 ? 2 * factor * factor : 1 - Math.pow(-2 * factor + 2, 2) / 2;
    const result = color1.map((c1, index) => {
        const c2 = color2[index];
        return c1 + easeFactor * (c2 - c1);
    });
    return `rgb(${Math.round(result[0])}, ${Math.round(result[1])}, ${Math.round(result[2])})`;
}

// Paleta de colores según nivel y ciclo día/noche
function getLevelColors(progress) {
    let dayColors, nightColors, dawnColors, duskColors;
    let baseColors;

    if (currentLevel === 1) {
        baseColors = { sky: [135, 206, 235], hill: [46, 125, 50], grass: [76, 175, 80], grassDetail: [61, 139, 64], treeLeaves: [27, 94, 32], clouds: [255, 255, 255] };
    } else if (currentLevel === 2) {
        baseColors = { sky: [255, 204, 188], hill: [245, 124, 0], grass: [255, 179, 0], grassDetail: [61, 139, 64], treeLeaves: [27, 94, 32], clouds: [255, 255, 255] };
    } else if (currentLevel === 3) {
        baseColors = { sky: [26, 35, 126], hill: [40, 53, 147], grass: [57, 73, 171], grassDetail: [92, 107, 192], treeLeaves: [76, 175, 80], clouds: [176, 190, 197] };
    } else {
        baseColors = { sky: [135, 206, 235], hill: [46, 125, 50], grass: [76, 175, 80], grassDetail: [61, 139, 64], treeLeaves: [27, 94, 32], clouds: [255, 255, 255] };
    }

    dayColors = baseColors;
    nightColors = { sky: [30, 30, 80], hill: [30, 30, 60], grass: [20, 20, 50], grassDetail: [15, 15, 40], treeLeaves: [10, 10, 30], clouds: [50, 50, 70] };
    dawnColors = { sky: [120, 100, 180], hill: [100, 80, 140], grass: [90, 70, 120], grassDetail: [80, 60, 100], treeLeaves: [70, 50, 90], clouds: [150, 130, 180] };
    duskColors = { sky: [180, 120, 100], hill: [160, 100, 80], grass: [140, 80, 60], grassDetail: [120, 60, 40], treeLeaves: [100, 40, 20], clouds: [190, 140, 120] };

    let currentSkyColor, currentHillColor, currentGrassColor, currentGrassDetailColor, currentTreeLeavesColor, currentCloudColor;

    if (progress < 0.25) {
        currentSkyColor = lerpColor(nightColors.sky, dawnColors.sky, progress / 0.25);
        currentHillColor = lerpColor(nightColors.hill, dawnColors.hill, progress / 0.25);
        currentGrassColor = lerpColor(nightColors.grass, dawnColors.grass, progress / 0.25);
        currentGrassDetailColor = lerpColor(nightColors.grassDetail, dawnColors.grassDetail, progress / 0.25);
        currentTreeLeavesColor = lerpColor(nightColors.treeLeaves, dawnColors.treeLeaves, progress / 0.25);
        currentCloudColor = lerpColor(nightColors.clouds, dawnColors.clouds, progress / 0.25);
    } else if (progress < 0.5) {
        currentSkyColor = lerpColor(dawnColors.sky, dayColors.sky, (progress - 0.25) / 0.25);
        currentHillColor = lerpColor(dawnColors.hill, dayColors.hill, (progress - 0.25) / 0.25);
        currentGrassColor = lerpColor(dawnColors.grass, dayColors.grass, (progress - 0.25) / 0.25);
        currentGrassDetailColor = lerpColor(dawnColors.grassDetail, dayColors.grassDetail, (progress - 0.25) / 0.25);
        currentTreeLeavesColor = lerpColor(dawnColors.treeLeaves, dayColors.treeLeaves, (progress - 0.25) / 0.25);
        currentCloudColor = lerpColor(dawnColors.clouds, dayColors.clouds, (progress - 0.25) / 0.25);
    } else if (progress < 0.75) {
        currentSkyColor = lerpColor(dayColors.sky, duskColors.sky, (progress - 0.5) / 0.25);
        currentHillColor = lerpColor(dayColors.hill, duskColors.hill, (progress - 0.5) / 0.25);
        currentGrassColor = lerpColor(dayColors.grass, duskColors.grass, (progress - 0.5) / 0.25);
        currentGrassDetailColor = lerpColor(dayColors.grassDetail, duskColors.grassDetail, (progress - 0.5) / 0.25);
        currentTreeLeavesColor = lerpColor(dayColors.treeLeaves, duskColors.treeLeaves, (progress - 0.5) / 0.25);
        currentCloudColor = lerpColor(dayColors.clouds, duskColors.clouds, (progress - 0.5) / 0.25);
    } else {
        currentSkyColor = lerpColor(duskColors.sky, nightColors.sky, (progress - 0.75) / 0.25);
        currentHillColor = lerpColor(duskColors.hill, nightColors.hill, (progress - 0.75) / 0.25);
        currentGrassColor = lerpColor(duskColors.grass, nightColors.grass, (progress - 0.75) / 0.25);
        currentGrassDetailColor = lerpColor(duskColors.grassDetail, nightColors.grassDetail, (progress - 0.75) / 0.25);
        currentTreeLeavesColor = lerpColor(duskColors.treeLeaves, nightColors.treeLeaves, (progress - 0.75) / 0.25);
        currentCloudColor = lerpColor(duskColors.clouds, nightColors.clouds, (progress - 0.75) / 0.25);
    }

    return {
        sky: currentSkyColor,
        hill: currentHillColor,
        grass: currentGrassColor,
        grassDetail: currentGrassDetailColor,
        treeLeaves: currentTreeLeavesColor,
        clouds: currentCloudColor
    };
}

// Fondo con ajustes por nivel y ciclo día/noche
function drawBackground() {
    const levelColors = getLevelColors(cycleProgress);
    ctx.fillStyle = levelColors.sky;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = levelColors.hill;
    ctx.beginPath();
    ctx.moveTo(0, 300);
    ctx.lineTo(150, 120);
    ctx.lineTo(300, 200);
    ctx.lineTo(450, 150);
    ctx.lineTo(600, 220);
    ctx.lineTo(800, 100);
    ctx.lineTo(800, 400);
    ctx.lineTo(0, 400);
    ctx.fill();

    ctx.fillStyle = levelColors.grass;
    ctx.fillRect(0, 300, canvasWidth, 100);
    ctx.fillStyle = levelColors.grassDetail;
    for (let i = 0; i < canvasWidth; i += 10) {
        ctx.fillRect(i, 300, 5, 10);
    }

    trees.forEach(tree => {
        const sway = Math.sin(tree.swayOffset) * 5;
        ctx.fillStyle = '#3E2723';
        ctx.save();
        ctx.translate(tree.x, 300);
        ctx.rotate(sway * PI / 180);
        ctx.fillRect(-5, -tree.height, 10, tree.height);
        ctx.restore();

        ctx.fillStyle = levelColors.treeLeaves;
        ctx.beginPath();
        ctx.arc(tree.x + sway, 300 - tree.height - 20, 20, 0, TWO_PI);
        ctx.fill();
    });

    clouds.forEach(cloud => {
        ctx.fillStyle = levelColors.clouds;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, 20, 0, TWO_PI);
        ctx.arc(cloud.x + 25, cloud.y, 15, 0, TWO_PI);
        ctx.arc(cloud.x + 10, cloud.y - 10, 15, 0, TWO_PI);
        ctx.fill();
    });
}

// Dibujar el sol
function drawSun(progress) {
    const sunX = canvasWidth * progress;
    const sunY = 100 + Math.sin(progress * PI) * 50;
    const sunAlpha = Math.sin(progress * PI);

    ctx.fillStyle = `rgba(255, 215, 0, ${sunAlpha})`;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 20, 0, TWO_PI);
    ctx.fill();
}

// Dibujar la luna
function drawMoon(progress) {
    const moonX = canvasWidth * (1 - progress);
    const moonY = 100 + Math.sin((1 - progress) * PI) * 50;
    const moonAlpha = Math.sin((1 - progress) * PI);

    ctx.fillStyle = `rgba(255, 255, 255, ${moonAlpha})`;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 15, 0, TWO_PI);
    ctx.fill();

    ctx.fillStyle = `rgba(50, 50, 50, ${moonAlpha})`;
    ctx.beginPath();
    ctx.arc(moonX + 5, moonY, 15, 0, TWO_PI);
    ctx.fill();
}

// Bus con detalles adicionales
function drawBus() {
    ctx.save();
    const tilt = isJumping ? Math.sin(busVerticalVelocity * 0.05) * 0.2 : 0;
    const squash = isJumping ? 1 - Math.abs(busVerticalVelocity) * 0.001 : 1;
    const stretch = isJumping ? 1 + Math.abs(busVerticalVelocity) * 0.001 : 1;
    ctx.translate(busX + 40, busY + 15);
    ctx.rotate(tilt);
    ctx.scale(squash, stretch);
    ctx.translate(-40, -15);

    ctx.fillStyle = '#FFD700';
    ctx.fillRect(0, 0, 80, 30);

    ctx.fillStyle = '#FFA000';
    ctx.fillRect(5, -5, 70, 5);

    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(0, 10, 5, 5);
    ctx.fillRect(0, 20, 5, 5);

    ctx.fillStyle = '#B0E0E6';
    ctx.fillRect(5, 5, 15, 20);

    ctx.fillStyle = '#8D6E63';
    ctx.beginPath();
    ctx.arc(15, 15, 5, 0, TWO_PI);
    ctx.fill();
    ctx.fillStyle = '#424242';
    ctx.fillRect(10, 20, 10, 10);

    ctx.fillStyle = '#B0E0E6';
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(25 + (i * 17), 2, 12, 12);
    }

    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(20, 30, 8, 0, TWO_PI);
    ctx.arc(60, 30, 8, 0, TWO_PI);
    ctx.fill();

    ctx.fillStyle = '#D81B60';
    ctx.fillRect(75, 2, 5, 10);

    ctx.restore();
}

// Estaciones animadas
function drawStations() {
    stations.forEach(station => {
        const sway = Math.sin(station.swayOffset) * 3;
        const bounce = Math.sin(station.bounceOffset) * 2;
        const lightIntensity = Math.sin(station.lightTimer) * 0.5 + 0.5;
        ctx.fillStyle = '#616161';
        ctx.fillRect(station.x, 240 + bounce, 40, 60);

        ctx.fillStyle = '#D32F2F';
        ctx.save();
        ctx.translate(station.x + 20, 240 + bounce);
        ctx.rotate(sway * PI / 180);
        ctx.beginPath();
        ctx.moveTo(-25, 0);
        ctx.lineTo(25, 0);
        ctx.lineTo(0, -20);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = `rgba(255, 255, 150, ${lightIntensity})`;
        ctx.fillRect(station.x + 10, 260 + bounce, 20, 20);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(station.x + 10, 260 + bounce, 20, 20);
    });
}

// Señales de tráfico
function drawTrafficSigns() {
    trafficSigns.forEach(sign => {
        const pulse = Math.sin(sign.lightOffset) * 0.3 + 0.7;
        const colorCycle = Math.floor(sign.lightOffset / 2) % trafficColors.length;

        ctx.fillStyle = '#666666';
        ctx.fillRect(sign.x - 2, 260, 4, 40);

        ctx.fillStyle = `${trafficColors[colorCycle]}${pulse})`;
        ctx.beginPath();
        ctx.arc(sign.x, 250, 8, 0, TWO_PI);
        ctx.fill();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sign.x, 250, 8, 0, TWO_PI);
        ctx.stroke();
    });
}

// Obstáculos
function drawRoadBlocks() {
    // Implementación futura
}

// Aves animadas
function drawBirds() {
    birdGroups.forEach(group => {
        group.forEach(bird => {
            ctx.save();
            ctx.translate(bird.x, bird.y);
            ctx.scale(bird.scale, bird.scale);
            ctx.rotate(bird.rotation + Math.sin(bird.offset) * 0.1);

            const bodyColor = '#424242';
            const wingColor = '#616161';

            const wingOffset = Math.sin(bird.wingAngle) * 6;
            ctx.fillStyle = wingColor;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-10, 5 + wingOffset);
            ctx.lineTo(10, 5 - wingOffset);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = bodyColor;
            ctx.beginPath();
            ctx.ellipse(0, 0, 8, 4, 0, 0, TWO_PI);
            ctx.fill();

            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.moveTo(8, 0);
            ctx.lineTo(12, -2);
            ctx.lineTo(12, 2);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        });
    });
}

// Cuadro de diálogo
function drawDialog() {
    if (currentFact) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(200, 50, 400, 100);
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.strokeRect(200, 50, 400, 100);
        ctx.fillStyle = '#000000';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        const wrappedText = wrapText(currentFact, 380);
        wrappedText.forEach((line, index) => ctx.fillText(line, 400, 80 + index * 20));
    }

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Nivel ${currentLevel}`, 20, 30);
    ctx.fillText(`Estaciones: ${stationsVisited}/${stations.length}`, 20, 60);
}

function wrapText(text, maxWidth) {
    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width <= maxWidth) {
            currentLine = testLine;
        } else {
            lines.push(currentLine);
            currentLine = words[i];
        }
    }
    lines.push(currentLine);
    return lines;
}

// Mostrar info y cambiar nivel o ir a créditos
function showInfo(deltaTime) {
    const nearStation = stations.find(station =>
        busX >= station.x - 80 && busX <= station.x + 40 && !station.visited
    );

    if (nearStation && busVelocity === 0 && !stoppedAtStation && busY >= GROUND_Y) {
        stoppedAtStation = true;
        nearStation.visited = true;
        stationsVisited++;
        currentFact = nearStation.fact;
        factTimer = 5;
    }

    if (factTimer > 0) {
        factTimer -= deltaTime;
        if (factTimer <= 0) {
            currentFact = "";
            stoppedAtStation = false;
            if (stationsVisited === stations.length && currentLevel < 8) {
                currentLevel++;
                resetLevel();
            } else if (stationsVisited === stations.length && currentLevel === 8) {
                gameState = 'credits';
            }
        }
    }
}

// Reiniciar nivel con datos únicos
function resetLevel() {
    busX = 0;
    busY = GROUND_Y;
    busVelocity = 0;
    busVerticalVelocity = 0;
    isJumping = false;
    jumpTime = 0;
    stationsVisited = 0;
    stoppedAtStation = false;
    currentFact = "";
    factTimer = 0;
    const shuffledFacts = shuffleArray([...facts]);
    stations.forEach((station, index) => {
        station.fact = shuffledFacts[index];
        station.visited = false;
    });
    initializeBirds();
    initializeRoadBlocks();
    cycleProgress = 0;
    smokeParticles = [];
    busSpeed = 50 + (currentLevel - 1) * 10;
}

// Crear partícula de humo para el autobús
function createSmokeParticle() {
    return {
        x: busX + 10,
        y: busY + 25,
        vx: -busVelocity / 5 + (Math.random() - 0.5) * particleVelocityX,
        vy: -Math.random() * particleVelocityY,
        size: particleSize,
        alpha: 1,
        lifespan: Math.random() * particleLifespan
    };
}

// Actualizar partículas de humo del autobús
function updateSmokeParticles(deltaTime) {
    if (busVelocity !== 0) {
        for (let i = 0; i < particleSpawnRate * deltaTime; i++) {
            smokeParticles.push(createSmokeParticle());
        }
    }

    for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const p = smokeParticles[i];
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.lifespan -= deltaTime;
        p.alpha -= particleFadeSpeed * deltaTime;
        p.size -= 0.5 * deltaTime;

        if (p.lifespan <= 0 || p.alpha <= 0) {
            smokeParticles.splice(i, 1);
        }
    }
}

// Dibujar partículas de humo del autobús
function drawSmokeParticles() {
    smokeParticles.forEach(p => {
        ctx.fillStyle = `rgba(128, 128, 128, ${Math.max(0, p.alpha)})`;
        ctx.fillRect(p.x, p.y, Math.max(0, p.size), Math.max(0, p.size));
    });
}

// Crear partícula de bienvenida
function createWelcomeParticle() {
    return {
        x: Math.random() * canvasWidth,
        y: canvasHeight,
        vx: (Math.random() - 0.5) * 10,
        vy: welcomeParticleVelocityY + (Math.random() - 0.5) * 10,
        size: welcomeParticleSize + Math.random() * 2,
        alpha: 1,
        lifespan: welcomeParticleLifespan
    };
}

// Actualizar partículas de bienvenida
function updateWelcomeParticles(deltaTime) {
    const particlesToAdd = welcomeParticleSpawnRate * deltaTime;
    for (let i = 0; i < particlesToAdd; i++) {
        welcomeParticles.push(createWelcomeParticle());
    }

    for (let i = welcomeParticles.length - 1; i >= 0; i--) {
        const p = welcomeParticles[i];
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.lifespan -= deltaTime;
        p.alpha -= welcomeParticleFadeSpeed * deltaTime;
        p.size -= 0.1 * deltaTime;

        if (p.lifespan <= 0 || p.alpha <= 0 || p.y < 0) {
            welcomeParticles.splice(i, 1);
        }
    }
}

// Dibujar partículas de bienvenida
function drawWelcomeParticles() {
    welcomeParticles.forEach(p => {
        ctx.fillStyle = `rgba(192, 192, 192, ${Math.max(0, p.alpha)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0, p.size), 0, PI * 2);
        ctx.fill();
    });
}

// Animación principal
function gameLoop(timestamp) {
    if (lastTime === null) lastTime = timestamp;
    const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (gameState === 'start') {
        drawStartScreen(timestamp);
    } else if (gameState === 'playing') {
        cycleProgress += deltaTime / dayNightCycleTime;
        cycleProgress %= 1;

        updateSmokeParticles(deltaTime);
        updateMovement(deltaTime);

        drawBackground();
        drawSun(cycleProgress);
        drawMoon(cycleProgress);
        drawStations();
        drawTrafficSigns();
        drawRoadBlocks();
        drawBus();
        drawBirds();
        drawSmokeParticles();
        showInfo(deltaTime);
        drawDialog();

        const levelSpeedFactor = 1 + currentLevel * 0.8;

        clouds.forEach(cloud => {
            cloud.x += cloud.speed * deltaTime * levelSpeedFactor;
            cloud.floatOffset += deltaTime;
            cloud.y = cloud.baseY + Math.sin(cloud.floatOffset) * 5;
            if (cloud.x > canvasWidth) cloud.x = -60;
        });

        birdGroups.forEach((group, index) => {
            const leader = group[0];
            leader.x += leader.speed * deltaTime * levelSpeedFactor;
            leader.offset += deltaTime * 2;
            leader.y = leader.baseY + Math.sin(leader.offset) * 10;
            leader.wingAngle += deltaTime * 12;
            leader.rotation += Math.sin(leader.offset) * 0.01;

            group.forEach((bird, birdIndex) => {
                if (!bird.leader) {
                    const angle = PI / 4 + leader.rotation;
                    const cosAngle = Math.cos(angle);
                    const sinAngle = Math.sin(angle);
                    bird.targetX = leader.x - (birdIndex % 2 === 0 ? -(birdIndex + 1) / 2 : (birdIndex + 1) / 2) * 20 * cosAngle;
                    bird.targetY = leader.y + (birdIndex + 1) / 2 * 20 * sinAngle;
                    bird.x += (bird.targetX - bird.x) * 0.1 + bird.speed * deltaTime * levelSpeedFactor;
                    bird.y += (bird.targetY - bird.y) * 0.1;
                    bird.offset += deltaTime * 2;
                    bird.wingAngle += deltaTime * 12;
                }
            });

            if (leader.x > canvasWidth + 50) {
                birdGroups[index] = createBirdGroup(false);
            }
        });

        trees.forEach((tree, index) => {
            tree.swayOffset += deltaTime * (1 + index * 0.2);
        });

        stations.forEach((station, index) => {
            station.swayOffset += deltaTime * (1.5 + index * 0.3);
            station.bounceOffset += deltaTime * (2 + index * 0.4);
            station.lightTimer += deltaTime * (3 + index * 0.5);
        });

        if (currentLevel >= 2) {
            trafficSigns.forEach(sign => {
                sign.lightOffset += deltaTime * 1.5;
                sign.x += sign.speed * deltaTime;
                if (sign.x > canvasWidth) sign.x = -10;
                if (sign.x < -10) sign.x = canvasWidth;
            });
        }
    } else if (gameState === 'credits') {
        drawCreditsScreen();
    }

    requestAnimationFrame(gameLoop);
}

// Inicialización
setupKeyboardControls();
requestAnimationFrame(gameLoop);