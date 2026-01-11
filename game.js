// Game State
const gameState = {
    player: {
        money: 100,
        landPlots: [],
        totalProfit: 0,
        landHistory: [],
        plotsOwnedAtTurnStart: [],
        purchasesThisTurn: 0,
        hasUpgradedThisTurn: false,
        upgradesThisTurn: 0
    },
    computer: {
        money: 100,
        landPlots: [],
        totalProfit: 0,
        landHistory: [],
        plotsOwnedAtTurnStart: [],
        purchasesThisTurn: 0,
        hasUpgradedThisTurn: false,
        upgradesThisTurn: 0
    },
    turn: 1,
    maxTurns: 20,
    cropsPerPlot: 1,
    baseCropPrice: 10,
    emptyLandCost: 30,
    forestCost: 60,
    upgradeCostPerPlot: 40,
    maxUpgradesPerTurn: 3,
    maxPurchasesPerTurn: 3,
    gridSize: 6,
    plots: [],
    gameOver: false,
    gameMode: null, // 'single' or 'two-player'
    currentPlayer: 'player', // For two-player mode
    economicScenario: null // 'autarky' or 'trade'
};

// Initialize game
function init() {
    showModeSelection();
}

function showModeSelection() {
    document.getElementById('modeSelection').style.display = 'flex';
    document.getElementById('scenarioSelection').style.display = 'none';
    document.getElementById('gameContent').style.display = 'none';

    document.getElementById('singlePlayerBtn').onclick = () => showScenarioSelection('single');
    document.getElementById('twoPlayerBtn').onclick = () => showScenarioSelection('two-player');
}

function showScenarioSelection(mode) {
    gameState.gameMode = mode;
    document.getElementById('modeSelection').style.display = 'none';
    document.getElementById('scenarioSelection').style.display = 'flex';

    document.getElementById('autarkyBtn').onclick = () => startGame(mode, 'autarky');
    document.getElementById('tradeBtn').onclick = () => startGame(mode, 'trade');
}

function startGame(mode, scenario) {
    gameState.gameMode = mode;
    gameState.economicScenario = scenario;
    gameState.currentPlayer = 'player';

    document.getElementById('scenarioSelection').style.display = 'none';
    document.getElementById('gameContent').style.display = 'block';

    initializePlots();
    assignStartingPlots();
    updateDisplay();
    renderFarmGrid();
    renderChart();

    // Event listeners
    document.getElementById('nextTurnBtn').addEventListener('click', handleNextTurn);
    document.getElementById('upgradeBtn').addEventListener('click', () => enterUpgradeMode(gameState.currentPlayer));
    document.getElementById('finishUpgradeBtn').addEventListener('click', () => finishUpgrading(gameState.currentPlayer));

    // Update UI based on mode
    const opponentName = mode === 'single' ? 'Computer' : 'Player 2';
    document.querySelector('.computer-panel h2').textContent = mode === 'single' ? '🤖 Computer' : '👤 Player 2';

    const scenarioName = scenario === 'autarky' ? 'Autarky (No Trade)' : 'International Trade';
    showFeedback(`Game started! ${mode === 'single' ? 'Beat the computer!' : 'Player 1 vs Player 2'} | ${scenarioName}`);
    updateCurrentPlayerDisplay();
}

// Initialize plots (all empty initially)
function initializePlots() {
    const totalPlots = gameState.gridSize * gameState.gridSize;
    gameState.plots = [];

    for (let i = 0; i < totalPlots; i++) {
        const row = Math.floor(i / gameState.gridSize);
        const col = i % gameState.gridSize;

        // All plots start as empty - forest and starting positions are assigned later
        gameState.plots.push({
            id: i,
            type: 'empty',
            owner: null,
            row: row,
            col: col,
            upgraded: false
        });
    }
}

