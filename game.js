// Simple Breakout Game
let canvas, ctx;
let score = 0;
let gameRunning = false;
let gamePaused = false;

// Paddle properties
let paddleWidth = 120;
let paddleHeight = 15;
let paddleX = 340;

// Ball properties
let ballRadius = 10;
let ballX = 400;
let ballY = 30; // Changed to start from top (ballRadius + small offset)
let ballSpeedX = 6;
let ballSpeedY = 8; // Changed to positive to move downward

// Ball trail properties
let ballTrail = [];
const maxTrailLength = 10;

// Particles system
let particles = [];
const maxParticles = 100;

// Blocks array
let blocks = [];

// Mouse controls
document.addEventListener("mousemove", mouseMoveHandler, false);

// Add resize event listener
window.addEventListener("resize", handleResize, false);

// Handle window resize
function handleResize() {
    if (canvas) {
        // Save current ball position relative to canvas
        const ballXRatio = ballX / canvas.width;
        const ballYRatio = ballY / canvas.height;
        const paddleXRatio = paddleX / canvas.width;

        // Resize canvas
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        // Recalculate ball and paddle positions
        ballX = ballXRatio * canvas.width;
        ballY = ballYRatio * canvas.height;
        paddleX = paddleXRatio * canvas.width;

        // Redraw everything if game is paused or not running
        if (!gameRunning || gamePaused) {
            drawBlocks();
            drawBall();
            drawPaddle();

            if (gamePaused) {
                // Re-draw "PAUSED" text
                ctx.font = "30px 'Courier New'";
                ctx.fillStyle = "#FFFF00";
                ctx.textAlign = "center";
                ctx.fillText("PAUSED", canvas.width/2, canvas.height/2);
            } else if (!gameRunning) {
                // Re-draw start message
                ctx.font = "30px 'Courier New'";
                ctx.fillStyle = "#FFFF00";
                ctx.textAlign = "center";
                ctx.fillText("MOVE MOUSE HERE TO START", canvas.width/2, canvas.height/2);
            }
        }
    }
}

// Add event listeners for mouse enter/leave
function setupCanvasEvents() {
    if (canvas) {
        canvas.addEventListener("mouseenter", function() {
            if (gamePaused && gameRunning) {
                resumeGame();
            } else if (!gameRunning) {
                startGame();
            }
        });

        canvas.addEventListener("mouseleave", function() {
            if (gameRunning && !gamePaused) {
                pauseGame();
            }
        });
    }
}

function mouseMoveHandler(e) {
    let rect = canvas.getBoundingClientRect();
    let relativeX = e.clientX - rect.left;

    // Keep paddle within boundaries
    if(relativeX > paddleWidth/2 && relativeX < canvas.width - paddleWidth/2) {
        paddleX = relativeX - paddleWidth/2;
    }
}

function createBlocks() {
    blocks = [];

    // Define the text to show with adjusted block sizes
    const lines = [
        { text: "ARCTIC", y: 70, blockSize: 15 },
        { text: "PENGUIN", y: 130, blockSize: 15 },
        { text: "STUDIO", y: 190, blockSize: 15 },
        { text: "MAKING GAMES", y: 250, blockSize: 10 },
        { text: "SINCE 1998", y: 290, blockSize: 10 }
    ];

    // Create blocks for each line of text
    lines.forEach(line => {
        const letterWidth = line.blockSize * 5; // Slightly narrower letters
        const letterSpacing = line.blockSize * 1.5; // Less spacing between letters
        const totalWidth = line.text.length * (letterWidth + letterSpacing) - letterSpacing; // Subtract last spacing
        let startX = (canvas.width - totalWidth) / 2;

        for (let i = 0; i < line.text.length; i++) {
            const letter = line.text[i];

            if (letter === " ") {
                startX += letterWidth + letterSpacing;
                continue;
            }

            // Use bold colors with high contrast
            let color;
            switch (i % 4) {
                case 0: color = "#FF0000"; break; // Red
                case 1: color = "#00FF00"; break; // Green
                case 2: color = "#00FFFF"; break; // Cyan
                case 3: color = "#FFFF00"; break; // Yellow
            }

            // Create letter blocks
            createLetter(letter, startX, line.y, line.blockSize, color);
            startX += letterWidth + letterSpacing;
        }
    });
}

