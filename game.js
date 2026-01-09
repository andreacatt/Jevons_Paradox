// Game State
const gameState = {
    player: {
        money: 100,
        landPlots: [],
        productivityLevel: 1,
        totalProfit: 0,
        landHistory: [],
        hasUpgraded: false,
        plotsOwnedAtTurnStart: [],
        purchasesThisTurn: 0
    },
    computer: {
        money: 100,
        landPlots: [],
        productivityLevel: 1,
        totalProfit: 0,
        landHistory: [],
        hasUpgraded: false,
        plotsOwnedAtTurnStart: [],
        purchasesThisTurn: 0
    },
    turn: 1,
    maxTurns: 20,
    cropsPerPlot: 10,
    cropPrice: 5,
    emptyLandCost: 30,
    forestCost: 60,
    techCost: 100,
    maxPurchasesPerTurn: 3,
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

    // Initialize turn start plots
    gameState.player.plotsOwnedAtTurnStart = [...gameState.player.landPlots];
    gameState.computer.plotsOwnedAtTurnStart = [...gameState.computer.landPlots];
}

// Check if a plot is adjacent to any plot owned at turn start
function isAdjacentToOwnedPlots(plotId, owner) {
    const data = gameState[owner];
    const plot = gameState.plots[plotId];

    // Get adjacent plot IDs (up, down, left, right)
    const adjacentIds = [];
    const row = plot.row;
    const col = plot.col;

    // Up
    if (row > 0) adjacentIds.push(plotId - gameState.gridSize);
    // Down
    if (row < gameState.gridSize - 1) adjacentIds.push(plotId + gameState.gridSize);
    // Left
    if (col > 0) adjacentIds.push(plotId - 1);
    // Right
    if (col < gameState.gridSize - 1) adjacentIds.push(plotId + 1);

    // Check if any adjacent plot was owned at turn start
    return adjacentIds.some(id => data.plotsOwnedAtTurnStart.includes(id));
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

    // Reset for new turn - save current plots as turn start
    gameState.player.plotsOwnedAtTurnStart = [...gameState.player.landPlots];
    gameState.computer.plotsOwnedAtTurnStart = [...gameState.computer.landPlots];
    gameState.player.purchasesThisTurn = 0;
    gameState.computer.purchasesThisTurn = 0;

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

    // Check purchase limit
    if (gameState.player.purchasesThisTurn >= gameState.maxPurchasesPerTurn) {
        showFeedback('Maximum 3 plots per turn! Wait for next turn.');
        return;
    }

    // Check adjacency
    if (!isAdjacentToOwnedPlots(plotId, 'player')) {
        showFeedback('Must be adjacent to your existing land!');
        return;
    }

    gameState.player.money -= gameState.emptyLandCost;
    plot.type = 'farmland';
    plot.owner = 'player';
    gameState.player.landPlots.push(plotId);
    gameState.player.purchasesThisTurn++;

    renderFarmGrid();
    updateDisplay();
    updateInsights();

    const remaining = gameState.maxPurchasesPerTurn - gameState.player.purchasesThisTurn;
    showFeedback(`Purchased empty land! (${remaining} purchases left this turn)`);
}

