// Game State
const gameState = {
    player: {
        money: 100,
        landPlots: [],
        productivityLevel: 1,
        totalProfit: 0,
        landHistory: [],
        hasUpgraded: false
    },
    computer: {
        money: 100,
        landPlots: [],
        productivityLevel: 1,
        totalProfit: 0,
        landHistory: [],
        hasUpgraded: false
    },
    turn: 1,
    maxTurns: 20,
    cropsPerPlot: 10,
    cropPrice: 5,
    emptyLandCost: 30,
    forestCost: 60,
    techCost: 100,
    gridSize: 8,
    plots: [],
    gameOver: false
};

// Initialize game
function init() {
    initializePlots();
    assignStartingPlots();
    updateDisplay();
    renderFarmGrid();
    renderChart();

    // Event listeners
    document.getElementById('nextTurnBtn').addEventListener('click', nextTurn);
    document.getElementById('upgradeProductivityBtn').addEventListener('click', () => upgradeProductivity('player'));
}

// Initialize plots (forest, empty, etc.)
function initializePlots() {
    const totalPlots = gameState.gridSize * gameState.gridSize;
    gameState.plots = [];

    for (let i = 0; i < totalPlots; i++) {
        const row = Math.floor(i / gameState.gridSize);
        const col = i % gameState.gridSize;

        // Create forest plots strategically
        let type = 'empty';
        if ((row >= 2 && row <= 5) && (col >= 2 && col <= 5)) {
            type = 'forest';
        }

        gameState.plots.push({
            id: i,
            type: type,
            owner: null,
            row: row,
            col: col
        });
    }
}

// Assign starting plots
function assignStartingPlots() {
    // Player gets bottom-left corner plots
    [0, 1, 8].forEach(id => {
        gameState.plots[id].type = 'farmland';
        gameState.plots[id].owner = 'player';
        gameState.player.landPlots.push(id);
    });

    // Computer gets top-right corner plots
    [7, 15, 23].forEach(id => {
        gameState.plots[id].type = 'farmland';
        gameState.plots[id].owner = 'computer';
        gameState.computer.landPlots.push(id);
    });
}

// Next Turn
function nextTurn() {
    if (gameState.gameOver) return;

    // Player harvest
    const playerEarnings = calculateEarnings('player');
    gameState.player.money += playerEarnings;
    gameState.player.totalProfit += playerEarnings;

    // Computer harvest
    const computerEarnings = calculateEarnings('computer');
    gameState.computer.money += computerEarnings;
    gameState.computer.totalProfit += computerEarnings;

    // Record history
    gameState.player.landHistory.push(gameState.player.landPlots.length);
    gameState.computer.landHistory.push(gameState.computer.landPlots.length);

    // Computer AI turn
    computerTurn();

    gameState.turn++;

    // Check for game end
    if (gameState.turn > gameState.maxTurns) {
        endGame();
    }

    updateDisplay();
    renderChart();
    updateInsights();
    checkParadox();

    showFeedback(`Turn ${gameState.turn - 1}: You earned $${playerEarnings}!`);
}

// Calculate earnings for a player
function calculateEarnings(owner) {
    const data = gameState[owner];
    const totalCrops = data.landPlots.length * gameState.cropsPerPlot * data.productivityLevel;
    return totalCrops * gameState.cropPrice;
}

// Buy Empty Land Plot
function buyEmptyLand(plotId) {
    if (gameState.gameOver) return;

    const plot = gameState.plots[plotId];
    if (plot.type !== 'empty' || plot.owner !== null) return;
    if (gameState.player.money < gameState.emptyLandCost) return;

    gameState.player.money -= gameState.emptyLandCost;
    plot.type = 'farmland';
    plot.owner = 'player';
    gameState.player.landPlots.push(plotId);

    renderFarmGrid();
    updateDisplay();
    updateInsights();

    showFeedback('Purchased empty land!');
}

