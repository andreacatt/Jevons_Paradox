# 🌾 Farming on the frontier: The Jevons Paradox 🌾

An interactive educational game that teaches the Jevons Paradox through agricultural economics. Compete against a smart AI opponent to see who can maximize profits while witnessing the paradox in action!

## 🎯 What is the Jevons Paradox?

The **Jevons Paradox** (named after economist William Stanley Jevons) states that as technological improvements increase the efficiency with which a resource is used, the total consumption of that resource may actually **increase** rather than decrease.

### In Agriculture:

1. **Better Technology** → More crops per acre (higher productivity)
2. **Higher Productivity** → More profit per acre
3. **More Profit** → Greater incentive to farm MORE land
4. **Result**: Total land use **INCREASES** even though you could produce the same amount on less land!

## 🎮 How to Play

### Getting Started

1. Open `index.html` in any modern web browser
2. **Choose your game mode:**
   - **Single Player**: Play against a smart AI opponent
   - **Two Players**: Local multiplayer (share the same device)
3. Both players start with:
   - $100 in money
   - 3 farm plots on a 6x6 grid (36 total plots)
   - No upgraded plots initially
4. You have **20 turns** to maximize your total profit
5. **Game ends when:** Either 20 turns complete OR all 36 plots are cultivated
6. The player with the highest total profit at the end wins!

### Game Mechanics

**⏭️ Next Turn (Harvest & Sell)**
- Both players harvest crops from all their plots
- Crops = Land Plots × 10 crops/plot × (1.5x if upgraded, 1x if not)
- **Downward Sloping Demand Curve:** Crop price decreases as total agricultural supply increases!
  - Formula: Price = $10 - ($0.15 × Total Cultivated Plots)
  - At game start (6 plots): ~$9.10 per crop
  - At mid-game (18 plots): ~$7.30 per crop
  - At end-game (36 plots): ~$4.60 per crop
- This demonstrates how expanding production drives down prices for everyone
- In single-player mode, computer takes its turn automatically
- Purchase counter resets to 3 for next turn
- Upgrade availability resets (can upgrade again next turn)
- Check who's winning in the profit race!

**🏜️ Buy Empty Land**
- Click on any gray empty plot to purchase it
- Costs $30 per plot (cheapest option!)
- **MUST be adjacent** to land you owned at start of turn (up/down/left/right)
- **Maximum 3 purchases per turn**
- Best ROI for expanding your farm
- Computer will aggressively buy empty land too

**🌲 Convert Forest to Farmland**
- Click on any green forest plot (🌲) to convert it
- Costs $60 per forest plot (twice as expensive as empty land!)
- **MUST be adjacent** to land you owned at start of turn (up/down/left/right)
- **Counts toward 3 purchase limit**
- Forests are strategically placed in the center of the grid
- Less profitable than buying empty land
- But sometimes the only option when adjacent empty land runs out

**🔬 Upgrade Plots (Technology Improvement)**
- Click "Upgrade Plots" button to enter upgrade mode
- **Once per turn only** - You can only upgrade during one action per turn
- **Select up to 3 plots** to upgrade by clicking on your unupgraded plots
- **Costs $40 per plot** upgraded (total: $40, $80, or $120 depending on how many you upgrade)
- **Upgraded plots produce 1.5x crops** (15 crops instead of 10)
- **Permanent upgrade** - Plots stay upgraded for the rest of the game
- **Cannot upgrade same plot twice** - Once upgraded, that plot stays at 1.5x
- Does NOT count toward the 3 purchase limit (upgrades are separate from land purchases)
- Look for the ⭐ star symbol on upgraded plots
- The smart AI calculates ROI before upgrading, balancing tech investment vs expansion

### Important Expansion Rules

**Adjacency Requirement:**
- New plots must touch land you owned at the START of the current turn
- Touching = directly up, down, left, or right (not diagonal)
- You expand outward from your existing territory, like real frontier farming
- You cannot "jump" across the map to grab isolated plots

**Purchase Limit:**
- Maximum 3 land purchases per turn (empty land + forests combined)
- Resets every turn
- Technology upgrades don't count toward this limit
- Plan your expansion strategy carefully!
- Computer follows the same rules

### Experiencing the Paradox

1. **Phase 1 - Competition Begins**
   - Play a few turns to earn initial money
   - Watch both players harvest crops and compete for profit
   - Notice the crop price displayed ($9.10 per crop initially)
   - Observe how the profit race heats up

