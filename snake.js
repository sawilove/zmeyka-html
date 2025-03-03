const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
let tileCount;
let snake = [{x: 10, y: 10}];
let direction = {x: 0, y: 0};
let apple = {x: 15, y: 15};
let score = 0;
let gameOver = false;
let oldSnake = [];
let lastTickTime = 0;
const tickInterval = 50;
const targetFPS = 10;
const frameInterval = 1000 / targetFPS;

let bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
document.getElementById('bestScore').innerText = `Рекорд: ${bestScore}`;

function resizeCanvas() {
    const size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9, 400);
    canvas.width = size;
    canvas.height = size;
    tileCount = Math.floor(size / gridSize);
    // Корректируем позиции змейки и яблока при изменении размера
    snake.forEach(segment => {
        segment.x = Math.min(Math.max(segment.x, 0), tileCount - 1);
        segment.y = Math.min(Math.max(segment.y, 0), tileCount - 1);
    });
    apple.x = Math.min(Math.max(apple.x, 0), tileCount - 1);
    apple.y = Math.min(Math.max(apple.y, 0), tileCount - 1);
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
    let factor = Math.min(delta / tickInterval, 1);
    ctx.fillStyle = 'green';
    for (let i = 0; i < snake.length; i++) {
        let oldPos = i < oldSnake.length ? oldSnake[i] : snake[i];
        let newPos = snake[i];
        let renderX = oldPos.x + (newPos.x - oldPos.x) * factor;
        let renderY = oldPos.y + (newPos.y - oldPos.y) * factor;
        const segmentSize = gridSize - 2;
        ctx.fillRect(renderX * gridSize + 1, renderY * gridSize + 1, segmentSize, segmentSize);
    }
}

function drawApple() {
    ctx.fillStyle = 'red';
    ctx.fillRect(apple.x * gridSize + 2, apple.y * gridSize + 2, gridSize - 4, gridSize - 4);
}

function moveSnake() {
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
    snake.unshift(head);
    if (Math.floor(head.x) === apple.x && Math.floor(head.y) === apple.y) {
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
    // Добавляем буфер для проверки границ
    if (head.x < -0.1 || head.x >= tileCount - 0.9 || head.y < -0.1 || head.y >= tileCount - 0.9) {
        gameOver = true;
    }
    // Проверка столкновения с телом с небольшой погрешностью
    for (let i = 1; i < snake.length; i++) {
        if (Math.abs(snake[i].x - head.x) < 0.1 && Math.abs(snake[i].y - head.y) < 0.1) {
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
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
        document.getElementById('bestScore').innerText = `Рекорд: ${bestScore}`;
        ctx.fillStyle = 'yellow';
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
                if (direction.y === 0) direction = {x: 0, y
