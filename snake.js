const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
let tileCount = Math.floor(canvas.width / gridSize);

let snake = [{x: 10, y: 10}];
let direction = {x: 0, y: 0};
let apple = {x: 15, y: 15};
let score = 0;
let gameOver = false;
let lastTime = 0;
let speed = 150; // Скорость в миллисекундах (меньше = быстрее)
let snakePos = {x: snake[0].x, y: snake[0].y}; // Текущая "плавная" позиция

function resizeCanvas() {
    const size = Math.min(window.innerWidth * 0.9, 400);
    canvas.width = size;
    canvas.height = size;
    tileCount = Math.floor(size / gridSize);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSnake();
    drawApple();
}

function drawSnake() {
    ctx.fillStyle = 'green';
    // Рисуем змейку с интерполированной позицией для головы
    ctx.fillRect(snakePos.x * gridSize, snakePos.y * gridSize, gridSize, gridSize);
    for (let i = 1; i < snake.length; i++) {
        ctx.fillRect(snake[i].x * gridSize, snake[i].y * gridSize, gridSize, gridSize);
    }
}

function drawApple() {
    ctx.fillStyle = 'red';
    ctx.fillRect(apple.x * gridSize, apple.y * gridSize, gridSize, gridSize);
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
    snakePos = {x: head.x, y: head.y}; // Обновляем целевую позицию
}

function generateApple() {
    apple.x = Math.floor(Math.random() * tileCount);
    apple.y = Math.floor(Math.random() * tileCount);
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver = true;
    }
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
    ctx.fillText('Нажмите любую клавишу', canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText('чтобы начать заново', canvas.width / 2, canvas.height / 2 + 40);
}

function gameLoop(timestamp) {
    if (gameOver) {
        showGameOver();
        return;
    }

    // Обновляем логику движения с заданной скоростью
    if (timestamp - lastTime >= speed) {
        moveSnake();
        checkCollision();
        lastTime = timestamp;
    }

    // Интерполяция (пока упрощённая, но можно улучшить)
    draw();
    requestAnimationFrame(gameLoop);
}

function restartGame() {
    snake = [{x: 10, y: 10}];
    direction = {x: 0, y: 0};
    snakePos = {x: 10, y: 10};
    score = 0;
    document.getElementById('score').innerText = 'Счет: ' + score;
    generateApple();
    gameOver = false;
    lastTime = 0;
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
