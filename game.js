// Game State
const gameState = {
    money: 100,
    landPlots: 3,
    productivityLevel: 1,
    turn: 1,
    cropsPerPlot: 10,
    cropPrice: 5,
    landCost: 50,
    techCost: 100,
    maxPlots: 64,
    landHistory: [],
    productionHistory: [],
    initialProduction: 0,
    hasUpgraded: false,
    turnsSinceUpgrade: 0
};

// Initialize game
function init() {
    gameState.initialProduction = gameState.landPlots * gameState.cropsPerPlot * gameState.productivityLevel;
    updateDisplay();
    renderFarmGrid();
    renderChart();

    // Event listeners
    document.getElementById('nextTurnBtn').addEventListener('click', nextTurn);
    document.getElementById('buyLandBtn').addEventListener('click', buyLand);
    document.getElementById('upgradeProductivityBtn').addEventListener('click', upgradeProductivity);
}

// Next Turn - Harvest and Sell
function nextTurn() {
    // Calculate production
    const totalCrops = gameState.landPlots * gameState.cropsPerPlot * gameState.productivityLevel;
    const earnings = totalCrops * gameState.cropPrice;

    gameState.money += earnings;
    gameState.turn++;

    if (gameState.hasUpgraded) {
        gameState.turnsSinceUpgrade++;
    }

    // Record history
    gameState.landHistory.push(gameState.landPlots);
    gameState.productionHistory.push(totalCrops);

    // Check for paradox
    checkParadox();

    updateDisplay();
    renderChart();
    updateInsights();

    // Show earnings feedback
    showFeedback(`Harvested ${totalCrops} crops! Earned $${earnings}`);
}

// Buy Land
function buyLand() {
    if (gameState.money >= gameState.landCost && gameState.landPlots < gameState.maxPlots) {
        gameState.money -= gameState.landCost;
        gameState.landPlots++;

        // Land gets slightly more expensive
        gameState.landCost = Math.floor(gameState.landCost * 1.15);

        renderFarmGrid();
        updateDisplay();
        updateInsights();

        showFeedback('Purchased new land plot!');
    }
}

// Upgrade Productivity
function upgradeProductivity() {
    if (gameState.money >= gameState.techCost) {
        gameState.money -= gameState.techCost;
        gameState.productivityLevel += 0.5;
        gameState.hasUpgraded = true;
        gameState.turnsSinceUpgrade = 0;

        // Technology gets more expensive
        gameState.techCost = Math.floor(gameState.techCost * 1.5);

        updateDisplay();
        updateInsights();

        showFeedback('Technology upgraded! Each plot now produces more crops!');
    }
}

// Check for Jevons Paradox
function checkParadox() {
    if (!gameState.hasUpgraded || gameState.turnsSinceUpgrade < 3) {
        return;
    }

    const currentProduction = gameState.landPlots * gameState.cropsPerPlot * gameState.productivityLevel;
    const neededPlots = Math.ceil(gameState.initialProduction / (gameState.cropsPerPlot * gameState.productivityLevel));

    // Paradox occurs when we have more land than needed to meet initial production
    if (gameState.landPlots > neededPlots && gameState.landPlots > 3) {
        const paradoxAlert = document.getElementById('paradoxAlert');
        const paradoxText = document.getElementById('paradoxText');

        paradoxAlert.classList.remove('hidden');
        paradoxText.innerHTML = `
            You started with ${3} plots producing ${gameState.initialProduction} crops total.<br><br>
            With your current technology (${gameState.productivityLevel}x), you only need
            <strong>${neededPlots} plots</strong> to produce the same amount!<br><br>
            But you own <strong>${gameState.landPlots} plots</strong> because it's so profitable!<br><br>
            This is the <strong>Jevons Paradox</strong>: Efficiency improvements led to MORE land use, not less!
        `;
    }
}

