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
2. Both you and the computer start with:
   - $100 in money
   - 3 farm plots
   - 1x productivity (baseline technology)
3. You have **20 turns** to maximize your total profit
4. The player with the highest total profit at the end wins!

### Game Mechanics

**⏭️ Next Turn (Harvest & Sell)**
- Both you and the computer harvest crops
- Crops = Land Plots × 10 crops/plot × Productivity Level
- Each crop sells for $5
- Computer takes its turn automatically
- Purchase counter resets to 3 for next turn
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

**🔬 Upgrade Technology**
- Improves farming productivity by 0.5x per upgrade
- Costs $100 (increases with each upgrade)
- Makes each plot produce more crops
- Does NOT count toward purchase limit
- The smart computer calculates ROI before upgrading

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
   - Watch both you and the computer harvest crops
   - Notice the profit race heating up

2. **Phase 2 - Technology Race**
   - Upgrade your farming technology
   - See how each plot becomes MORE productive
   - Computer upgrades too - stay competitive!

3. **Phase 3 - Land Rush & The Paradox**
   - Even though you COULD produce more with fewer plots...
   - It's more profitable to buy empty land and expand!
   - Watch as empty land and forests disappear
   - Computer prioritizes cheap empty land over expensive forests
   - When empty land runs out, forests start getting cleared
   - Total land use INCREASES despite improved efficiency

4. **Phase 4 - Game End & Analysis**
   - After 20 turns, see who has the highest profit
   - Check the "Jevons Paradox Alert" panel
   - Review the "Land Use Over Time" graph showing both players
   - See how competition and efficiency drove deforestation and expansion

## 📊 Understanding Your Dashboard

### Player Stats Panel (Green Border)
- **💰 Money**: Your available funds
- **🏆 Total Profit**: Your cumulative earnings (this determines the winner!)
- **🏞️ Land Plots**: Number of plots you own
- **📊 Productivity**: Your technology multiplier

### Computer Stats Panel (Red Border)
- Shows the same stats for your AI opponent
- Compare to see who's winning
- **Smart AI Strategy**: The computer calculates ROI for every decision
  - Prioritizes cheap empty land early game
  - Upgrades tech when it's profitable
  - Aggressively expands in mid-game
  - Can make multiple purchases per turn
  - Switches to forests when empty land runs out

### Game Info Panel
- **Turn counter**: Shows current turn out of 20
- **Purchases Left**: Shows remaining purchases this turn (max 3)
- Displays adjacency requirement reminder

### Farm Grid
- **🌾 Green/Blue plots**: Your active farmland
- **🌽 Pink/Yellow plots**: Computer's farmland
- **Gray dashed plots**: Empty land - Click if adjacent to buy for $30!
- **🌲 Forest plots**: Click if adjacent to convert for $60!
- Hover over any plot to see details
- Only adjacent plots to your turn-start land are purchasable

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

1. **Economic Incentives**: How profitability drives decision-making
2. **Competitive Pressure**: How competition accelerates resource consumption
3. **Rebound Effects**: Why efficiency doesn't always reduce consumption
4. **Deforestation Economics**: Why forests disappear even when we don't "need" more land
5. **Historical Patterns**: Mirrors real agricultural expansion despite technological improvements
6. **Frontier Expansion**: How territory grows outward from existing settlements
7. **Resource Constraints**: Strategic planning under limited actions per turn
8. **Critical Thinking**: Challenges intuition about efficiency and conservation

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

1. Why don't farmers reduce their land use after improving productivity?
2. How does competition between players accelerate deforestation in the game?
3. If you played cooperatively instead of competitively, would forests survive better?
4. What would need to change to prevent the paradox? (e.g., land use regulations, profit caps, carbon taxes)
5. How does the Jevons Paradox relate to environmental sustainability and climate change?
6. Can you think of modern technology examples where efficiency led to MORE consumption?
7. Is the Jevons Paradox always a bad thing? When might increased consumption be beneficial?
8. How does the game mirror real-world deforestation in the Amazon or Southeast Asia?

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

1. ✅ Define the Jevons Paradox
2. ✅ Explain how efficiency can increase consumption
3. ✅ Understand economic incentives in resource use
4. ✅ Recognize how competition accelerates resource exploitation
5. ✅ Connect the paradox to deforestation and environmental issues
6. ✅ Apply the concept to real-world scenarios
7. ✅ Think critically about technology and sustainability
8. ✅ Understand why market forces alone may not protect resources

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