// Buy Forest Plot
function buyForestPlot(plotId) {
    if (gameState.gameOver) return;

    const plot = gameState.plots[plotId];
    if (plot.type !== 'forest' || plot.owner !== null) return;
    if (gameState.player.money < gameState.forestCost) return;

    gameState.player.money -= gameState.forestCost;
    plot.type = 'farmland';
    plot.owner = 'player';
    gameState.player.landPlots.push(plotId);

    renderFarmGrid();
    updateDisplay();
    updateInsights();

    showFeedback('Converted forest to farmland!');
}

// Upgrade Productivity
function upgradeProductivity(owner) {
    if (gameState.gameOver) return;

    const data = gameState[owner];
    if (data.money < gameState.techCost) return;

    data.money -= gameState.techCost;
    data.productivityLevel += 0.5;
    data.hasUpgraded = true;

    updateDisplay();
    updateInsights();

    if (owner === 'player') {
        showFeedback('Technology upgraded! Each plot now produces more!');
    }
}

// Computer AI Turn - Smart Strategy
function computerTurn() {
    const computer = gameState.computer;
    const turnsLeft = gameState.maxTurns - gameState.turn;

    // Calculate current production per turn
    const currentEarnings = calculateEarnings('computer');

    // Available land
    const availableEmpty = gameState.plots.filter(p => p.type === 'empty' && p.owner === null);
    const availableForests = gameState.plots.filter(p => p.type === 'forest' && p.owner === null);

    // Smart decision making based on ROI and turns left
    let actionTaken = false;

    // Strategy 1: Early game - aggressive land expansion (prioritize cheap empty land)
    if (turnsLeft > 15 && computer.money >= gameState.emptyLandCost && availableEmpty.length > 0) {
        // Buy empty land - best ROI
        const plot = availableEmpty[Math.floor(Math.random() * availableEmpty.length)];
        plot.type = 'farmland';
        plot.owner = 'computer';
        computer.landPlots.push(plot.id);
        computer.money -= gameState.emptyLandCost;
        actionTaken = true;
    }

    // Strategy 2: Upgrade tech when we have enough land and money
    if (!actionTaken && computer.money >= gameState.techCost && computer.landPlots.length >= 4 &&
        computer.productivityLevel < 3) {
        // Calculate if tech upgrade pays off in remaining turns
        const upgradeValue = computer.landPlots.length * gameState.cropsPerPlot * 0.5 * gameState.cropPrice * turnsLeft;
        if (upgradeValue > gameState.techCost * 1.2) { // Need 20% profit margin
            upgradeProductivity('computer');
            actionTaken = true;
        }
    }

    // Strategy 3: Mid-game - balance between empty land and forests
    if (!actionTaken && turnsLeft > 8) {
        if (computer.money >= gameState.emptyLandCost && availableEmpty.length > 0) {
            // Still prioritize cheap empty land
            const plot = availableEmpty[Math.floor(Math.random() * availableEmpty.length)];
            plot.type = 'farmland';
            plot.owner = 'computer';
            computer.landPlots.push(plot.id);
            computer.money -= gameState.emptyLandCost;
            actionTaken = true;
        } else if (computer.money >= gameState.forestCost && availableForests.length > 0 && turnsLeft > 5) {
            // Buy forest only if no empty land available and enough turns to recoup cost
            const forestROI = gameState.cropsPerPlot * computer.productivityLevel * gameState.cropPrice * turnsLeft;
            if (forestROI > gameState.forestCost * 1.3) { // Need 30% profit margin for forests
                const plot = availableForests[Math.floor(Math.random() * availableForests.length)];
                plot.type = 'farmland';
                plot.owner = 'computer';
                computer.landPlots.push(plot.id);
                computer.money -= gameState.forestCost;
                actionTaken = true;
            }
        }
    }

    // Strategy 4: Late game - aggressive spending on anything profitable
    if (!actionTaken && turnsLeft <= 8 && turnsLeft > 3) {
        // Calculate ROI for each option
        const emptyLandROI = turnsLeft * gameState.cropsPerPlot * computer.productivityLevel * gameState.cropPrice;
        const forestROI = turnsLeft * gameState.cropsPerPlot * computer.productivityLevel * gameState.cropPrice;

        if (computer.money >= gameState.emptyLandCost && availableEmpty.length > 0 &&
            emptyLandROI > gameState.emptyLandCost) {
            const plot = availableEmpty[Math.floor(Math.random() * availableEmpty.length)];
            plot.type = 'farmland';
            plot.owner = 'computer';
            computer.landPlots.push(plot.id);
            computer.money -= gameState.emptyLandCost;
            actionTaken = true;
        } else if (computer.money >= gameState.forestCost && availableForests.length > 0 &&
                   forestROI > gameState.forestCost) {
            const plot = availableForests[Math.floor(Math.random() * availableForests.length)];
            plot.type = 'farmland';
            plot.owner = 'computer';
            computer.landPlots.push(plot.id);
            computer.money -= gameState.forestCost;
            actionTaken = true;
        }
    }

    // Strategy 5: Very late game - buy tech if we haven't maxed out
    if (!actionTaken && turnsLeft <= 3 && computer.money >= gameState.techCost &&
        computer.productivityLevel < 3 && computer.landPlots.length > 5) {
        upgradeProductivity('computer');
        actionTaken = true;
    }

    // Strategy 6: Multiple purchases in one turn if we have money
    if (actionTaken && computer.money >= gameState.emptyLandCost * 2 && availableEmpty.length > 1 && turnsLeft > 10) {
        // Buy another empty plot if we can afford it
        const availableEmptyNow = gameState.plots.filter(p => p.type === 'empty' && p.owner === null);
        if (availableEmptyNow.length > 0) {
            const plot = availableEmptyNow[Math.floor(Math.random() * availableEmptyNow.length)];
            plot.type = 'farmland';
            plot.owner = 'computer';
            computer.landPlots.push(plot.id);
            computer.money -= gameState.emptyLandCost;
        }
    }
}

