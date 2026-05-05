// Canvas Engine
class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Polyfill for roundRect if not available
        if (!this.ctx.roundRect) {
            this.ctx.roundRect = function(x, y, w, h, r) {
                if (w < 2 * r) r = w / 2;
                if (h < 2 * r) r = h / 2;
                this.beginPath();
                this.moveTo(x + r, y);
                this.arcTo(x + w, y, x + w, y + h, r);
                this.arcTo(x + w, y + h, x, y + h, r);
                this.arcTo(x, y + h, x, y, r);
                this.arcTo(x, y, x + w, y, r);
                this.closePath();
                return this;
            };
        }

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.camera = {
            x: 0,
            y: 0,
            zoom: 1,
            targetX: 0,
            targetY: 0
        };

        this.animationId = null;
        this.deltaTime = 0;
        this.lastTime = Date.now();

        this.gameState = 'running'; // running, gameOver
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    clear() {
        this.ctx.fillStyle = '#0a0e27';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawPlayer(px, py) {
        const screenX = this.toScreenX(px);
        const screenY = this.toScreenY(py);
        const animationState = window.gameInstance?.animationState;
        const now = Date.now();
        const animationAge = animationState ? now - animationState.startedAt : 0;
        const animationProgress = animationState ? Math.min(animationAge / animationState.duration, 1) : 0;
        const easeOut = 1 - Math.pow(1 - animationProgress, 3);

        let drawX = screenX;
        let drawY = screenY;
        let drawScale = 1;
        let drawAlpha = 1;
        let drawTilt = 0;

        if (animationState?.mode === 'advance') {
            drawY = screenY - easeOut * 168;
            drawX = screenX + Math.sin(animationProgress * Math.PI * 2) * 8 * (1 - animationProgress);
            drawScale = 1 - animationProgress * 0.08;
        } else if (animationState?.mode === 'death') {
            drawY = screenY + easeOut * 95;
            drawScale = 1 - animationProgress * 0.25;
            drawAlpha = 1 - animationProgress * 0.8;
            drawTilt = -0.35 * easeOut;
        }

        // Subtle idle animation
        const bobOffset = Math.sin(Date.now() / 500) * 3;
        const bob = animationState ? 0 : bobOffset;

        this.ctx.save();
        this.ctx.translate(drawX, drawY);
        this.ctx.scale(drawScale, drawScale);
        this.ctx.rotate(drawTilt);
        this.ctx.globalAlpha = drawAlpha;

        if (animationState?.mode === 'advance') {
            this.ctx.fillStyle = 'rgba(255, 190, 80, 0.18)';
            this.ctx.beginPath();
            this.ctx.arc(0, -8, 52 + animationProgress * 20, 0, Math.PI * 2);
            this.ctx.fill();
        }

        if (animationState?.mode === 'death') {
            this.ctx.fillStyle = 'rgba(255, 60, 60, 0.12)';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 60 + animationProgress * 12, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Player body - layered sprite with limbs and highlights
        this.ctx.fillStyle = animationState?.mode === 'death' ? 'rgba(170, 40, 40, 0.9)' : 'rgba(0, 255, 153, 0.9)';
        this.ctx.beginPath();
        this.ctx.roundRect(-15, -20 + bob, 30, 40, 6);
        this.ctx.fill();

        // Torso panel
        this.ctx.fillStyle = 'rgba(10, 14, 39, 0.45)';
        this.ctx.beginPath();
        this.ctx.roundRect(-9, -12 + bob, 18, 24, 4);
        this.ctx.fill();

        // Body glow
        this.ctx.strokeStyle = animationState?.mode === 'death' ? 'rgba(255, 90, 90, 0.35)' : 'rgba(0, 255, 153, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.roundRect(-15, -20 + bob, 30, 40, 6);
        this.ctx.stroke();

        // Legs
        this.ctx.strokeStyle = animationState?.mode === 'death' ? 'rgba(255, 100, 100, 0.7)' : 'rgba(0, 255, 153, 0.75)';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(-8, 19 + bob);
        this.ctx.lineTo(-12, 33 + bob + Math.sin(Date.now() / 180) * 2);
        this.ctx.moveTo(8, 19 + bob);
        this.ctx.lineTo(12, 33 + bob + Math.cos(Date.now() / 180) * 2);
        this.ctx.stroke();

        // Arms
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(-15, -4 + bob);
        this.ctx.lineTo(-22, 10 + bob + Math.sin(Date.now() / 220) * 2);
        this.ctx.moveTo(15, -4 + bob);
        this.ctx.lineTo(22, 10 + bob + Math.cos(Date.now() / 220) * 2);
        this.ctx.stroke();

        // Player head - circle with glow
        this.ctx.fillStyle = animationState?.mode === 'death' ? 'rgba(255, 120, 120, 0.95)' : 'rgba(0, 255, 200, 0.95)';
        this.ctx.beginPath();
        this.ctx.arc(0, -25 + bob, 12, 0, Math.PI * 2);
        this.ctx.fill();

        // Head glow
        this.ctx.strokeStyle = animationState?.mode === 'death' ? 'rgba(255, 120, 120, 0.45)' : 'rgba(0, 255, 200, 0.4)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, -25 + bob, 12, 0, Math.PI * 2);
        this.ctx.stroke();

        // Helmet visor stripe
        this.ctx.strokeStyle = 'rgba(10, 14, 39, 0.7)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(-6, -27 + bob);
        this.ctx.lineTo(6, -27 + bob);
        this.ctx.stroke();

        // Eyes with glow
        this.ctx.fillStyle = '#0a0e27';
        this.ctx.beginPath();
        this.ctx.arc(-5, -28 + bob, 3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(5, -28 + bob, 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Eye glow
        this.ctx.fillStyle = animationState?.mode === 'death' ? 'rgba(255, 140, 140, 0.6)' : 'rgba(0, 255, 153, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(-5, -28 + bob, 5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(5, -28 + bob, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // Small chest core for a stronger sprite silhouette
        this.ctx.fillStyle = animationState?.mode === 'death' ? 'rgba(255, 80, 80, 0.85)' : 'rgba(0, 255, 200, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(0, -2 + bob, 4, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawRoom() {
        const screenCenterX = this.canvas.width / 2;
        const screenCenterY = this.canvas.height / 2;

        // Room boundary with gradient
        const roomWidth = 380;
        const roomHeight = 380;

        // Room background glow
        this.ctx.fillStyle = 'rgba(0, 255, 153, 0.05)';
        this.ctx.beginPath();
        this.ctx.roundRect(
            screenCenterX - roomWidth / 2,
            screenCenterY - roomHeight / 2,
            roomWidth,
            roomHeight,
            12
        );
        this.ctx.fill();

        // Room border
        this.ctx.strokeStyle = 'rgba(0, 255, 153, 0.6)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.roundRect(
            screenCenterX - roomWidth / 2,
            screenCenterY - roomHeight / 2,
            roomWidth,
            roomHeight,
            12
        );
        this.ctx.stroke();

        // Inner glow border
        this.ctx.strokeStyle = 'rgba(0, 255, 153, 0.2)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.roundRect(
            screenCenterX - roomWidth / 2 + 3,
            screenCenterY - roomHeight / 2 + 3,
            roomWidth - 6,
            roomHeight - 6,
            10
        );
        this.ctx.stroke();

        // Room floor pattern - subtle grid
        this.ctx.strokeStyle = 'rgba(0, 255, 153, 0.08)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                this.ctx.strokeRect(
                    screenCenterX - roomWidth / 2 + i * 38,
                    screenCenterY - roomHeight / 2 + j * 38,
                    38,
                    38
                );
            }
        }

        // Room depth indicator with glow
        this.ctx.fillStyle = 'rgba(0, 255, 153, 0.3)';
        this.ctx.font = 'bold 28px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowColor = 'rgba(0, 255, 153, 0.5)';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.fillText(`DEPTH ${player.depth}`, screenCenterX, screenCenterY - 130);
        this.ctx.shadowColor = 'transparent';

        // Pressure bar visualization at bottom
        const pressurePercent = pressureSystem.getPressurePercent();
        
        // Pressure bar background
        this.ctx.fillStyle = 'rgba(0, 50, 40, 0.5)';
        this.ctx.beginPath();
        this.ctx.roundRect(
            screenCenterX - roomWidth / 2 + 20,
            screenCenterY + roomHeight / 2 - 30,
            roomWidth - 40,
            10,
            5
        );
        this.ctx.fill();

        // Pressure bar fill with gradient
        const gradient = this.ctx.createLinearGradient(
            screenCenterX - roomWidth / 2 + 20, 0,
            screenCenterX - roomWidth / 2 + 20 + (roomWidth - 40), 0
        );
        gradient.addColorStop(0, '#0f9');
        gradient.addColorStop(0.5, '#ff3');
        gradient.addColorStop(1, '#f33');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.roundRect(
            screenCenterX - roomWidth / 2 + 20,
            screenCenterY + roomHeight / 2 - 30,
            (roomWidth - 40) * (pressurePercent / 100),
            10,
            5
        );
        this.ctx.fill();

        // Pressure bar border
        this.ctx.strokeStyle = 'rgba(0, 255, 153, 0.4)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.roundRect(
            screenCenterX - roomWidth / 2 + 20,
            screenCenterY + roomHeight / 2 - 30,
            roomWidth - 40,
            10,
            5
        );
        this.ctx.stroke();
    }

    drawExitDoor() {
        const screenCenterX = this.canvas.width / 2;
        const screenCenterY = this.canvas.height / 2;

        // Stair portal at the top of the room
        const doorX = screenCenterX;
        const doorY = screenCenterY - 190;
        const doorWidth = 70;
        const doorHeight = 90;

        // Stair steps leading into the portal
        this.ctx.shadowColor = 'rgba(255, 170, 50, 0.45)';
        this.ctx.shadowBlur = 14;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        for (let i = 0; i < 4; i++) {
            const stepY = doorY + 48 + i * 10;
            const stepWidth = 94 - i * 12;
            this.ctx.fillStyle = `rgba(255, 170, 50, ${0.14 + i * 0.05})`;
            this.ctx.beginPath();
            this.ctx.roundRect(doorX - stepWidth / 2, stepY, stepWidth, 9, 4);
            this.ctx.fill();
        }

        // Portal aura
        const glowIntensity = 0.3 + Math.sin(Date.now() / 300) * 0.2;
        this.ctx.fillStyle = 'rgba(255, 170, 50, 0.16)';
        this.ctx.beginPath();
        this.ctx.arc(doorX, doorY + 10, 56 + glowIntensity * 8, 0, Math.PI * 2);
        this.ctx.fill();

        // Door outer frame - rounded arch
        this.ctx.fillStyle = 'rgba(255, 170, 50, 0.2)';
        this.ctx.beginPath();
        this.ctx.roundRect(doorX - doorWidth / 2 - 6, doorY - doorHeight / 2 - 6, doorWidth + 12, doorHeight + 14, 10);
        this.ctx.fill();

        // Portal main body - gradient
        const doorGradient = this.ctx.createLinearGradient(doorX - doorWidth / 2, doorY - doorHeight / 2, doorX - doorWidth / 2, doorY + doorHeight / 2);
        doorGradient.addColorStop(0, 'rgba(255, 190, 90, 0.95)');
        doorGradient.addColorStop(1, 'rgba(255, 140, 30, 0.95)');
        
        this.ctx.fillStyle = doorGradient;
        this.ctx.beginPath();
        this.ctx.roundRect(doorX - doorWidth / 2, doorY - doorHeight / 2, doorWidth, doorHeight, 16);
        this.ctx.fill();

        // Portal border
        this.ctx.strokeStyle = 'rgba(255, 200, 100, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.roundRect(doorX - doorWidth / 2, doorY - doorHeight / 2, doorWidth, doorHeight, 16);
        this.ctx.stroke();

        // Portal opening
        this.ctx.fillStyle = '#0a0e27';
        this.ctx.beginPath();
        this.ctx.roundRect(doorX - doorWidth / 2 + 8, doorY - doorHeight / 2 + 12, doorWidth - 16, doorHeight - 24, 10);
        this.ctx.fill();

        // Inner portal shimmer
        this.ctx.strokeStyle = 'rgba(0, 255, 200, 0.45)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.roundRect(doorX - doorWidth / 2 + 8, doorY - doorHeight / 2 + 12, doorWidth - 16, doorHeight - 24, 10);
        this.ctx.stroke();

        this.ctx.fillStyle = 'rgba(0, 255, 200, 0.14)';
        this.ctx.beginPath();
        this.ctx.arc(doorX, doorY, 18 + Math.sin(Date.now() / 220) * 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Door label - STAIRS
        this.ctx.shadowColor = 'rgba(255, 170, 50, 0.8)';
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = 'rgba(255, 170, 50, 0.95)';
        this.ctx.font = 'bold 14px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('STAIRS', doorX, doorY - doorHeight / 2 - 25);

        // Arrow animation pointing upward into the exit
        const arrowOffset = Math.sin(Date.now() / 400) * 3;
        this.ctx.fillStyle = 'rgba(255, 170, 50, 0.7)';
        this.ctx.font = 'bold 16px Courier New';
        this.ctx.fillText('↑', doorX, doorY + doorHeight / 2 + 20 + arrowOffset);

        this.ctx.shadowColor = 'transparent';
    }

    drawCrossHair() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Outer ring - animated
        const ringScale = 1 + Math.sin(Date.now() / 1000) * 0.1;
        this.ctx.strokeStyle = 'rgba(0, 255, 153, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 30 * ringScale, 0, Math.PI * 2);
        this.ctx.stroke();

        // Crosshair lines
        this.ctx.strokeStyle = 'rgba(0, 255, 153, 0.5)';
        this.ctx.lineWidth = 2;

        // Horizontal line
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 20, centerY);
        this.ctx.lineTo(centerX + 20, centerY);
        this.ctx.stroke();

        // Vertical line
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - 20);
        this.ctx.lineTo(centerX, centerY + 20);
        this.ctx.stroke();

        // Corner accents
        this.ctx.strokeStyle = 'rgba(0, 255, 200, 0.6)';
        this.ctx.lineWidth = 2;
        const cornerOffset = 12;

        // Top-left
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - cornerOffset - 5, centerY - cornerOffset);
        this.ctx.lineTo(centerX - cornerOffset, centerY - cornerOffset);
        this.ctx.lineTo(centerX - cornerOffset, centerY - cornerOffset - 5);
        this.ctx.stroke();

        // Top-right
        this.ctx.beginPath();
        this.ctx.moveTo(centerX + cornerOffset + 5, centerY - cornerOffset);
        this.ctx.lineTo(centerX + cornerOffset, centerY - cornerOffset);
        this.ctx.lineTo(centerX + cornerOffset, centerY - cornerOffset - 5);
        this.ctx.stroke();

        // Bottom-left
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - cornerOffset - 5, centerY + cornerOffset);
        this.ctx.lineTo(centerX - cornerOffset, centerY + cornerOffset);
        this.ctx.lineTo(centerX - cornerOffset, centerY + cornerOffset + 5);
        this.ctx.stroke();

        // Bottom-right
        this.ctx.beginPath();
        this.ctx.moveTo(centerX + cornerOffset + 5, centerY + cornerOffset);
        this.ctx.lineTo(centerX + cornerOffset, centerY + cornerOffset);
        this.ctx.lineTo(centerX + cornerOffset, centerY + cornerOffset + 5);
        this.ctx.stroke();

        // Center dot with glow
        this.ctx.fillStyle = 'rgba(0, 255, 200, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = 'rgba(0, 255, 200, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
        this.ctx.fill();
    }

    toScreenX(worldX) {
        return (worldX - this.camera.x) * this.camera.zoom + this.canvas.width / 2;
    }

    toScreenY(worldY) {
        return (worldY - this.camera.y) * this.camera.zoom + this.canvas.height / 2;
    }

    render() {
        this.clear();

        // Draw game world
        this.drawRoom();
        this.drawExitDoor();
        this.drawPlayer(0, 0); // Player always at center

        // Draw crosshair
        this.drawCrossHair();

        // Draw pressure effect at extreme levels
        if (pressureSystem.pressure >= 80) {
            this.ctx.fillStyle = `rgba(255, 50, 50, ${(pressureSystem.pressure - 80) * 0.05})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    animate() {
        const now = Date.now();
        this.deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;

        this.render();
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    start() {
        this.animate();
    }

    stop() {
        cancelAnimationFrame(this.animationId);
    }
}

const gameEngine = new GameEngine();