// Buy Forest Plot
function buyForestPlot(plotId) {
    if (gameState.gameOver) return;

    const plot = gameState.plots[plotId];
    if (plot.type !== 'forest' || plot.owner !== null) return;
    if (gameState.player.money < gameState.forestCost) return;

    // Check purchase limit
    if (gameState.player.purchasesThisTurn >= gameState.maxPurchasesPerTurn) {
        showFeedback('Maximum 3 plots per turn! Wait for next turn.');
        return;
    }

    // Check adjacency
    if (!isAdjacentToOwnedPlots(plotId, 'player')) {
        showFeedback('Must be adjacent to your existing land!');
        return;
    }

    gameState.player.money -= gameState.forestCost;
    plot.type = 'farmland';
    plot.owner = 'player';
    gameState.player.landPlots.push(plotId);
    gameState.player.purchasesThisTurn++;

    renderFarmGrid();
    updateDisplay();
    updateInsights();

    const remaining = gameState.maxPurchasesPerTurn - gameState.player.purchasesThisTurn;
    showFeedback(`Converted forest to farmland! (${remaining} purchases left this turn)`);
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

// Computer AI Turn - Smart Strategy with Adjacency and Purchase Limits
function computerTurn() {
    const computer = gameState.computer;
    const turnsLeft = gameState.maxTurns - gameState.turn;

    // Get available adjacent plots
    function getAdjacentAvailablePlots(type) {
        return gameState.plots.filter(p =>
            p.type === type &&
            p.owner === null &&
            isAdjacentToOwnedPlots(p.id, 'computer')
        );
    }

    // Try to purchase a plot
    function tryPurchase(plotType, cost) {
        if (computer.purchasesThisTurn >= gameState.maxPurchasesPerTurn) return false;
        if (computer.money < cost) return false;

        const availablePlots = getAdjacentAvailablePlots(plotType);
        if (availablePlots.length === 0) return false;

        // Pick a random adjacent plot
        const plot = availablePlots[Math.floor(Math.random() * availablePlots.length)];
        plot.type = 'farmland';
        plot.owner = 'computer';
        computer.landPlots.push(plot.id);
        computer.money -= cost;
        computer.purchasesThisTurn++;
        return true;
    }

    // Strategy 1: Early game - aggressive land expansion (prioritize cheap empty land)
    if (turnsLeft > 15) {
        while (computer.purchasesThisTurn < gameState.maxPurchasesPerTurn) {
            if (!tryPurchase('empty', gameState.emptyLandCost)) break;
        }
    }

    // Strategy 2: Upgrade tech when we have enough land and money
    if (computer.money >= gameState.techCost && computer.landPlots.length >= 4 &&
        computer.productivityLevel < 3) {
        const upgradeValue = computer.landPlots.length * gameState.cropsPerPlot * 0.5 * gameState.cropPrice * turnsLeft;
        if (upgradeValue > gameState.techCost * 1.2) {
            upgradeProductivity('computer');
        }
    }

    // Strategy 3: Mid-game - balance between empty land and forests
    if (turnsLeft > 8 && turnsLeft <= 15) {
        // Try to buy empty land first
        while (computer.purchasesThisTurn < gameState.maxPurchasesPerTurn) {
            if (tryPurchase('empty', gameState.emptyLandCost)) continue;
            // If no empty land, try forests if ROI is good
            if (turnsLeft > 5) {
                const forestROI = gameState.cropsPerPlot * computer.productivityLevel * gameState.cropPrice * turnsLeft;
                if (forestROI > gameState.forestCost * 1.3) {
                    if (!tryPurchase('forest', gameState.forestCost)) break;
                } else {
                    break;
                }
            } else {
                break;
            }
        }
    }

    // Strategy 4: Late game - aggressive spending on anything profitable
    if (turnsLeft <= 8 && turnsLeft > 3) {
        const emptyLandROI = turnsLeft * gameState.cropsPerPlot * computer.productivityLevel * gameState.cropPrice;
        const forestROI = turnsLeft * gameState.cropsPerPlot * computer.productivityLevel * gameState.cropPrice;

        while (computer.purchasesThisTurn < gameState.maxPurchasesPerTurn) {
            if (emptyLandROI > gameState.emptyLandCost && tryPurchase('empty', gameState.emptyLandCost)) {
                continue;
            } else if (forestROI > gameState.forestCost && tryPurchase('forest', gameState.forestCost)) {
                continue;
            } else {
                break;
            }
        }
    }

    // Strategy 5: Very late game - buy tech if we haven't maxed out
    if (turnsLeft <= 3 && computer.money >= gameState.techCost &&
        computer.productivityLevel < 3 && computer.landPlots.length > 5) {
        upgradeProductivity('computer');
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

    const purchasesRemaining = gameState.maxPurchasesPerTurn - gameState.player.purchasesThisTurn;
    document.getElementById('purchasesLeft').textContent = purchasesRemaining;

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