// End Game
function endGame() {
    gameState.gameOver = true;

    const playerProfit = gameState.player.totalProfit;
    const computerProfit = gameState.computer.totalProfit;

    let message = '';
    if (playerProfit > computerProfit) {
        message = `🎉 YOU WIN! 🎉\n\nYour Profit: $${playerProfit}\nComputer Profit: $${computerProfit}\n\nYou earned $${playerProfit - computerProfit} more!`;
    } else if (computerProfit > playerProfit) {
        message = `😔 Computer Wins!\n\nYour Profit: $${playerProfit}\nComputer Profit: $${computerProfit}\n\nYou lost by $${computerProfit - playerProfit}`;
    } else {
        message = `🤝 It's a TIE!\n\nBoth earned: $${playerProfit}`;
    }

    // Show paradox analysis
    const playerLand = gameState.player.landPlots.length;
    const computerLand = gameState.computer.landPlots.length;
    const totalLand = playerLand + computerLand;
    const startLand = 6;

    message += `\n\n🌍 Jevons Paradox Analysis:\nStarting land: ${startLand} plots\nFinal land: ${totalLand} plots\nIncrease: ${totalLand - startLand} plots (${Math.round((totalLand - startLand) / startLand * 100)}%)`;

    message += `\n\nDespite technology making farming more efficient, the total land used INCREASED because it became more profitable!`;

    showGameOverModal(message);
}

// Show Game Over Modal
function showGameOverModal(message) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 20px;
        max-width: 600px;
        text-align: center;
    `;

    content.innerHTML = `
        <h2 style="color: #667eea; margin-bottom: 20px;">Game Over!</h2>
        <pre style="text-align: left; white-space: pre-wrap; font-family: Arial; font-size: 16px; line-height: 1.8;">${message}</pre>
        <button onclick="location.reload()" style="
            margin-top: 30px;
            padding: 15px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 18px;
            cursor: pointer;
        ">Play Again</button>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);
}

// Check for Jevons Paradox
function checkParadox() {
    if (!gameState.player.hasUpgraded && !gameState.computer.hasUpgraded) {
        return;
    }

    const totalLand = gameState.player.landPlots.length + gameState.computer.landPlots.length;
    const startLand = 6;

    if (totalLand > startLand + 4) {
        const paradoxAlert = document.getElementById('paradoxAlert');
        const paradoxText = document.getElementById('paradoxText');

        paradoxAlert.classList.remove('hidden');
        paradoxText.innerHTML = `
            Both farmers started with 3 plots each (6 total).<br><br>
            Now there are <strong>${totalLand} plots</strong> being farmed!<br><br>
            Even though technology made each plot more productive,
            the total land use INCREASED by <strong>${totalLand - startLand} plots</strong>!<br><br>
            This is the <strong>Jevons Paradox</strong>: Efficiency led to MORE resource consumption!
        `;
    }
}

