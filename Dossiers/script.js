const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d'); // Renderização em 2D

const originalRectSize = 50; // Tamanho original da barra
const rectSize = originalRectSize * 1.5; // Aumenta o tamanho da barra em 50%
const ballSize = 15;

let rectX;
let rectY;
let rectSpeed = 10; // Velocidade da barra

let balls = []; // Array vazio para as bolas
let ballSpeed = 1; // Diminuí a velocidade das bolas em 1 unidade
let score = 0;
let missedBalls = 0; // Contador de bolas perdidas
const maxMissedBalls = 10; // Limite de bolas perdidas

let isDragging = false; // Variável para saber se a barra está sendo arrastada
let offsetX; // Deslocamento do clique

// Carrega a imagem da barra
const barImage = new Image();
barImage.src = 'trave.png'; // Endereço da imagem

// Inicializa o recorde do jogo
let highScore = localStorage.getItem('highScore') || 0; // Recupera o recorde do localStorage ou define como 0

// Ajusta o tamanho do canvas para preencher a tela
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    rectX = (canvas.width - rectSize) / 2; // Recalcula a posição inicial da barra
    rectY = 10; // Barra reposicionada para o topo
}

// Função para desenhar a barra (imagem)
function drawRect() {
    ctx.drawImage(barImage, rectX, rectY, rectSize, rectSize); // Usa o novo tamanho para a imagem
}

// Função para desenhar as bolas
function drawBalls() {
    ctx.fillStyle = 'purple';
    for (const ball of balls) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballSize, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Atualiza a posição das bolas
function updateBalls() {
    for (const ball of balls) {
        ball.y -= ballSpeed; // As bolas agora se movem para cima
    }

    // Remove as bolas que saem do canvas pela parte superior e atualiza o contador de bolas perdidas
    balls = balls.filter(ball => {
        if (ball.y + ballSize < 0) {
            missedBalls++;
            return false;
        }
        return true;
    });

    // Verifica colisão e remove a bola
    for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];
        if (ball.y - ballSize < rectY + rectSize &&
            ball.x > rectX &&
            ball.x < rectX + rectSize) {
            score++;
            balls.splice(i, 1); // Remove a bola após a colisão
        }
    }
}

// Função para gerar uma nova bola aleatoriamente na parte inferior
function spawnBall() {
    if (Math.random() < 0.02) { // Ajusta a taxa de geração
        balls.push({
            x: Math.random() * canvas.width,
            y: canvas.height // As bolas começam na parte inferior
        });
    }
}

// Função para desenhar o placar (no canto superior esquerdo)
function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px "Jersey 15"'; // Tamanho ajustado para 20px

    const text = `Score: ${score} | Missed: ${missedBalls} | High Score: ${highScore}`;
    ctx.fillText(text, 10, 30); // Alinha o texto no canto superior esquerdo
}

// Função para desenhar a mensagem de fim de jogo
function drawEndGameMessage() {
    ctx.fillStyle = 'red';
    ctx.font = '40px "Jersey 15"';
    const text = 'Game Over!';
    const textWidth = ctx.measureText(text).width;
    const textHeight = 40; // Altura estimada do texto
    const centerX = (canvas.width - textWidth) / 2;
    const centerY = (canvas.height + textHeight) / 2;
    ctx.fillText(text, centerX, centerY);
}

// Função principal de atualização
function update() {
    if (missedBalls >= maxMissedBalls) {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
        drawEndGameMessage(); // Desenha a mensagem de fim de jogo

        // Atualiza o recorde se necessário
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore); // Salva o novo recorde no localStorage
        }

        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas
    drawRect(); // Desenha a barra
    drawBalls(); // Desenha as bolas
    updateBalls(); // Atualiza a posição das bolas
    spawnBall(); // Gera novas bolas
    drawScore(); // Desenha o placar
}

// Função para detectar se o mouse clicou na barra
canvas.addEventListener('mousedown', (event) => {
    const mouseX = event.offsetX;
    const mouseY = event.offsetY;
    
    // Verifica se o clique foi dentro da barra
    if (mouseX >= rectX && mouseX <= rectX + rectSize && mouseY >= rectY && mouseY <= rectY + rectSize) {
        isDragging = true;
        canvas.style.cursor = 'grabbing'; // Troca o cursor quando a barra for arrastada
        offsetX = mouseX - rectX; // Calcula o deslocamento
    }
});

// Função para mover a barra com o mouse
canvas.addEventListener('mousemove', (event) => {
    const mouseX = event.offsetX;

    if (isDragging) {
        rectX = mouseX - offsetX; // Atualiza a posição X da barra

        // Limita o movimento da barra dentro dos limites do canvas
        if (rectX < 0) rectX = 0;
        if (rectX + rectSize > canvas.width) rectX = canvas.width - rectSize;
    } else {
        // Verifica se o mouse está sobre a barra para mudar o cursor
        if (mouseX >= rectX && mouseX <= rectX + rectSize && event.offsetY >= rectY && event.offsetY <= rectY + rectSize) {
            canvas.style.cursor = 'pointer'; // Muda o cursor para pointer
        } else {
            canvas.style.cursor = 'default'; // Retorna ao cursor padrão
        }
    }
});

// Função para parar de mover a barra quando o mouse for solto
canvas.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = 'default'; // Volta o cursor ao padrão
});

// Função para mover a barra com as setas do teclado
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        rectX -= rectSpeed; // Move a barra para a esquerda
        if (rectX < 0) rectX = 0; // Limita o movimento à borda esquerda
    } else if (event.key === 'ArrowRight') {
        rectX += rectSpeed; // Move a barra para a direita
        if (rectX + rectSize > canvas.width) rectX = canvas.width - rectSize; // Limita o movimento à borda direita
    }
});

// Ajusta o canvas quando a janela for redimensionada
window.addEventListener('resize', resizeCanvas);

// Inicializa o tamanho do canvas
resizeCanvas();

// Usa requestAnimationFrame para atualizações suaves
function gameLoop() {
    update();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);