// Update Insights
function updateInsights() {
    const insights = document.getElementById('insights');
    const totalProduction = gameState.landPlots * gameState.cropsPerPlot * gameState.productivityLevel;
    const profitPerTurn = totalProduction * gameState.cropPrice;
    const profitPerPlot = gameState.cropsPerPlot * gameState.productivityLevel * gameState.cropPrice;

    let insightText = '<p><strong>Current Analysis:</strong></p>';

    if (gameState.productivityLevel > 1) {
        const neededPlots = Math.ceil(gameState.initialProduction / (gameState.cropsPerPlot * gameState.productivityLevel));
        insightText += `<p>📊 With ${gameState.productivityLevel}x productivity, you only need ${neededPlots} plots to match your initial production of ${gameState.initialProduction} crops.</p>`;

        if (gameState.landPlots > neededPlots) {
            insightText += `<p>⚠️ But you own ${gameState.landPlots} plots! Why? Because each plot earns you $${profitPerPlot}/turn, making expansion highly profitable.</p>`;
        }
    }

    insightText += `<p>💵 Profit per turn: $${profitPerTurn}</p>`;
    insightText += `<p>💰 Profit per plot: $${profitPerPlot}/turn</p>`;

    if (gameState.productivityLevel > 1) {
        insightText += `<p>🔬 Your technology made each acre ${(gameState.productivityLevel * 100).toFixed(0)}% as productive as the original.</p>`;
    }

    if (gameState.landPlots > 5) {
        insightText += `<p>🌍 <strong>Real-world parallel:</strong> This is why global agricultural land use has expanded even as crop yields improved dramatically!</p>`;
    }

    insights.innerHTML = insightText;
}

// Update Display
function updateDisplay() {
    document.getElementById('money').textContent = `$${gameState.money}`;

    const totalProduction = gameState.landPlots * gameState.cropsPerPlot * gameState.productivityLevel;
    document.getElementById('totalProduction').textContent = `${totalProduction} crops/turn`;

    document.getElementById('productivityLevel').textContent = `${gameState.productivityLevel}x`;
    document.getElementById('landCount').textContent = `${gameState.landPlots} plots`;
    document.getElementById('turn').textContent = gameState.turn;
    document.getElementById('landCost').textContent = gameState.landCost;
    document.getElementById('techCost').textContent = gameState.techCost;

    // Update button states
    const buyLandBtn = document.getElementById('buyLandBtn');
    const upgradeBtn = document.getElementById('upgradeProductivityBtn');

    buyLandBtn.disabled = gameState.money < gameState.landCost || gameState.landPlots >= gameState.maxPlots;
    upgradeBtn.disabled = gameState.money < gameState.techCost;
}

// Render Farm Grid
function renderFarmGrid() {
    const grid = document.getElementById('farmGrid');
    grid.innerHTML = '';

    for (let i = 0; i < gameState.maxPlots; i++) {
        const plot = document.createElement('div');
        plot.className = 'farm-plot';

        if (i < gameState.landPlots) {
            plot.classList.add('active');

            // Show productivity indicator if upgraded
            if (gameState.productivityLevel > 1) {
                const indicator = document.createElement('div');
                indicator.className = 'productivity-indicator';
                indicator.textContent = `${gameState.productivityLevel}x`;
                plot.appendChild(indicator);
            }
        } else {
            plot.classList.add('empty');
        }

        grid.appendChild(plot);
    }
}

// Render Chart
function renderChart() {
    const canvas = document.getElementById('landChart');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (gameState.landHistory.length === 0) {
        ctx.fillStyle = '#999';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Play turns to see your land use graph', width / 2, height / 2);
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
    const maxLand = Math.max(...gameState.landHistory, 10);
    const dataPoints = gameState.landHistory.length;
    const xStep = (width - 50) / Math.max(dataPoints - 1, 1);
    const yScale = (height - 60) / maxLand;

    // Draw line
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 3;
    ctx.beginPath();

    gameState.landHistory.forEach((land, index) => {
        const x = 40 + index * xStep;
        const y = height - 20 - (land * yScale);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Draw points
    ctx.fillStyle = '#764ba2';
    gameState.landHistory.forEach((land, index) => {
        const x = 40 + index * xStep;
        const y = height - 20 - (land * yScale);

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw axes labels
    ctx.fillStyle = '#333';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Turn Number', width / 2, height - 2);

    ctx.save();
    ctx.translate(12, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Land Plots', 0, 0);
    ctx.restore();

    // Draw scale labels
    ctx.textAlign = 'right';
    ctx.fillText('0', 35, height - 15);
    ctx.fillText(maxLand.toString(), 35, 25);
}

// Show Feedback
function showFeedback(message) {
    // Create feedback element
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