2. **Phase 2 - Technology vs Expansion Decision**
   - You can upgrade up to 3 plots per turn for $40 each
   - Upgraded plots produce 50% more crops (15 instead of 10)
   - **Critical Choice:** Invest in upgrades OR expand to new land?
   - Computer AI weighs this tradeoff carefully
   - Watch the dynamic price change as more land gets cultivated

3. **Phase 3 - The Price Collapse & Land Rush**
   - As both players expand, watch crop prices FALL (shown in info box)
   - **The Paradox Emerges:** Even with falling prices, expansion continues!
   - Why? Because each new plot still adds profit (just less than before)
   - Both players race to grab cheap empty land ($30)
   - Computer prioritizes empty land over expensive forests ($60)
   - Total land use INCREASES despite:
     - Improved efficiency (upgraded plots)
     - Falling prices (less profit per crop)
     - The ability to produce more on less land

4. **Phase 4 - End Game & The Full Paradox**
   - When empty land runs out, forests start getting cleared
   - Game ends at turn 20 OR when all 36 plots are cultivated
   - Check who has the highest total profit
   - Review the "Land Use Over Time" graph showing both players' expansion
   - Notice how prices dropped from ~$9 to ~$5 as the grid filled up
   - **The lesson:** Competition + efficiency improvements drove MAXIMUM resource consumption, not conservation!

## 📊 Understanding Your Dashboard

### Player Stats Panel (Green Border)
- **💰 Money**: Your available funds to spend
- **🏆 Total Profit**: Your cumulative earnings (this determines the winner!)
- **🏞️ Land Plots**: Number of plots you own
- **📊 Upgraded**: Number of plots with technology upgrades (⭐ plots produce 1.5x)

### Player 2 / Computer Stats Panel (Red Border)
- Shows the same stats for your opponent (AI in single-player, Player 2 in two-player mode)
- Compare to see who's winning the profit race
- **Smart AI Strategy** (single-player mode): The computer calculates ROI for every decision
  - Prioritizes cheap empty land early game
  - Upgrades plots only when ROI justifies the $40/plot cost
  - Balances expansion vs technology improvement
  - Aggressively expands in mid-game when prices are still good
  - Makes up to 3 purchases per turn
  - Switches to forests when adjacent empty land runs out
  - Follows same adjacency and purchase limit rules

### Game Info Panel
- **Turn counter**: Shows current turn out of 20
- **Purchases Left**: Shows remaining land purchases this turn (max 3)
- **Cultivated**: Total plots farmed by both players out of 36
- Displays adjacency requirement reminder
- Shows max 3 plots/turn rule

### Farm Grid (6x6 = 36 Total Plots)
- **🌾 Green/Blue plots**: Your active farmland (normal productivity)
- **🌾⭐ Plots with star**: Your upgraded farmland (1.5x productivity)
- **🌽 Pink/Yellow plots**: Opponent's farmland (normal productivity)
- **🌽⭐ Opponent's upgraded plots**: Opponent's upgraded farmland (1.5x)
- **Gray dashed plots**: Empty land - Click if adjacent to buy for $30!
- **🌲 Forest plots**: Click if adjacent to convert for $60!
- **Golden pulsing border**: During upgrade mode, shows which of your plots can be upgraded
- Hover over any plot to see details
- Only plots adjacent to your turn-start land are purchasable
- Game fills up quickly - all 36 plots can be cultivated in ~12-15 turns!

### Land Use Graph
- Tracks both player (green line) and computer (red line)
- Shows how land use changes over 20 turns
- Visual proof of the paradox in action
- Watch both lines rise as efficiency improves!

### Insights Panel
- Real-time competitive analysis
- Shows who's ahead in the profit race
- Tracks total land use and deforestation
- Explains why expansion continues despite efficiency

## 🎓 Educational Objectives

This game demonstrates:

1. **Economic Incentives**: How profitability drives decision-making even with diminishing returns
2. **Competitive Pressure**: How competition accelerates resource consumption in a race to maximize profit
3. **Downward Sloping Demand**: How increased supply drives down prices for everyone (market dynamics)
4. **Rebound Effects**: Why efficiency improvements don't reduce consumption - they enable MORE consumption
5. **Investment Tradeoffs**: Choosing between upgrading existing resources vs expanding to new ones
6. **Deforestation Economics**: Why forests disappear even when we don't "need" more land
7. **Historical Patterns**: Mirrors real agricultural expansion despite technological improvements
8. **Frontier Expansion**: How territory grows outward from existing settlements (adjacency mechanics)
9. **Resource Constraints**: Strategic planning under limited actions per turn (max 3 purchases, once-per-turn upgrades)
10. **Game Theory**: How two-player competition differs from single-player optimization
11. **Critical Thinking**: Challenges intuition about efficiency and conservation
12. **Price Elasticity**: How expanding production affects market prices and profitability

