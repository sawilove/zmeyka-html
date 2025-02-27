const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
let tileCount = Math.floor(canvas.width / gridSize);

let snake = [{x: 10, y: 10}];
let direction = {x: 0, y: 0};
let apple = {x: 15, y: 15};
let score = 0;
let gameOver = false;
let oldSnake = [];
let lastTickTime = 0;
const tickInterval = 100; // Оставляем 100 мс для комфортной скорости, без адаптации для мобильных
const targetFPS = 30; // Устанавливаем целевую частоту интерполяции на 30 FPS
const frameInterval = 1000 / targetFPS; // Интервал между кадрами для 30 FPS (~33.3 мс)

// Загружаем лучший рекорд из localStorage или устанавливаем 0
let bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
document.getElementById('bestScore').innerText = `Рекорд: ${bestScore}`;

function resizeCanvas() {
    const size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9, 400);
    canvas.width = size;
    canvas.height = size;
    tileCount = Math.floor(size / gridSize);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function draw(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake(timestamp);
    drawApple();
}

function drawSnake(timestamp) {
    let delta = timestamp - lastTickTime;
    let factor = Math.min(delta / tickInterval, 1); // Убрано адаптивное увеличение для мобильных
    ctx.fillStyle = 'green';
    for (let i = 0; i < snake.length; i++) {
        let oldPos = i < oldSnake.length ? oldSnake[i] : snake[i];
        let newPos = snake[i];
        let renderX = oldPos.x + (newPos.x - oldPos.x) * factor;
        let renderY = oldPos.y + (newPos.y - oldPos.y) * factor;
        
        // Визуальное разделение сегментов с зазором (оставляем 2 пикселя между сегментами)
        const segmentSize = gridSize - 2; // Уменьшаем размер сегмента для зазора
        ctx.fillRect(
            renderX * gridSize + 1, // Сдвиг для зазора
            renderY * gridSize + 1,
            segmentSize,
            segmentSize
        );
    }
}

function drawApple() {
    ctx.fillStyle = 'red';
    ctx.fillRect(apple.x * gridSize + 2, apple.y * gridSize + 2, gridSize - 4, gridSize - 4); // С небольшим зазором
}

function moveSnake() {
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    snake.unshift(head);
    if (head.x === apple.x && head.y === apple.y) {
        score++;
        document.getElementById('score').innerText = 'Счет: ' + score;
        generateApple();
    } else {
        snake.pop();
    }
}

function generateApple() {
    apple.x = Math.floor(Math.random() * tileCount);
    apple.y = Math.floor(Math.random() * tileCount);
}

function checkCollision() {
    const head = snake[0];
    
    // Унифицированная проверка столкновений для всех устройств, только по голове
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver = true;
    }
    
    // Проверка столкновения с телом змейки (только по голове)
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            gameOver = true;
        }
    }
}

function showGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '20px "Pixelify Sans"';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    
    ctx.fillText('Игра окончена!', canvas.width / 2, canvas.height / 2 - 20);
    
    // Проверяем, побит ли рекорд
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore); // Сохраняем новый рекорд
        document.getElementById('bestScore').innerText = `Рекорд: ${bestScore}`;
        
        ctx.fillStyle = 'yellow'; // Жёлтый цвет для нового рекорда
        ctx.fillText(`Новый рекорд: ${score}!`, canvas.width / 2, canvas.height / 2 + 20);
    }
    
    ctx.fillText('Нажмите любую клавишу', canvas.width / 2, canvas.height / 2 + 50);
    ctx.fillText('чтобы начать заново', canvas.width / 2, canvas.height / 2 + 80);
}

function gameLoop(timestamp) {
    if (gameOver) {
        showGameOver();
        return;
    }
    
    // Ограничиваем отрисовку до 30 FPS
    if (timestamp - lastTickTime >= frameInterval) {
        if (timestamp - lastTickTime >= tickInterval) {
            oldSnake = snake.map(segment => ({x: segment.x, y: segment.y}));
            moveSnake();
            checkCollision();
            lastTickTime = timestamp;
        }
        draw(timestamp);
    }
    
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    snake = [{x: 10, y: 10}];
    direction = {x: 0, y: 0};
    score = 0;
    document.getElementById('score').innerText = 'Счет: ' + score;
    generateApple();
    gameOver = false;
    oldSnake = [];
    lastTickTime = 0;
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (gameOver) {
        restartGame();
    } else {
        switch (e.key) {
            case 'ArrowUp':
                if (direction.y === 0) direction = {x: 0, y: -1};
                break;
            case 'ArrowDown':
                if (direction.y === 0) direction = {x: 0, y: 1};
                break;
            case 'ArrowLeft':
                if (direction.x === 0) direction = {x: -1, y: 0};
                break;
            case 'ArrowRight':
                if (direction.x === 0) direction = {x: 1, y: 0};
                break;
        }
    }
});

document.getElementById('up').addEventListener('click', () => {
    if (direction.y === 0) direction = {x: 0, y: -1};
});
document.getElementById('down').addEventListener('click', () => {
    if (direction.y === 0) direction = {x: 0, y: 1};
});
document.getElementById('left').addEventListener('click', () => {
    if (direction.x === 0) direction = {x: -1, y: 0};
});
document.getElementById('right').addEventListener('click', () => {
    if (direction.x === 0) direction = {x: 1, y: 0};
});

canvas.addEventListener('touchstart', () => {
    if (gameOver) restartGame();
});

generateApple();
requestAnimationFrame(gameLoop);