// Assign starting plots
function assignStartingPlots() {
    // Define possible 3-cell contiguous patterns for starting positions
    const threeCellPatterns = [
        [0, 1, 6],     // Bottom-left L
        [4, 5, 11],    // Bottom-right L
        [0, 6, 12],    // Left edge vertical
        [5, 11, 17],   // Right edge vertical
        [0, 1, 2],     // Top row
        [33, 34, 35],  // Bottom row
        [1, 2, 7],     // Top-left L variant
        [3, 4, 10],    // Top-right L variant
        [24, 30, 31],  // Bottom-left L variant
        [28, 29, 35],  // Bottom-right L variant
        [6, 7, 12],    // Left side L
        [10, 11, 16],  // Right side L
        [14, 20, 21],  // Middle L
        [15, 21, 22],  // Middle L variant
    ];

    // Define possible 7-cell contiguous patterns for forest
    const sevenCellPatterns = [
        [14, 15, 20, 21, 22, 26, 27],  // Center + shape
        [8, 9, 14, 15, 20, 21, 22],    // Upper-middle cluster
        [13, 14, 15, 19, 20, 21, 22],  // Center cluster variant
        [9, 10, 15, 16, 21, 22, 27],   // Right-center cluster
        [7, 8, 13, 14, 19, 20, 25],    // Left-center cluster
        [14, 15, 16, 20, 21, 22, 28],  // Lower-middle cluster
        [18, 19, 20, 24, 25, 26, 30],  // Lower-left cluster
        [20, 21, 22, 26, 27, 28, 32],  // Lower-right cluster
        [6, 7, 8, 12, 13, 14, 18],     // Upper-left cluster
        [10, 11, 16, 17, 22, 23, 28],  // Right-side cluster
        [1, 2, 7, 8, 13, 14, 19],      // Top-left extended
        [3, 4, 9, 10, 15, 16, 21],     // Top-right extended
    ];

    // Randomly select starting plots for player
    const playerPattern = threeCellPatterns[Math.floor(Math.random() * threeCellPatterns.length)];
    playerPattern.forEach(id => {
        gameState.plots[id].type = 'farmland';
        gameState.plots[id].owner = 'player';
        gameState.player.landPlots.push(id);
    });

    // Find valid patterns for computer that don't overlap with player
    const validComputerPatterns = threeCellPatterns.filter(pattern =>
        !pattern.some(id => playerPattern.includes(id))
    );

    // Randomly select starting plots for computer
    const computerPattern = validComputerPatterns[Math.floor(Math.random() * validComputerPatterns.length)];
    const opponent = 'computer';
    computerPattern.forEach(id => {
        gameState.plots[id].type = 'farmland';
        gameState.plots[id].owner = opponent;
        gameState[opponent].landPlots.push(id);
    });

    // Find valid patterns for forest that don't overlap with player or computer
    const usedCells = [...playerPattern, ...computerPattern];
    const validForestPatterns = sevenCellPatterns.filter(pattern =>
        !pattern.some(id => usedCells.includes(id))
    );

    // Randomly select forest plots
    if (validForestPatterns.length > 0) {
        const forestPattern = validForestPatterns[Math.floor(Math.random() * validForestPatterns.length)];
        forestPattern.forEach(id => {
            gameState.plots[id].type = 'forest';
        });
    } else {
        console.warn('WARNING: No valid forest pattern found! All patterns overlap with player starting positions.');
        console.warn('Player pattern:', playerPattern);
        console.warn('Computer pattern:', computerPattern);
    }

    // Initialize turn start plots
    gameState.player.plotsOwnedAtTurnStart = [...gameState.player.landPlots];
    gameState.computer.plotsOwnedAtTurnStart = [...gameState.computer.landPlots];
}