## 🌍 Real-World Examples

### Historical Agricultural Context
- **1960-2010**: Global crop yields increased ~150-200%
- **Same period**: Agricultural land use EXPANDED by ~12%
- **Why?** Higher productivity made farming more profitable globally
- **Result**: More land converted to agriculture, not less
- **Deforestation**: Amazon rainforest loses 10,000+ km² annually to agriculture
- **Competition**: Countries compete for agricultural exports, driving expansion

### Other Examples of Jevons Paradox
- **Fuel Efficiency**: More efficient cars → more driving
- **LED Lighting**: Cheaper light → more lights used
- **Data Storage**: Cheaper storage → more data stored
- **Internet Speed**: Faster connections → more data consumption

## 💡 Discussion Questions for Students

1. Why don't farmers reduce their land use after improving productivity (upgrading plots)?
2. How does competition between players accelerate deforestation in the game?
3. Watch the crop price fall from ~$9 to ~$5 as you play. Why does expansion continue even with falling prices?
4. In the game, is it better to upgrade existing plots or buy new land? How does this decision change as the game progresses?
5. If you played cooperatively instead of competitively, would forests survive better? What if you agreed to limit expansion?
6. Compare single-player mode vs two-player mode. Does human competition lead to faster deforestation than AI competition?
7. What would need to change to prevent the paradox? (e.g., land use regulations, profit caps, environmental taxes)
8. How does the Jevons Paradox relate to environmental sustainability and climate change?
9. Can you think of modern technology examples where efficiency led to MORE consumption?
10. Is the Jevons Paradox always a bad thing? When might increased consumption be beneficial?
11. How does the game mirror real-world deforestation in the Amazon or Southeast Asia?
12. What happens when all 36 plots are cultivated? How does this relate to real-world resource limits?
13. Does the downward sloping demand curve make the game more realistic? How does it affect your strategy?

## 🛠️ Technical Details

### Built With
- **HTML5**: Structure and content
- **CSS3**: Styling and animations
- **Vanilla JavaScript**: Game logic and interactions
- **Canvas API**: Chart rendering

### Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- No external dependencies required
- Responsive design for different screen sizes

## 📚 Further Learning

### Recommended Resources
- William Stanley Jevons: "The Coal Question" (1865) - Original work
- Papers on rebound effects in energy efficiency
- Studies on agricultural land use and productivity
- Environmental economics textbooks

### Related Economic Concepts
- **Rebound Effect**: Behavioral response to efficiency improvements
- **Induced Demand**: How increased supply stimulates more demand
- **Marginal Productivity**: Value of each additional unit of input

## 🎯 Learning Outcomes

After playing this game, students should be able to:

1. ✅ Define the Jevons Paradox and explain it with examples
2. ✅ Explain how efficiency improvements can increase resource consumption
3. ✅ Understand economic incentives in resource use decisions
4. ✅ Recognize how competition accelerates resource exploitation
5. ✅ Understand downward sloping demand curves and market dynamics
6. ✅ Analyze tradeoffs between upgrading existing resources vs expanding
7. ✅ Connect the paradox to deforestation and environmental issues
8. ✅ Apply the concept to real-world scenarios (agriculture, energy, technology)
9. ✅ Think critically about technology and sustainability
10. ✅ Understand why market forces alone may not protect resources
11. ✅ Recognize how strategic constraints (adjacency, purchase limits) affect behavior
12. ✅ Compare competitive vs cooperative resource management strategies

## 🤝 Contributing

This is an educational tool. Feel free to:
- Modify game parameters to explore different scenarios
- Add new features (e.g., environmental costs, regulations)
- Create variations for other resource contexts
- Adapt for different grade levels

## 📄 License

This educational game is provided for learning purposes.

---

**Have fun learning about economic paradoxes! 🌾📈**

*"It is wholly a confusion of ideas to suppose that the economical use of fuel is equivalent to a diminished consumption. The very contrary is the truth."* - William Stanley Jevons, 1865