// Update Insights
function updateInsights() {
    const insights = document.getElementById('insights');

    const playerProfit = gameState.player.totalProfit;
    const computerProfit = gameState.computer.totalProfit;
    const turnsLeft = gameState.maxTurns - gameState.turn + 1;

    let insightText = '<p><strong>Current Analysis:</strong></p>';

    insightText += `<p>🏆 <strong>Profit Race:</strong><br>`;
    if (playerProfit > computerProfit) {
        insightText += `You're ahead by $${playerProfit - computerProfit}!`;
    } else if (computerProfit > playerProfit) {
        insightText += `Computer ahead by $${computerProfit - playerProfit}!`;
    } else {
        insightText += `It's tied at $${playerProfit}!`;
    }
    insightText += `</p>`;

    insightText += `<p>⏰ ${turnsLeft} turns remaining</p>`;

    const totalLand = gameState.player.landPlots.length + gameState.computer.landPlots.length;
    insightText += `<p>🌍 Total land in use: ${totalLand} plots</p>`;

    if (gameState.player.productivityLevel > 1 || gameState.computer.productivityLevel > 1) {
        insightText += `<p>📈 Technology has improved, but notice how both farmers keep expanding land use!</p>`;
    }

    const playerEarningsPerTurn = calculateEarnings('player');
    insightText += `<p>💰 Your earnings per turn: $${playerEarningsPerTurn}</p>`;

    const forestsLeft = gameState.plots.filter(p => p.type === 'forest').length;
    insightText += `<p>🌲 Forests remaining: ${forestsLeft} plots</p>`;

    insights.innerHTML = insightText;
}

// Update Display
function updateDisplay() {
    // Player stats
    document.getElementById('playerMoney').textContent = `$${gameState.player.money}`;
    document.getElementById('playerProfit').textContent = `$${gameState.player.totalProfit}`;
    document.getElementById('playerLand').textContent = `${gameState.player.landPlots.length} plots`;
    document.getElementById('playerProductivity').textContent = `${gameState.player.productivityLevel}x`;

    // Computer stats
    document.getElementById('computerMoney').textContent = `$${gameState.computer.money}`;
    document.getElementById('computerProfit').textContent = `$${gameState.computer.totalProfit}`;
    document.getElementById('computerLand').textContent = `${gameState.computer.landPlots.length} plots`;
    document.getElementById('computerProductivity').textContent = `${gameState.computer.productivityLevel}x`;

    // Game stats
    document.getElementById('turn').textContent = `${gameState.turn} / ${gameState.maxTurns}`;
    document.getElementById('emptyLandCost').textContent = gameState.emptyLandCost;
    document.getElementById('forestCost').textContent = gameState.forestCost;
    document.getElementById('techCost').textContent = gameState.techCost;

    // Update button states
    const upgradeBtn = document.getElementById('upgradeProductivityBtn');
    upgradeBtn.disabled = gameState.player.money < gameState.techCost || gameState.gameOver;

    const nextTurnBtn = document.getElementById('nextTurnBtn');
    nextTurnBtn.disabled = gameState.gameOver;
}