function createLetter(letter, x, y, size, color) {
    const patterns = {
        'A': [
            '  ###  ',
            ' ## ## ',
            '##   ##',
            '#######',
            '##   ##'
        ],
        'B': [
            '###### ',
            '##   ##',
            '###### ',
            '##   ##',
            '###### '
        ],
        'C': [
            ' ##### ',
            '###    ',
            '###    ',
            '###    ',
            ' ##### '
        ],
        'D': [
            '###### ',
            '##   ##',
            '##   ##',
            '##   ##',
            '###### '
        ],
        'E': [
            '#######',
            '###    ',
            '#####  ',
            '###    ',
            '#######'
        ],
        'F': [
            '#######',
            '###    ',
            '#####  ',
            '###    ',
            '###    '
        ],
        'G': [
            ' ##### ',
            '###    ',
            '### ###',
            '###  ##',
            ' ##### '
        ],
        'H': [
            '##   ##',
            '##   ##',
            '#######',
            '##   ##',
            '##   ##'
        ],
        'I': [
            '#######',
            '  ###  ',
            '  ###  ',
            '  ###  ',
            '#######'
        ],
        'J': [
            '    ###',
            '    ###',
            '    ###',
            '##  ###',
            ' ##### '
        ],
        'K': [
            '##   ##',
            '##  ## ',
            '##### ',
            '##  ## ',
            '##   ##'
        ],
        'L': [
            '###    ',
            '###    ',
            '###    ',
            '###    ',
            '#######'
        ],
        'M': [
            '##   ##',
            '### ###',
            '## # ##',
            '##   ##',
            '##   ##'
        ],
        'N': [
            '##   ##',
            '###  ##',
            '## # ##',
            '##  ###',
            '##   ##'
        ],
        'O': [
            ' ##### ',
            '##   ##',
            '##   ##',
            '##   ##',
            ' ##### '
        ],
        'P': [
            '###### ',
            '##   ##',
            '###### ',
            '###    ',
            '###    '
        ],
        'R': [
            '###### ',
            '##   ##',
            '###### ',
            '##  ## ',
            '##   ##'
        ],
        'S': [
            ' ######',
            '###    ',
            ' ##### ',
            '    ###',
            '###### '
        ],
        'T': [
            '#######',
            '  ###  ',
            '  ###  ',
            '  ###  ',
            '  ###  '
        ],
        'U': [
            '##   ##',
            '##   ##',
            '##   ##',
            '##   ##',
            ' ##### '
        ],
        'V': [
            '##   ##',
            '##   ##',
            '##   ##',
            ' ## ## ',
            '  ###  '
        ],
        'W': [
            '##   ##',
            '##   ##',
            '## # ##',
            '### ###',
            '##   ##'
        ],
        'X': [
            '##   ##',
            ' ## ## ',
            '  ###  ',
            ' ## ## ',
            '##   ##'
        ],
        'Y': [
            '##   ##',
            ' ## ## ',
            '  ###  ',
            '  ###  ',
            '  ###  '
        ],
        'Z': [
            '#######',
            '    ## ',
            '  ###  ',
            ' ##    ',
            '#######'
        ],
        '1': [
            '  ###  ',
            ' ####  ',
            '  ###  ',
            '  ###  ',
            '#######'
        ],
        '9': [
            ' ##### ',
            '##   ##',
            ' ######',
            '    ###',
            ' ##### '
        ],
        '8': [
            ' ##### ',
            '##   ##',
            ' ##### ',
            '##   ##',
            ' ##### '
        ],
        '0': [
            ' ##### ',
            '##   ##',
            '##   ##',
            '##   ##',
            ' ##### '
        ]
    };

    const pattern = patterns[letter] || patterns['O'];

    for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
            if (pattern[row][col] === '#') {
                blocks.push({
                    x: x + col * (size/2),
                    y: y + row * (size/2),
                    width: size/2,
                    height: size/2,
                    status: 1,
                    color: color
                });
            }
        }
    }
}

// Create particle effect when block is destroyed
function createBlockParticles(x, y, color) {
    const particleCount = 15; // Number of particles per block

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2; // Random angle
        const speed = 1 + Math.random() * 3; // Random speed
        const size = 1 + Math.random() * 3; // Random size

        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: size,
            color: color,
            alpha: 1,
            life: 30 + Math.random() * 20 // Particle lifetime
        });
    }
}

// Update and draw particles
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Add gravity
        p.vy += 0.1;

        // Decrease life and alpha
        p.life -= 1;
        p.alpha = p.life / 50;

        // Remove dead particles
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
    }
}

function drawBallTrail() {
    for (let i = 0; i < ballTrail.length; i++) {
        const point = ballTrail[i];
        const alpha = (i / ballTrail.length) * 0.5;
        const radius = ballRadius * (i / ballTrail.length);

        // Draw trail circle
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);

        // Create gradient for fire effect
        const gradient = ctx.createRadialGradient(
            point.x, point.y, 0,
            point.x, point.y, radius
        );
        gradient.addColorStop(0, "#FFFFFF");
        gradient.addColorStop(0.3, "#FFFF00");
        gradient.addColorStop(0.7, "#FF6600");
        gradient.addColorStop(1, "#FF0000");

        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
    }
}

function drawBall() {
    // Add current position to trail
    ballTrail.push({x: ballX, y: ballY});

    // Limit trail length
    if (ballTrail.length > maxTrailLength) {
        ballTrail.shift();
    }

    // Draw trail first (behind the ball)
    drawBallTrail();

    // Draw main ball with fire gradient
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);

    // Create gradient for fire effect
    const gradient = ctx.createRadialGradient(
        ballX, ballY, 0,
        ballX, ballY, ballRadius
    );
    gradient.addColorStop(0, "#FFFFFF"); // White center
    gradient.addColorStop(0.3, "#FFFF00"); // Yellow
    gradient.addColorStop(0.7, "#FF6600"); // Orange
    gradient.addColorStop(1, "#FF0000");   // Red edge

    ctx.fillStyle = gradient;
    ctx.fill();

    // Add glow effect
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#FF6600";
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fill();
    ctx.restore();

    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight - 450, paddleWidth, paddleHeight);
    ctx.fillStyle = "#00FFFF";
    ctx.fill();
    ctx.closePath();
}

