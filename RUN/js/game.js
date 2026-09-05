// js/game.js

class BoxingGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 700;
        this.height = 550;
        
        canvas.width = this.width;
        canvas.height = this.height;
        
        // Game state
        this.state = 'idle'; // idle, countdown, fighting, paused, gameover
        this.round = 1;
        this.maxRounds = 3;
        
        // Player
        this.player = {
            health: 100,
            maxHealth: 100,
            x: this.width / 2,
            y: this.height - 120,
            state: 'idle', // idle, blocking, ducking, punching, hit, ko
            punchHand: null,
            stateTimer: 0,
            comboCount: 0,
            starPunches: 0
        };
        
        // Opponent
        this.opponent = {
            name: 'GLASS JOE',
            health: 100,
            maxHealth: 100,
            x: this.width / 2,
            y: 180,
            state: 'idle', // idle, telegraphing, attacking, hit, stunned, ko
            attackType: null,
            stateTimer: 0,
            attackPattern: [],
            currentAttack: 0,
            difficulty: 1,
            color: '#ffaa00',
            hitsTaken: 0
        };
        
        // Combat timing
        this.telegraphDuration = 60; // frames
        this.attackDuration = 20;
        this.stunDuration = 90;
        this.hitRecovery = 30;
        
        // Attack patterns for opponent
        this.attackPatterns = [
            { type: 'left-hook', telegraph: 'LEFT!', dodgeWith: ['duck', 'right-dodge'] },
            { type: 'right-hook', telegraph: 'RIGHT!', dodgeWith: ['duck', 'left-dodge'] },
            { type: 'uppercut', telegraph: 'UPPER!', dodgeWith: ['duck'] },
            { type: 'jab', telegraph: 'JAB!', dodgeWith: ['duck', 'arms-x'] }
        ];
        
        // Timing
        this.lastTime = 0;
        this.attackCooldown = 0;
        this.dodgeWindow = false;
        this.counterWindow = false;
        this.counterTimer = 0;
        
        // Visual effects
        this.effects = [];
        this.screenShake = 0;
        
        // Callbacks
        this.onGameOver = null;
        this.onRoundEnd = null;
    }
    
    start() {
        this.state = 'fighting';
        this.scheduleNextAttack();
    }
    
    reset() {
        this.player.health = this.player.maxHealth;
        this.opponent.health = this.opponent.maxHealth;
        this.player.state = 'idle';
        this.opponent.state = 'idle';
        this.round = 1;
        this.state = 'idle';
        this.effects = [];
        this.player.comboCount = 0;
        this.player.starPunches = 0;
        this.opponent.hitsTaken = 0;
    }
    
    scheduleNextAttack() {
        // Random delay before next attack
        const baseDelay = 120 - (this.opponent.difficulty * 20);
        const randomDelay = Math.random() * 60;
        this.attackCooldown = Math.max(60, baseDelay + randomDelay);
    }
    
    update(deltaTime, playerPose) {
        if (this.state !== 'fighting') return;
        
        // Update screen shake
        if (this.screenShake > 0) {
            this.screenShake *= 0.9;
        }
        
        // Update effects
        this.effects = this.effects.filter(e => {
            e.life--;
            e.y += e.vy || 0;
            e.x += e.vx || 0;
            return e.life > 0;
        });
        
        // Update player state timer
        if (this.player.stateTimer > 0) {
            this.player.stateTimer--;
            if (this.player.stateTimer === 0) {
                this.player.state = 'idle';
            }
        }
        
        // Update opponent state timer
        if (this.opponent.stateTimer > 0) {
            this.opponent.stateTimer--;
            
            if (this.opponent.stateTimer === 0) {
                if (this.opponent.state === 'telegraphing') {
                    // Execute attack
                    this.executeOpponentAttack();
                } else if (this.opponent.state === 'attacking') {
                    this.opponent.state = 'idle';
                    this.scheduleNextAttack();
                } else if (this.opponent.state === 'hit' || this.opponent.state === 'stunned') {
                    this.opponent.state = 'idle';
                    this.scheduleNextAttack();
                }
            }
        }
        
        // Counter window timer
        if (this.counterTimer > 0) {
            this.counterTimer--;
            if (this.counterTimer === 0) {
                this.counterWindow = false;
            }
        }
        
        // Opponent AI - start telegraphing attack
        if (this.opponent.state === 'idle' && this.attackCooldown > 0) {
            this.attackCooldown--;
            
            if (this.attackCooldown === 0) {
                this.startOpponentAttack();
            }
        }
        
        // Handle player pose input
        this.handlePlayerInput(playerPose);
        
        // Check for KO
        if (this.player.health <= 0) {
            this.playerKO();
        } else if (this.opponent.health <= 0) {
            this.opponentKO();
        }
    }
    
    startOpponentAttack() {
        const attack = this.attackPatterns[Math.floor(Math.random() * this.attackPatterns.length)];
        this.opponent.attackType = attack;
        this.opponent.state = 'telegraphing';
        this.opponent.stateTimer = this.telegraphDuration;
        this.dodgeWindow = true;
    }
    
    executeOpponentAttack() {
        this.opponent.state = 'attacking';
        this.opponent.stateTimer = this.attackDuration;
        this.dodgeWindow = false;
        
        // Check if player is dodging correctly
        const attack = this.opponent.attackType;
        const playerDodged = this.isPlayerDodging(attack);
        
        if (!playerDodged && this.player.state !== 'blocking') {
            // Player gets hit
            this.playerHit(attack);
        } else if (this.player.state === 'blocking') {
            // Blocked - reduced damage
            this.playerBlock(attack);
        } else {
            // Successful dodge - open counter window
            this.counterWindow = true;
            this.counterTimer = 45; // frames to counter
            this.showMessage('DODGE!', '#00ff55');
            this.player.comboCount = 0;
        }
    }
    
    isPlayerDodging(attack) {
        if (this.player.state === 'ducking') {
            return attack.dodgeWith.includes('duck');
        }
        return false;
    }
    
    playerHit(attack) {
        const damage = 15 + Math.random() * 10;
        this.player.health = Math.max(0, this.player.health - damage);
        this.player.state = 'hit';
        this.player.stateTimer = this.hitRecovery;
        this.player.comboCount = 0;
        
        this.screenShake = 10;
        this.addEffect(this.player.x, this.player.y, 'hit');
        this.showMessage('OUCH!', '#ff4444');
    }
    
    playerBlock(attack) {
        const damage = 5;
        this.player.health = Math.max(0, this.player.health - damage);
        this.player.state = 'blocking';
        this.player.stateTimer = 15;
        
        this.screenShake = 3;
        this.addEffect(this.player.x, this.player.y - 50, 'block');
        this.showMessage('BLOCKED!', '#4488ff');
    }
    
    handlePlayerInput(pose) {
        if (pose === 'none' || this.player.state === 'hit' || this.player.state === 'ko') return;
        
        // Duck
        if (pose === 'duck') {
            this.player.state = 'ducking';
            return;
        }
        
        // Block
        if (pose === 'arms-x') {
            this.player.state = 'blocking';
            return;
        }
        
        // Attacks - only work during counter window or when opponent is idle/stunned
        const canAttack = this.counterWindow || 
                          this.opponent.state === 'idle' || 
                          this.opponent.state === 'stunned' ||
                          this.opponent.state === 'hit';
        
        if (!canAttack) return;
        
        // Hooks
        if (pose === 'left-hook' || pose === 'right-hook') {
            this.playerPunch(pose, 'hook');
        }
        
        // Uppercuts
        if (pose === 'left-uppercut' || pose === 'right-uppercut') {
            this.playerPunch(pose, 'uppercut');
        }
    }
    
    playerPunch(pose, type) {
        if (this.player.state === 'punching') return;
        
        this.player.state = 'punching';
        this.player.punchHand = pose.includes('left') ? 'left' : 'right';
        this.player.stateTimer = 15;
        
        // Calculate damage
        let damage = type === 'uppercut' ? 20 : 12;
        
        // Counter bonus
        if (this.counterWindow) {
            damage *= 1.5;
            this.player.comboCount++;
            
            if (this.player.comboCount >= 3) {
                this.player.starPunches++;
                this.showMessage('⭐ STAR PUNCH!', '#ffcc00');
            }
        }
        
        // Combo multiplier
        damage *= (1 + this.player.comboCount * 0.1);
        
        // Apply damage
        this.opponent.health = Math.max(0, this.opponent.health - damage);
        this.opponent.state = 'hit';
        this.opponent.stateTimer = this.hitRecovery;
        this.opponent.hitsTaken++;
        
        // Stun after multiple hits
        if (this.opponent.hitsTaken >= 5) {
            this.opponent.state = 'stunned';
            this.opponent.stateTimer = this.stunDuration;
            this.opponent.hitsTaken = 0;
            this.showMessage('STUNNED!', '#ffcc00');
        }
        
        this.screenShake = 5;
        this.addEffect(this.opponent.x, this.opponent.y, 'hit');
        
        const punchName = type === 'uppercut' ? type.toUpperCase() : pose.replace('-', ' ').toUpperCase();
        return punchName;
    }
    
    playerKO() {
        this.player.state = 'ko';
        this.state = 'gameover';
        this.screenShake = 20;
        
        if (this.onGameOver) {
            this.onGameOver(false);
        }
    }
    
    opponentKO() {
        this.opponent.state = 'ko';
        this.state = 'gameover';
        this.screenShake = 20;
        
        if (this.onGameOver) {
            this.onGameOver(true);
        }
    }
    
    addEffect(x, y, type) {
        if (type === 'hit') {
            for (let i = 0; i < 8; i++) {
                this.effects.push({
                    x: x + (Math.random() - 0.5) * 40,
                    y: y + (Math.random() - 0.5) * 40,
                    vx: (Math.random() - 0.5) * 8,
                    vy: (Math.random() - 0.5) * 8,
                    size: 5 + Math.random() * 10,
                    color: '#ffff00',
                    life: 20
                });
            }
        } else if (type === 'block') {
            this.effects.push({
                x: x,
                y: y,
                size: 30,
                color: '#4488ff',
                life: 15,
                type: 'ring'
            });
        }
    }
    
    showMessage(text, color) {
        const display = document.getElementById('message-display');
        display.textContent = text;
        display.style.color = color;
        display.classList.add('visible');
        
        setTimeout(() => {
            display.classList.remove('visible');
        }, 800);
    }
    
    draw() {
        const ctx = this.ctx;
        
        // Apply screen shake
        ctx.save();
        if (this.screenShake > 0.5) {
            ctx.translate(
                (Math.random() - 0.5) * this.screenShake,
                (Math.random() - 0.5) * this.screenShake
            );
        }
        
        // Clear
        ctx.fillStyle = '#0f0f1a';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw boxing ring background
        this.drawRing(ctx);
        
        // Draw opponent
        this.drawOpponent(ctx);
        
        // Draw player
        this.drawPlayer(ctx);
        
        // Draw effects
        this.drawEffects(ctx);
        
        // Draw telegraph indicator
        if (this.opponent.state === 'telegraphing') {
            this.drawTelegraph(ctx);
        }
        
        ctx.restore();
    }
    
    drawRing(ctx) {
        // Ring floor
        ctx.fillStyle = '#2a2a3e';
        ctx.beginPath();
        ctx.moveTo(100, 350);
        ctx.lineTo(600, 350);
        ctx.lineTo(650, 500);
        ctx.lineTo(50, 500);
        ctx.closePath();
        ctx.fill();
        
        // Ring lines
        ctx.strokeStyle = '#3a3a5e';
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            const y = 350 + i * 35;
            ctx.beginPath();
            ctx.moveTo(100 - i * 10, y);
            ctx.lineTo(600 + i * 10, y);
            ctx.stroke();
        }
        
        // Ropes
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 4;
        for (let i = 0; i < 3; i++) {
            const y = 100 + i * 60;
            ctx.beginPath();
            ctx.moveTo(50, y);
            ctx.lineTo(650, y);
            ctx.stroke();
        }
    }
    
    drawOpponent(ctx) {
        const opp = this.opponent;
        let offsetY = 0;
        let scale = 1;
        
        if (opp.state === 'hit') {
            offsetY = Math.sin(opp.stateTimer * 0.5) * 10;
        } else if (opp.state === 'stunned') {
            offsetY = Math.sin(Date.now() * 0.02) * 5;
        } else if (opp.state === 'attacking') {
            scale = 1.1;
            offsetY = 30;
        } else if (opp.state === 'ko') {
            offsetY = 100;
        }
        
        ctx.save();
        ctx.translate(opp.x, opp.y + offsetY);
        ctx.scale(scale, scale);
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 80, 60, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Body
        ctx.fillStyle = opp.color;
        ctx.beginPath();
        ctx.ellipse(0, 30, 50, 60, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#ffcc99';
        ctx.beginPath();
        ctx.arc(0, -40, 35, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        if (opp.state === 'ko' || opp.state === 'stunned') {
            // X eyes
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-18, -45); ctx.lineTo(-8, -35);
            ctx.moveTo(-8, -45); ctx.lineTo(-18, -35);
            ctx.moveTo(8, -45); ctx.lineTo(18, -35);
            ctx.moveTo(18, -45); ctx.lineTo(8, -35);
            ctx.stroke();
        } else {
            // Normal eyes
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-12, -40, 5, 0, Math.PI * 2);
            ctx.arc(12, -40, 5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Gloves
        ctx.fillStyle = '#ff4444';
        
        // Left glove
        let leftGloveX = -55;
        let leftGloveY = 20;
        if (opp.state === 'attacking' && opp.attackType?.type === 'left-hook') {
            leftGloveX = -70;
            leftGloveY = 40;
        }
        ctx.beginPath();
        ctx.arc(leftGloveX, leftGloveY, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Right glove
        let rightGloveX = 55;
        let rightGloveY = 20;
        if (opp.state === 'attacking' && opp.attackType?.type === 'right-hook') {
            rightGloveX = 70;
            rightGloveY = 40;
        }
        ctx.beginPath();
        ctx.arc(rightGloveX, rightGloveY, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    drawPlayer(ctx) {
        const player = this.player;
        let offsetY = 0;
        
        if (player.state === 'ducking') {
            offsetY = 60;
        } else if (player.state === 'hit') {
            offsetY = -10 + Math.sin(player.stateTimer * 0.5) * 5;
        }
        
        ctx.save();
        ctx.translate(player.x, player.y + offsetY);
        
        // Player gloves (first person view)
        const baseY = player.state === 'ducking' ? -20 : 0;
        
        // Left glove
        ctx.fillStyle = '#00cc44';
        let leftX = -120;
        let leftY = baseY + 40;
        
        if (player.state === 'punching' && player.punchHand === 'left') {
            leftY = baseY - 50;
            leftX = -60;
        } else if (player.state === 'blocking') {
            leftX = -40;
            leftY = baseY - 30;
        }
        
        ctx.beginPath();
        ctx.ellipse(leftX, leftY, 45, 35, -0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#009933';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Right glove
        let rightX = 120;
        let rightY = baseY + 40;
        
        if (player.state === 'punching' && player.punchHand === 'right') {
            rightY = baseY - 50;
            rightX = 60;
        } else if (player.state === 'blocking') {
            rightX = 40;
            rightY = baseY - 30;
        }
        
        ctx.fillStyle = '#00cc44';
        ctx.beginPath();
        ctx.ellipse(rightX, rightY, 45, 35, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#009933';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.restore();
    }
    
    drawEffects(ctx) {
        this.effects.forEach(e => {
            ctx.globalAlpha = e.life / 20;
            
            if (e.type === 'ring') {
                ctx.strokeStyle = e.color;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(e.x, e.y, e.size + (20 - e.life) * 2, 0, Math.PI * 2);
                ctx.stroke();
            } else {
                ctx.fillStyle = e.color;
                ctx.beginPath();
                ctx.arc(e.x, e.y, e.size * (e.life / 20), 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.globalAlpha = 1;
        });
    }
    
    drawTelegraph(ctx) {
        const attack = this.opponent.attackType;
        if (!attack) return;
        
        // Flashing warning
        const flash = Math.sin(Date.now() * 0.02) > 0;
        
        ctx.fillStyle = flash ? '#ff4444' : '#ffcc00';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(attack.telegraph, this.width / 2, 300);
        
        // Arrow indicator
        ctx.fillStyle = flash ? '#ff4444' : '#ffcc00';
        ctx.font = '36px sans-serif';
        
        if (attack.type.includes('left')) {
            ctx.fillText('←', this.width / 2 - 100, 300);
        } else if (attack.type.includes('right')) {
            ctx.fillText('→', this.width / 2 + 100, 300);
        } else {
            ctx.fillText('↓ DUCK!', this.width / 2, 350);
        }
    }
}

window.BoxingGame = BoxingGame;