// Render Farm Grid
function renderFarmGrid() {
    const grid = document.getElementById('farmGrid');
    grid.innerHTML = '';

    gameState.plots.forEach((plot) => {
        const plotDiv = document.createElement('div');
        plotDiv.className = 'farm-plot';
        plotDiv.dataset.id = plot.id;

        if (plot.type === 'forest') {
            plotDiv.classList.add('forest');
            plotDiv.innerHTML = '🌲';
            plotDiv.title = `Forest - Click to convert to farmland ($${gameState.forestCost})`;
            plotDiv.onclick = () => buyForestPlot(plot.id);
            plotDiv.style.cursor = 'pointer';
        } else if (plot.type === 'farmland' && plot.owner === 'player') {
            plotDiv.classList.add('player-farm');
            plotDiv.innerHTML = '🌾';
            plotDiv.title = 'Your farm';
            if (gameState.player.productivityLevel > 1) {
                const indicator = document.createElement('div');
                indicator.className = 'productivity-indicator';
                indicator.textContent = `${gameState.player.productivityLevel}x`;
                indicator.style.background = 'rgba(76, 175, 80, 0.9)';
                plotDiv.appendChild(indicator);
            }
        } else if (plot.type === 'farmland' && plot.owner === 'computer') {
            plotDiv.classList.add('computer-farm');
            plotDiv.innerHTML = '🌽';
            plotDiv.title = 'Computer farm';
            if (gameState.computer.productivityLevel > 1) {
                const indicator = document.createElement('div');
                indicator.className = 'productivity-indicator';
                indicator.textContent = `${gameState.computer.productivityLevel}x`;
                indicator.style.background = 'rgba(244, 67, 54, 0.9)';
                plotDiv.appendChild(indicator);
            }
        } else {
            plotDiv.classList.add('empty');
            plotDiv.title = `Empty land - Click to purchase for $${gameState.emptyLandCost}`;
            plotDiv.onclick = () => buyEmptyLand(plot.id);
            plotDiv.style.cursor = 'pointer';
        }

        grid.appendChild(plotDiv);
    });
}

// Render Chart
function renderChart() {
    const canvas = document.getElementById('landChart');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (gameState.player.landHistory.length === 0) {
        ctx.fillStyle = '#999';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Play turns to see land use graph', width / 2, height / 2);
        return;
    }

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = (height - 40) * (i / 5) + 20;
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(width - 10, y);
        ctx.stroke();
    }

    // Calculate scale
    const maxLand = Math.max(
        ...gameState.player.landHistory,
        ...gameState.computer.landHistory,
        10
    );
    const dataPoints = gameState.player.landHistory.length;
    const xStep = (width - 50) / Math.max(dataPoints - 1, 1);
    const yScale = (height - 60) / maxLand;

    // Draw player line
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 3;
    ctx.beginPath();
    gameState.player.landHistory.forEach((land, index) => {
        const x = 40 + index * xStep;
        const y = height - 20 - (land * yScale);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw computer line
    ctx.strokeStyle = '#f44336';
    ctx.lineWidth = 3;
    ctx.beginPath();
    gameState.computer.landHistory.forEach((land, index) => {
        const x = 40 + index * xStep;
        const y = height - 20 - (land * yScale);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw points
    ctx.fillStyle = '#4CAF50';
    gameState.player.landHistory.forEach((land, index) => {
        const x = 40 + index * xStep;
        const y = height - 20 - (land * yScale);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.fillStyle = '#f44336';
    gameState.computer.landHistory.forEach((land, index) => {
        const x = 40 + index * xStep;
        const y = height - 20 - (land * yScale);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Labels
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Turn', width / 2, height - 2);

    ctx.save();
    ctx.translate(12, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Land Plots', 0, 0);
    ctx.restore();

    // Legend
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(width - 100, 30, 15, 15);
    ctx.fillStyle = '#333';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('You', width - 80, 42);

    ctx.fillStyle = '#f44336';
    ctx.fillRect(width - 100, 50, 15, 15);
    ctx.fillStyle = '#333';
    ctx.fillText('Computer', width - 80, 62);

    // Scale labels
    ctx.textAlign = 'right';
    ctx.fillText('0', 35, height - 15);
    ctx.fillText(maxLand.toString(), 35, 25);
}

// Show Feedback
function showFeedback(message) {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px 40px;
        border-radius: 10px;
        font-size: 1.2em;
        z-index: 1000;
        animation: fadeInOut 2s ease-in-out;
    `;
    feedback.textContent = message;

    document.body.appendChild(feedback);

    setTimeout(() => {
        feedback.remove();
    }, 2000);
}

// Add animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
`;
document.head.appendChild(style);

// Start game
window.addEventListener('DOMContentLoaded', init);