// Add a stroke outline around blocks
function drawBlocks() {
    for(let i = 0; i < blocks.length; i++) {
        if(blocks[i].status === 1) {
            ctx.beginPath();
            ctx.rect(blocks[i].x, blocks[i].y, blocks[i].width, blocks[i].height);
            ctx.fillStyle = blocks[i].color;
            ctx.fill();
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.closePath();
        }
    }
}

function collisionDetection() {
    for(let i = 0; i < blocks.length; i++) {
        let b = blocks[i];
        if(b.status === 1) {
            if(ballX > b.x && ballX < b.x + b.width &&
               ballY > b.y && ballY < b.y + b.height) {
                ballSpeedY = -ballSpeedY;
                b.status = 0;
                score++;

                // Create particle effect at block position
                createBlockParticles(b.x + b.width/2, b.y + b.height/2, b.color);

                // Check if game is won
                const remainingBlocks = blocks.filter(block => block.status === 1).length;
                if(remainingBlocks === 0) {
                    alert("YOU WIN, CONGRATULATIONS!");
                    resetGame();
                }
            }
        }
    }
}

function draw() {
    if (!gameRunning || gamePaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBlocks();
    updateParticles();
    drawParticles();
    drawBall();
    drawPaddle();
    collisionDetection();

    // Wall collision (right/left)
    if(ballX + ballSpeedX > canvas.width - ballRadius || ballX + ballSpeedX < ballRadius) {
        ballSpeedX = -ballSpeedX;
    }

    // Top collision
    if(ballY + ballSpeedY < ballRadius) {
        ballSpeedY = -ballSpeedY;
    }
    // Paddle collision or bottom miss
    else if(ballY + ballSpeedY > canvas.height - ballRadius - 450) {
        if(ballX > paddleX && ballX < paddleX + paddleWidth) {
            // Adjust ball direction based on where it hits the paddle
            let hitPosition = (ballX - paddleX) / paddleWidth;
            ballSpeedX = 5 * (hitPosition - 0.5); // -2.5 to 2.5
            ballSpeedY = -ballSpeedY;
        }
        else {
            // Game over - automatically restart
            resetGame();
            startGame();
            return;
        }
    }

    // Move the ball
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    requestAnimationFrame(draw);
}

function startGame() {
    if (!canvas) {
        canvas = document.getElementById("game-canvas");
        ctx = canvas.getContext("2d");
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        setupCanvasEvents();
    }

    if (!gameRunning) {
        createBlocks();
        score = 0;
        gameRunning = true;
        gamePaused = false;
        // Set ball position to middle-top
        ballX = canvas.width / 2;
        ballY = ballRadius + 20;
        ballSpeedY = 8; // Positive to move downward
        ballTrail = []; // Clear the trail
        particles = []; // Clear the particles
        requestAnimationFrame(draw);
    }
}

function pauseGame() {
    if (gameRunning) {
        gamePaused = true;

        // Draw "PAUSED" text
        ctx.font = "30px 'Courier New'";
        ctx.fillStyle = "#FFFF00";
        ctx.textAlign = "center";
        ctx.fillText("PAUSED", canvas.width/2, canvas.height/2);
    }
}

function resumeGame() {
    if (gameRunning && gamePaused) {
        gamePaused = false;
        requestAnimationFrame(draw);
    }
}

function resetGame() {
    gameRunning = false;
    gamePaused = false;
    // Set ball to start from the top
    ballX = canvas.width / 2;
    ballY = ballRadius + 20;
    ballSpeedX = 6;
    ballSpeedY = 8; // Positive to move downward
    paddleX = canvas.width / 2 - paddleWidth / 2;
    score = 0;
    ballTrail = []; // Clear the trail
    particles = []; // Clear the particles

    if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        createBlocks();
        drawBlocks();
        drawBall();
        drawPaddle();
    }
}

// Initialize the game when the page loads, but wait for mouse entry to start
window.onload = function() {
    canvas = document.getElementById("game-canvas");
    ctx = canvas.getContext("2d");
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    // Setup the canvas events
    setupCanvasEvents();

    // Calculate initial paddle and ball positions based on canvas size
    paddleX = canvas.width / 2 - paddleWidth / 2;
    ballX = canvas.width / 2;
    ballY = ballRadius + 20;

    // Initialize game but don't start automatically
    createBlocks();
    drawBlocks();
    drawBall();
    drawPaddle();

    // Display "MOVE MOUSE HERE" message
    ctx.font = "30px 'Courier New'";
    ctx.fillStyle = "#FFFF00";
    ctx.textAlign = "center";
    ctx.fillText("MOVE MOUSE HERE TO START", canvas.width/2, canvas.height/2);
};