// Calculate crop price based on total agricultural plots (downward sloping demand)
function calculateCropPrice() {
    const totalAgriculturalPlots = gameState.plots.filter(p => p.type === 'farmland').length;

    let price;
    if (gameState.economicScenario === 'autarky') {
        // Autarky: No trade - demand is limited
        // Price decreases linearly to $0 when all 36 plots are cultivated
        // Formula: Price = 10 - (10/36) × totalPlots
        // At 0 plots: $10, At 36 plots: $0
        price = gameState.baseCropPrice - (gameState.baseCropPrice / 36) * totalAgriculturalPlots;
        price = Math.max(price, 0); // Can reach 0
    } else {
        // International Trade: Access to global markets
        // Price decreases by only 20% when all plots are cultivated
        // Formula: Price = 10 - (2/36) × totalPlots
        // At 0 plots: $10, At 36 plots: $8 (20% decrease)
        price = gameState.baseCropPrice - (0.2 * gameState.baseCropPrice / 36) * totalAgriculturalPlots;
        price = Math.max(price, gameState.baseCropPrice * 0.8); // Minimum 80% of base price
    }

    return Math.round(price * 100) / 100; // Round to 2 decimals
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
// Handle next turn button - works differently for single vs two-player
function handleNextTurn() {
    if (gameState.gameOver) return;

    if (gameState.gameMode === 'two-player') {
        // In two-player mode, switch between players
        if (gameState.currentPlayer === 'player') {
            // Player 1 finished, switch to Player 2
            gameState.currentPlayer = 'computer';
            updateCurrentPlayerDisplay();
            showFeedback('Player 2\'s turn! Make your moves.');
        } else {
            // Player 2 finished, process turn for both players
            gameState.currentPlayer = 'player';
            nextTurn();
        }
    } else {
        // Single-player mode - process turn immediately
        nextTurn();
    }
}

function nextTurn() {
    if (gameState.gameOver) return;

    // SAVE pre-harvest money for budget constraint
    const computerMoneyBeforeHarvest = gameState.computer.money;
    const playerMoneyBeforeHarvest = gameState.player.money;

    // Player harvest
    const playerEarnings = calculateEarnings('player');
    gameState.player.money += playerEarnings;
    gameState.player.totalProfit += playerEarnings;

    // Computer/Player2 harvest
    const computerEarnings = calculateEarnings('computer');
    gameState.computer.money += computerEarnings;
    gameState.computer.totalProfit += computerEarnings;

    console.log(`[TURN ${gameState.turn}] Computer Budget:`);
    console.log(`  Money before harvest: $${computerMoneyBeforeHarvest}`);
    console.log(`  Harvest earnings: +$${computerEarnings.toFixed(2)}`);
    console.log(`  Money after harvest: $${gameState.computer.money.toFixed(2)}`);
    console.log(`  BUDGET LIMIT for spending: $${computerMoneyBeforeHarvest} (cannot spend harvest money same turn)`);

    // Record history
    gameState.player.landHistory.push(gameState.player.landPlots.length);
    gameState.computer.landHistory.push(gameState.computer.landPlots.length);

    // Reset for new turn - save current plots as turn start
    gameState.player.plotsOwnedAtTurnStart = [...gameState.player.landPlots];
    gameState.computer.plotsOwnedAtTurnStart = [...gameState.computer.landPlots];
    gameState.player.purchasesThisTurn = 0;
    gameState.computer.purchasesThisTurn = 0;
    gameState.player.hasUpgradedThisTurn = false;
    gameState.player.upgradesThisTurn = 0;
    gameState.computer.hasUpgradedThisTurn = false;
    gameState.computer.upgradesThisTurn = 0;

    // Computer AI turn (if single-player mode)
    if (gameState.gameMode === 'single') {
        // CRITICAL: Pass the budget limit (money before harvest) to prevent spending harvest money
        computerTurn(computerMoneyBeforeHarvest);
    }

    gameState.turn++;

    // Check for game end conditions
    const totalCultivatedPlots = gameState.plots.filter(p => p.type === 'farmland').length;
    if (gameState.turn > gameState.maxTurns || totalCultivatedPlots >= 36) {
        endGame();
    }

    updateDisplay();
    renderFarmGrid(); // Re-render grid to show computer's upgrades and purchases
    renderChart();
    updateInsights();
    checkParadox();
    updateCurrentPlayerDisplay();

    // Calculate crop totals for feedback
    const cropPrice = calculateCropPrice();
    let player1Crops = 0;
    gameState.player.landPlots.forEach(plotId => {
        const plot = gameState.plots[plotId];
        player1Crops += gameState.cropsPerPlot * (plot.upgraded ? 3 : 1);
    });
    let player2Crops = 0;
    gameState.computer.landPlots.forEach(plotId => {
        const plot = gameState.plots[plotId];
        player2Crops += gameState.cropsPerPlot * (plot.upgraded ? 3 : 1);
    });

    // Show revenue calculation in a prominent display for 4 seconds
    const turnLabel = `Turn ${gameState.turn - 1}`;
    const player2Name = gameState.gameMode === 'single' ? 'Computer' : 'Player 2';
    showRevenueDisplay(turnLabel, player1Crops, player2Crops, cropPrice, playerEarnings, computerEarnings, player2Name);
}

// Show revenue calculation display for 4 seconds
function showRevenueDisplay(turnLabel, player1Crops, player2Crops, cropPrice, playerEarnings, computerEarnings, player2Name) {
    const revenueDisplay = document.getElementById('revenueDisplay');
    if (!revenueDisplay) return;

    const content = `
        <div style="margin-bottom: 15px; font-size: 1.3em; font-weight: bold; color: #667eea;">
            ${turnLabel} - Harvest Results
        </div>
        <div style="margin-bottom: 10px; padding: 10px; background: #e8f5e9; border-radius: 8px;">
            <strong>Player 1:</strong><br>
            ${player1Crops} crops × $${cropPrice.toFixed(2)}/crop = <strong>$${playerEarnings.toFixed(2)}</strong>
        </div>
        <div style="padding: 10px; background: #ffebee; border-radius: 8px;">
            <strong>${player2Name}:</strong><br>
            ${player2Crops} crops × $${cropPrice.toFixed(2)}/crop = <strong>$${computerEarnings.toFixed(2)}</strong>
        </div>
    `;

    revenueDisplay.innerHTML = content;
    revenueDisplay.style.display = 'block';

    // Hide after 4 seconds
    setTimeout(() => {
        revenueDisplay.style.display = 'none';
    }, 4000);
}

// Update UI to show whose turn it is
function updateCurrentPlayerDisplay() {
    const turnIndicator = document.getElementById('currentTurnIndicator');
    if (!turnIndicator) return;

    if (gameState.gameMode === 'two-player') {
        const currentPlayerName = gameState.currentPlayer === 'player' ? 'Player 1' : 'Player 2';
        turnIndicator.textContent = `${currentPlayerName}'s Turn`;
        turnIndicator.style.display = 'block';

        // Highlight the current player's panel
        const playerPanel = document.querySelector('.player-panel');
        const computerPanel = document.querySelector('.computer-panel');

        if (gameState.currentPlayer === 'player') {
            playerPanel.style.borderColor = '#4caf50';
            playerPanel.style.borderWidth = '4px';
            computerPanel.style.borderColor = '#ccc';
            computerPanel.style.borderWidth = '2px';
        } else {
            playerPanel.style.borderColor = '#ccc';
            playerPanel.style.borderWidth = '2px';
            computerPanel.style.borderColor = '#f44336';
            computerPanel.style.borderWidth = '4px';
        }
    } else {
        turnIndicator.style.display = 'none';
    }
}

// Calculate earnings for a player
function calculateEarnings(owner) {
    const data = gameState[owner];
    const cropPrice = calculateCropPrice();

    let totalCrops = 0;
    // Calculate crops for each plot (upgraded plots produce 3x)
    data.landPlots.forEach(plotId => {
        const plot = gameState.plots[plotId];
        const multiplier = plot.upgraded ? 3 : 1;
        totalCrops += gameState.cropsPerPlot * multiplier;
    });

    return totalCrops * cropPrice;
}

// Buy Empty Land Plot
function buyEmptyLand(plotId) {
    if (gameState.gameOver) return;

    const currentPlayer = gameState.currentPlayer;
    const data = gameState[currentPlayer];
    const plot = gameState.plots[plotId];

    if (plot.type !== 'empty' || plot.owner !== null) return;
    if (data.money < gameState.emptyLandCost) return;

    // Check purchase limit
    if (data.purchasesThisTurn >= gameState.maxPurchasesPerTurn) {
        showFeedback('Maximum 3 plots per turn! Wait for next turn.');
        return;
    }

    // Check adjacency
    if (!isAdjacentToOwnedPlots(plotId, currentPlayer)) {
        showFeedback('Must be adjacent to your existing land!');
        return;
    }

    data.money -= gameState.emptyLandCost;
    plot.type = 'farmland';
    plot.owner = currentPlayer;
    data.landPlots.push(plotId);
    data.purchasesThisTurn++;

    renderFarmGrid();
    updateDisplay();
    updateInsights();

    const remaining = gameState.maxPurchasesPerTurn - data.purchasesThisTurn;
    showFeedback(`Purchased empty land! (${remaining} purchases left this turn)`);
}

// Buy Forest Plot
function buyForestPlot(plotId) {
    if (gameState.gameOver) return;

    const currentPlayer = gameState.currentPlayer;
    const data = gameState[currentPlayer];
    const plot = gameState.plots[plotId];

    if (plot.type !== 'forest' || plot.owner !== null) return;
    if (data.money < gameState.forestCost) return;

    // Check purchase limit
    if (data.purchasesThisTurn >= gameState.maxPurchasesPerTurn) {
        showFeedback('Maximum 3 plots per turn! Wait for next turn.');
        return;
    }

    // Check adjacency
    if (!isAdjacentToOwnedPlots(plotId, currentPlayer)) {
        showFeedback('Must be adjacent to your existing land!');
        return;
    }

    data.money -= gameState.forestCost;
    plot.type = 'farmland';
    plot.owner = currentPlayer;
    data.landPlots.push(plotId);
    data.purchasesThisTurn++;

    renderFarmGrid();
    updateDisplay();
    updateInsights();

    const remaining = gameState.maxPurchasesPerTurn - data.purchasesThisTurn;
    showFeedback(`Converted forest to farmland! (${remaining} purchases left this turn)`);
}

// Upgrade Plots - click on plots to upgrade them
let upgradeMode = null; // null, 'player', or 'computer'

function enterUpgradeMode(owner) {
    if (gameState.gameOver) return;
    const data = gameState[owner];

    // Check if already upgraded this turn
    if (data.hasUpgradedThisTurn) {
        showFeedback('You can only upgrade once per turn!');
        return;
    }

    // Get unupgraded plots owned by this player
    const unupgradedPlots = data.landPlots.filter(id => !gameState.plots[id].upgraded);

    if (unupgradedPlots.length === 0) {
        showFeedback('All your plots are already upgraded!');
        return;
    }

    upgradeMode = owner;
    showFeedback('Click up to 3 of your plots to upgrade them ($40 each). Click "Done" when finished.');

    // Highlight available plots for upgrade
    renderFarmGrid();
    updateDisplay();
}

function upgradePlot(plotId, owner) {
    const data = gameState[owner];
    const plot = gameState.plots[plotId];

    // Validate
    if (!data.landPlots.includes(plotId)) return;
    if (plot.upgraded) {
        showFeedback('This plot is already upgraded!');
        return;
    }
    if (data.upgradesThisTurn >= gameState.maxUpgradesPerTurn) {
        showFeedback('Maximum 3 upgrades per turn!');
        return;
    }
    if (data.money < gameState.upgradeCostPerPlot) {
        showFeedback('Not enough money! Need $' + gameState.upgradeCostPerPlot);
        return;
    }

    // Perform upgrade
    data.money -= gameState.upgradeCostPerPlot;
    plot.upgraded = true;
    data.upgradesThisTurn++;

    const remaining = gameState.maxUpgradesPerTurn - data.upgradesThisTurn;
    showFeedback(`Plot upgraded! (${remaining} upgrades left, $${gameState.upgradeCostPerPlot} each)`);

    if (data.upgradesThisTurn >= gameState.maxUpgradesPerTurn) {
        finishUpgrading(owner);
    } else {
        renderFarmGrid();
        updateDisplay();
    }
}

function finishUpgrading(owner) {
    const data = gameState[owner];
    data.hasUpgradedThisTurn = true;
    upgradeMode = null;

    if (data.upgradesThisTurn > 0) {
        showFeedback(`Upgraded ${data.upgradesThisTurn} plot(s) for $${data.upgradesThisTurn * gameState.upgradeCostPerPlot} total!`);
    }

    renderFarmGrid();
    updateDisplay();
}

// Computer AI Turn - Smart Strategy with New Mechanics
function computerTurn(budgetLimit) {
    const computer = gameState.computer;
    const turnsLeft = gameState.maxTurns - gameState.turn;
    const cropPrice = calculateCropPrice();

    // Track spending to ensure we don't exceed budget
    let moneySpentThisTurn = 0;

    console.log(`[COMPUTER TURN] Starting decisions with budget limit: $${budgetLimit}`);

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

        // CRITICAL: Check budget BEFORE attempting purchase
        // Use budgetLimit to prevent spending harvest money
        if (moneySpentThisTurn + cost > budgetLimit) {
            console.log(`  [PURCHASE BLOCKED] Would exceed budget: spent $${moneySpentThisTurn} + cost $${cost} > limit $${budgetLimit}`);
            return false;
        }
        if (computer.money < cost) return false;

        const availablePlots = getAdjacentAvailablePlots(plotType);
        if (availablePlots.length === 0) return false;

        const plot = availablePlots[Math.floor(Math.random() * availablePlots.length)];
        plot.type = 'farmland';
        plot.owner = 'computer';
        computer.landPlots.push(plot.id);
        computer.money -= cost;
        computer.purchasesThisTurn++;
        moneySpentThisTurn += cost;

        console.log(`  [PURCHASED] ${plotType} plot for $${cost}. Total spent: $${moneySpentThisTurn}/${budgetLimit}`);

        // SANITY CHECK: Ensure money didn't go negative
        if (computer.money < 0) {
            console.error('ERROR: Computer money went negative during land purchase!', computer.money);
            // Revert the purchase
            computer.money += cost;
            plot.type = plotType;
            plot.owner = null;
            computer.landPlots.pop();
            computer.purchasesThisTurn--;
            moneySpentThisTurn -= cost;
            return false;
        }

        return true;
    }

    // Computer upgrade strategy - upgrade plots if profitable
    if (!computer.hasUpgradedThisTurn && computer.landPlots.length >= 3) {
        const unupgradedPlots = computer.landPlots.filter(id => !gameState.plots[id].upgraded);

        if (unupgradedPlots.length > 0) {
            // Calculate ROI for upgrades (3x multiplier means 2x additional crops)
            const additionalCropsPerPlot = gameState.cropsPerPlot * 2; // 2x boost (3x - 1x)
            const upgradeValuePerPlot = additionalCropsPerPlot * cropPrice * turnsLeft;

            // Only consider upgrading if ROI is good
            if (upgradeValuePerPlot > gameState.upgradeCostPerPlot * 1.2 && turnsLeft > 5) {
                // Upgrade plots one at a time, checking budget each time
                let upgradesPerformed = 0;

                console.log(`  [UPGRADE DECISION] ROI looks good. Attempting upgrades...`);

                for (let i = 0; i < unupgradedPlots.length && upgradesPerformed < gameState.maxUpgradesPerTurn; i++) {
                    // CRITICAL: Check budget BEFORE attempting upgrade
                    // Use budgetLimit to prevent spending harvest money
                    if (moneySpentThisTurn + gameState.upgradeCostPerPlot > budgetLimit) {
                        console.log(`  [UPGRADE BLOCKED] Would exceed budget: spent $${moneySpentThisTurn} + cost $${gameState.upgradeCostPerPlot} > limit $${budgetLimit}`);
                        break;
                    }

                    // Double-check current money (shouldn't happen if budget check works)
                    if (computer.money < gameState.upgradeCostPerPlot) {
                        console.log(`  [UPGRADE BLOCKED] Insufficient money: $${computer.money} < $${gameState.upgradeCostPerPlot}`);
                        break;
                    }

                    const plotId = unupgradedPlots[i];

                    // Perform the upgrade
                    gameState.plots[plotId].upgraded = true;
                    computer.money -= gameState.upgradeCostPerPlot;
                    computer.upgradesThisTurn++;
                    upgradesPerformed++;
                    moneySpentThisTurn += gameState.upgradeCostPerPlot;

                    console.log(`  [UPGRADED] Plot ${plotId} for $${gameState.upgradeCostPerPlot}. Total spent: $${moneySpentThisTurn}/$${budgetLimit}`);

                    // SANITY CHECK: Ensure money didn't go negative (defensive programming)
                    if (computer.money < 0) {
                        console.error('ERROR: Computer money went negative during upgrade!', computer.money);
                        computer.money += gameState.upgradeCostPerPlot; // Revert the deduction
                        gameState.plots[plotId].upgraded = false; // Revert the upgrade
                        computer.upgradesThisTurn--;
                        moneySpentThisTurn -= gameState.upgradeCostPerPlot;
                        break;
                    }
                }

                if (upgradesPerformed > 0) {
                    computer.hasUpgradedThisTurn = true;
                    console.log(`  [UPGRADE COMPLETE] Upgraded ${upgradesPerformed} plots`);
                }
            }
        }
    }

    // Land expansion strategy - prioritize cheap empty land
    if (turnsLeft > 12) {
        while (computer.purchasesThisTurn < gameState.maxPurchasesPerTurn) {
            if (!tryPurchase('empty', gameState.emptyLandCost)) break;
        }
    }

    // Mid-game - balance between empty land and forests
    if (turnsLeft > 5 && turnsLeft <= 12) {
        while (computer.purchasesThisTurn < gameState.maxPurchasesPerTurn) {
            if (tryPurchase('empty', gameState.emptyLandCost)) continue;
            if (turnsLeft > 6 && tryPurchase('forest', gameState.forestCost)) continue;
            break;
        }
    }

    // Late game - buy whatever is profitable
    if (turnsLeft <= 5) {
        const emptyLandROI = turnsLeft * gameState.cropsPerPlot * cropPrice;
        const forestROI = turnsLeft * gameState.cropsPerPlot * cropPrice;

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

    // FINAL SANITY CHECK: Ensure computer money is never negative
    if (computer.money < 0) {
        console.error('CRITICAL ERROR: Computer ended turn with negative money!', computer.money);
        console.error('This should never happen. Setting to $0 to prevent game breaking.');
        computer.money = 0;
    }

    // Final spending summary
    console.log(`[COMPUTER TURN END] Budget: $${budgetLimit}, Spent: $${moneySpentThisTurn}, Remaining: $${computer.money.toFixed(2)}`);
    console.log(`  Purchases: ${computer.purchasesThisTurn}, Upgrades: ${computer.upgradesThisTurn}`);
}

// End Game
function endGame() {
    gameState.gameOver = true;

    // Calculate wealth = Net Revenue (money) + Assets (land value at $30/plot)
    const playerWealth = gameState.player.money + (gameState.player.landPlots.length * 30);
    const computerWealth = gameState.computer.money + (gameState.computer.landPlots.length * 30);

    let message = '';
    const opponentName = gameState.gameMode === 'single' ? 'Computer' : 'Player 2';

    if (playerWealth > computerWealth) {
        message = `🎉 YOU WIN! 🎉\n\nYour Wealth: $${Math.round(playerWealth)}\n${opponentName} Wealth: $${Math.round(computerWealth)}\n\nYou have $${Math.round(playerWealth - computerWealth)} more!`;
    } else if (computerWealth > playerWealth) {
        message = `😔 ${opponentName} Wins!\n\nYour Wealth: $${Math.round(playerWealth)}\n${opponentName} Wealth: $${Math.round(computerWealth)}\n\nYou lost by $${Math.round(computerWealth - playerWealth)}`;
    } else {
        message = `🤝 It's a TIE!\n\nBoth have: $${Math.round(playerWealth)} in wealth`;
    }

    message += `\n\n💰 Wealth = Net Revenue + Assets (land × $30)`;

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

    // Calculate wealth = Net Revenue + Assets
    const playerWealth = gameState.player.money + (gameState.player.landPlots.length * 30);
    const computerWealth = gameState.computer.money + (gameState.computer.landPlots.length * 30);
    const turnsLeft = gameState.maxTurns - gameState.turn + 1;

    // Determine opponent name based on game mode
    const opponentName = gameState.gameMode === 'single' ? 'Computer' : 'Player 2';

    let insightText = '<p><strong>Current Analysis:</strong></p>';

    insightText += `<p>🏆 <strong>Wealth Race:</strong><br>`;
    if (playerWealth > computerWealth) {
        insightText += `Player 1 ahead by $${Math.round(playerWealth - computerWealth)}!`;
    } else if (computerWealth > playerWealth) {
        insightText += `${opponentName} ahead by $${Math.round(computerWealth - playerWealth)}!`;
    } else {
        insightText += `It's tied at $${Math.round(playerWealth)}!`;
    }
    insightText += `</p>`;

    insightText += `<p>⏰ ${turnsLeft} turns remaining</p>`;

    const totalLand = gameState.player.landPlots.length + gameState.computer.landPlots.length;
    insightText += `<p>🌍 Total land in use: ${totalLand} plots</p>`;

    if (gameState.player.productivityLevel > 1 || gameState.computer.productivityLevel > 1) {
        insightText += `<p>📈 Technology has improved, but notice how both farmers keep expanding land use!</p>`;
    }

    const playerEarningsPerTurn = calculateEarnings('player');
    insightText += `<p>💰 Player 1 earnings per turn: $${Math.round(playerEarningsPerTurn)}</p>`;

    const forestsLeft = gameState.plots.filter(p => p.type === 'forest').length;
    insightText += `<p>🌲 Forests remaining: ${forestsLeft} plots</p>`;

    insights.innerHTML = insightText;
}

// Update Display
function updateDisplay() {
    // Player stats
    const playerUpgradedPlots = gameState.player.landPlots.filter(id => gameState.plots[id].upgraded).length;
    const playerAssets = gameState.player.landPlots.length * 30; // $30 per agricultural plot
    const playerWealth = gameState.player.money + playerAssets; // Total Wealth = Net Revenue + Assets
    document.getElementById('playerMoney').textContent = `$${Math.round(gameState.player.money)}`;
    document.getElementById('playerProfit').textContent = `$${playerAssets}`;
    document.getElementById('playerWealth').textContent = `$${Math.round(playerWealth)}`;
    document.getElementById('playerLand').textContent = `${gameState.player.landPlots.length} plots`;
    document.getElementById('playerProductivity').textContent = `${playerUpgradedPlots} upgraded`;

    // Computer stats
    const computerUpgradedPlots = gameState.computer.landPlots.filter(id => gameState.plots[id].upgraded).length;
    const computerAssets = gameState.computer.landPlots.length * 30; // $30 per agricultural plot
    const computerWealth = gameState.computer.money + computerAssets; // Total Wealth = Net Revenue + Assets
    document.getElementById('computerMoney').textContent = `$${Math.round(gameState.computer.money)}`;
    document.getElementById('computerProfit').textContent = `$${computerAssets}`;
    document.getElementById('computerWealth').textContent = `$${Math.round(computerWealth)}`;
    document.getElementById('computerLand').textContent = `${gameState.computer.landPlots.length} plots`;
    document.getElementById('computerProductivity').textContent = `${computerUpgradedPlots} upgraded`;

    // Game stats
    document.getElementById('turn').textContent = `${gameState.turn} / ${gameState.maxTurns}`;
    document.getElementById('emptyLandCost').textContent = gameState.emptyLandCost;
    document.getElementById('forestCost').textContent = gameState.forestCost;
    document.getElementById('upgradeCost').textContent = gameState.upgradeCostPerPlot;

    const cropPrice = calculateCropPrice();
    document.getElementById('currentPrice').textContent = `$${cropPrice.toFixed(2)}`;

    // Get current player data for displaying their stats
    const currentPlayerData = gameState[gameState.currentPlayer];
    const purchasesRemaining = gameState.maxPurchasesPerTurn - currentPlayerData.purchasesThisTurn;
    document.getElementById('purchasesLeft').textContent = purchasesRemaining;

    const totalCultivated = gameState.plots.filter(p => p.type === 'farmland').length;
    document.getElementById('cultivatedPlots').textContent = `${totalCultivated} / 36`;

    // Update button states based on current player
    const upgradeBtn = document.getElementById('upgradeBtn');
    upgradeBtn.disabled = currentPlayerData.hasUpgradedThisTurn || gameState.gameOver;

    const finishUpgradeBtn = document.getElementById('finishUpgradeBtn');
    finishUpgradeBtn.style.display = upgradeMode ? 'block' : 'none';

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
            plotDiv.title = `Forest - Click to convert ($${gameState.forestCost})`;
            plotDiv.onclick = () => buyForestPlot(plot.id);
            plotDiv.style.cursor = 'pointer';
        } else if (plot.type === 'farmland' && plot.owner === 'player') {
            plotDiv.classList.add('player-farm');
            if (plot.upgraded) {
                plotDiv.classList.add('upgraded');
                plotDiv.innerHTML = '🌾⭐';
                plotDiv.title = 'Player 1 upgraded farm (3x production)';
            } else {
                plotDiv.innerHTML = '🌾';
                plotDiv.title = 'Player 1 farm';

                // In upgrade mode, allow clicking to upgrade if it's this player's turn
                if (upgradeMode === 'player' && gameState.currentPlayer === 'player') {
                    plotDiv.classList.add('upgradeable');
                    plotDiv.style.cursor = 'pointer';
                    plotDiv.onclick = () => upgradePlot(plot.id, 'player');
                    plotDiv.title = 'Click to upgrade ($40)';
                }
            }
        } else if (plot.type === 'farmland' && plot.owner === 'computer') {
            plotDiv.classList.add('computer-farm');
            const ownerLabel = gameState.gameMode === 'single' ? 'Computer' : 'Player 2';
            if (plot.upgraded) {
                plotDiv.classList.add('upgraded');
                plotDiv.innerHTML = '🌽⭐';
                plotDiv.title = `${ownerLabel} upgraded farm (3x production)`;
            } else {
                plotDiv.innerHTML = '🌽';
                plotDiv.title = `${ownerLabel} farm`;

                // In two-player mode, allow Player 2 to upgrade their plots
                if (upgradeMode === 'computer' && gameState.currentPlayer === 'computer' && gameState.gameMode === 'two-player') {
                    plotDiv.classList.add('upgradeable');
                    plotDiv.style.cursor = 'pointer';
                    plotDiv.onclick = () => upgradePlot(plot.id, 'computer');
                    plotDiv.title = 'Click to upgrade ($40)';
                }
            }
        } else {
            plotDiv.classList.add('empty');
            plotDiv.title = `Empty land - Click to buy ($${gameState.emptyLandCost})`;
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
